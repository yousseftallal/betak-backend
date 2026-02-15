const { verifyToken } = require('../config/jwt');
const { Admin, User, Role, Permission } = require('../database/models');

/**
 * Middleware to protect admin routes (looks up Admin table)
 */
const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        error: { code: 'NO_TOKEN', message: 'Authentication required' }
      });
    }

    const token = authHeader.split(' ')[1];
    const payload = verifyToken(token);
    if (!payload) {
      return res.status(401).json({
        success: false,
        error: { code: 'INVALID_TOKEN', message: 'Invalid or expired token' }
      });
    }

    const adminId = payload.sub || payload.id;
    if (!adminId) {
      return res.status(401).json({
        success: false,
        error: { code: 'INVALID_TOKEN', message: 'Token missing user ID' }
      });
    }

    const admin = await Admin.findByPk(adminId, {
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
      ]
    });

    if (!admin || !admin.is_active) {
      return res.status(403).json({
        success: false,
        error: { code: 'ACCESS_DENIED', message: 'Account disabled or not found' }
      });
    }

    if (!admin.role) {
      return res.status(403).json({
        success: false,
        error: { code: 'NO_ROLE', message: 'Admin has no role assigned' }
      });
    }

    req.user = admin;
    req.role = admin.role.name;
    req.permissions = admin.role.permissions ? admin.role.permissions.map(p => p.code) : [];

    next();

  } catch (error) {
    console.error('Auth Middleware Error:', error.message);

    if (error.message === 'Invalid or expired token' || error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        error: { code: 'INVALID_TOKEN', message: 'Invalid or expired token' }
      });
    }

    return res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Authentication failed' }
    });
  }
};

/**
 * Middleware to protect mobile app routes (looks up User table)
 */
const authenticateUser = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        error: { code: 'NO_TOKEN', message: 'Authentication required' }
      });
    }

    const token = authHeader.split(' ')[1];

    // Verify token (ignore audience for mobile tokens)
    let payload;
    try {
      const jwt = require('jsonwebtoken');
      payload = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      return res.status(401).json({
        success: false,
        error: { code: 'INVALID_TOKEN', message: 'Invalid or expired token' }
      });
    }

    const userId = payload.sub || payload.id;
    if (!userId) {
      return res.status(401).json({
        success: false,
        error: { code: 'INVALID_TOKEN', message: 'Token missing user ID' }
      });
    }

    const user = await User.findByPk(userId);
    if (!user || user.status !== 'active') {
      return res.status(403).json({
        success: false,
        error: { code: 'ACCESS_DENIED', message: 'Account disabled or not found' }
      });
    }

    req.user = user;
    next();

  } catch (error) {
    console.error('User Auth Error:', error.message);
    return res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Authentication failed' }
    });
  }
};

/**
 * Middleware to check if user has required role
 */
const authorizeRole = (roles) => {
  return (req, res, next) => {
    if (!req.user || !req.role) {
      return res.status(403).json({
        success: false,
        error: { code: 'FORBIDDEN', message: 'User role not determined' }
      });
    }

    if (!roles.includes(req.role)) {
      return res.status(403).json({
        success: false,
        error: { code: 'FORBIDDEN', message: 'Insufficient permissions' }
      });
    }

    next();
  };
};

module.exports = { authenticate, authenticateUser, authorizeRole };
