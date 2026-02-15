const Joi = require('joi');
const bcrypt = require('bcryptjs');
const { Admin, AdminSession, Role, Permission, AdminActivityLog } = require('../../database/models');
const { generateTokens, verifyToken } = require('../../config/jwt');
const { getCache, setCache, delCache } = require('../../config/redis');

// Login Validation Schema
const loginSchema = Joi.object({
  email: Joi.string().email().required().messages({
    'string.email': 'Please provide a valid email address',
    'any.required': 'Email is required'
  }),
  password: Joi.string().required().messages({
    'any.required': 'Password is required'
  })
});

/**
 * Admin Login
 * POST /api/v1/admin/auth/login
 */
async function login(req, res) {
  try {
    // 1. Validate Input
    const { email, password } = await loginSchema.validateAsync(req.body);

    // 2. Find Admin by Email
    const admin = await Admin.findOne({
      where: { email },
      include: [
        {
          model: Role,
          as: 'role',
          include: [
            {
              model: Permission,
              as: 'permissions',
              through: { attributes: [] } // Exclude join table
            }
          ]
        }
      ]
    });

    // 3. Check if Admin exists and is active
    if (!admin) {
      return res.status(401).json({
        success: false,
        error: { code: 'AUTH_FAILED', message: 'Invalid credentials' }
      });
    }

    if (!admin.is_active) {
      return res.status(403).json({
        success: false,
        error: { code: 'ACCOUNT_DISABLED', message: 'Your account has been disabled' }
      });
    }

    // 4. Verify Password
    const isPasswordValid = await bcrypt.compare(password, admin.password_hash);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        error: { code: 'AUTH_FAILED', message: 'Invalid credentials' }
      });
    }

    // 5. Generate Tokens
    const { accessToken, refreshToken, jti } = generateTokens(admin);

    // 6. Create Session
    const session = await AdminSession.create({
      admin_id: admin.id,
      refresh_token: refreshToken,
      access_token_jti: jti,
      ip_address: req.ip,
      user_agent: req.headers['user-agent'],
      expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
    });

    // 7. Update Last Login
    await admin.update({
      last_login_at: new Date(),
      last_login_ip: req.ip
    });

    // 8. Log Activity
    await AdminActivityLog.create({
      admin_id: admin.id,
      action: 'auth.login',
      resource_type: 'admin',
      resource_id: admin.id,
      ip_address: req.ip,
      user_agent: req.headers['user-agent'],
      details: { method: 'password' }
    });

    // 8. Prepare Response (Exclude password)
    const adminData = admin.toJSON();
    delete adminData.password_hash;
    delete adminData.mfa_secret;

    // 9. Cache Permissions (Optional optimization)
    // await setCache(`admin_perms:${admin.id}`, admin.role.permissions, 900);

    return res.status(200).json({
      success: true,
      data: {
        access_token: accessToken,
        refresh_token: refreshToken,
        admin: {
          ...adminData,
          role_name: admin.role ? admin.role.name : 'User',
          role_id: admin.role_id,
          permissions: admin.role ? admin.role.permissions.map(p => p.code) : []
        }
      }
    });

  } catch (error) {
    if (error.isJoi) {
      return res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: error.details[0].message }
      });
    }
    console.error('Login Error:', error);
    return res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Login failed', details: error.message }
    });
  }
}

/**
 * Refresh Token
 * POST /api/v1/admin/auth/refresh
 */
async function refresh(req, res) {
  try {
    const { refresh_token } = req.body;

    if (!refresh_token) {
      return res.status(400).json({
        success: false,
        error: { code: 'MISSING_TOKEN', message: 'Refresh token is required' }
      });
    }

    // 1. Find Session
    const session = await AdminSession.findOne({
      where: { refresh_token, is_revoked: false }
    });

    if (!session) {
      return res.status(401).json({
        success: false,
        error: { code: 'INVALID_SESSION', message: 'Session not found or revoked' }
      });
    }

    // 2. Check Expiry
    if (new Date() > session.expires_at) {
      return res.status(401).json({
        success: false,
        error: { code: 'SESSION_EXPIRED', message: 'Session expired' }
      });
    }

    // 3. Verify Token Signature
    const payload = verifyToken(refresh_token, true); // true = check refresh secret
    if (!payload) {
      return res.status(401).json({
        success: false,
        error: { code: 'INVALID_TOKEN', message: 'Invalid refresh token' }
      });
    }

    // 4. Find Admin
    const admin = await Admin.findByPk(session.admin_id, {
      include: [{ model: Role, as: 'role' }]
    });

    if (!admin || !admin.is_active) {
      return res.status(403).json({
        success: false,
        error: { code: 'ACCOUNT_DISABLED', message: 'Account disabled' }
      });
    }

    // 5. Rotate Tokens (Security Best Practice)
    // Revoke old session
    await session.update({ is_revoked: true });

    // Generate new tokens
    const { accessToken: newAccessToken, refreshToken: newRefreshToken, jti } = generateTokens(admin);

    // Create new session
    await AdminSession.create({
      admin_id: admin.id,
      refresh_token: newRefreshToken,
      access_token_jti: jti,
      ip_address: req.ip,
      user_agent: req.headers['user-agent'],
      expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    });

    return res.status(200).json({
      success: true,
      data: {
        access_token: newAccessToken,
        refresh_token: newRefreshToken
      }
    });

  } catch (error) {
    console.error('Refresh Error:', error);
    return res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Refresh failed' }
    });
  }
}

/**
 * Logout
 * POST /api/v1/admin/auth/logout
 */
async function logout(req, res) {
  try {
    const { refresh_token } = req.body;

    if (refresh_token) {
      await AdminSession.update(
        { is_revoked: true },
        { where: { refresh_token } }
      );
    }

    return res.status(200).json({
      success: true,
      message: 'Logged out successfully'
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      error: { code: 'LOGOUT_ERROR', message: 'Logout failed' }
    });
  }
}

/**
 * Get Current Admin Profile
 * GET /api/v1/admin/auth/me
 */
async function getMe(req, res) {
  try {
    // req.user is populated by authenticate middleware
    const admin = await Admin.findByPk(req.user.id, {
      include: [
        {
          model: Role,
          as: 'role',
          include: [
            {
              model: Permission,
              as: 'permissions',
              through: { attributes: [] }
            }
          ]
        }
      ],
      attributes: { exclude: ['password_hash', 'mfa_secret'] }
    });

    if (!admin) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Admin not found' }
      });
    }

    return res.json({
      success: true,
      data: { admin }
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch profile' }
    });
  }
}

module.exports = {
  login,
  refresh,
  logout,
  getMe
};
