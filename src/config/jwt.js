const jwt = require('jsonwebtoken');
const crypto = require('crypto');

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_ACCESS_EXPIRES_IN = process.env.JWT_ACCESS_EXPIRES_IN || '24h';
const JWT_REFRESH_EXPIRES_IN = process.env.JWT_REFRESH_EXPIRES_IN || '30d';

/**
 * Generate JWT access token
 * @param {Object} payload - Token payload (admin_id, role, permissions)
 * @returns {string} JWT access token
 */
function generateAccessToken(payload) {
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: JWT_ACCESS_EXPIRES_IN,
    issuer: 'betak-admin',
    audience: 'betak-dashboard'
  });
}

/**
 * Generate JWT refresh token
 * @param {Object} payload - Token payload (admin_id)
 * @returns {string} JWT refresh token
 */
function generateRefreshToken(payload) {
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: JWT_REFRESH_EXPIRES_IN,
    issuer: 'betak-admin',
    audience: 'betak-dashboard'
  });
}

/**
 * Verify JWT token
 * @param {string} token - JWT token to verify
 * @returns {Object} Decoded token payload
 */
function verifyToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET, {
      issuer: 'betak-admin',
      audience: 'betak-dashboard'
    });
  } catch (error) {
    throw new Error('Invalid or expired token');
  }
}

/**
 * Generate both access and refresh tokens
 * @param {Object} user - User/Admin object
 * @returns {Object} { accessToken, refreshToken, jti }
 */
function generateTokens(user) {
  const jti = crypto.randomUUID();

  const payload = {
    sub: user.id,
    role: user.role?.name || user.role_id, // Adjust based on your role structure
    jti: jti
  };

  const accessToken = jwt.sign(payload, JWT_SECRET, {
    expiresIn: JWT_ACCESS_EXPIRES_IN,
    issuer: 'betak-admin',
    audience: 'betak-dashboard'
  });

  const refreshToken = jwt.sign({ sub: user.id, jti }, JWT_SECRET, {
    expiresIn: JWT_REFRESH_EXPIRES_IN,
    issuer: 'betak-admin',
    audience: 'betak-dashboard'
  });

  return { accessToken, refreshToken, jti };
}

module.exports = {
  generateAccessToken,
  generateRefreshToken,
  generateTokens, // Exported now
  verifyToken,
  JWT_SECRET,
  JWT_ACCESS_EXPIRES_IN,
  JWT_REFRESH_EXPIRES_IN
};
