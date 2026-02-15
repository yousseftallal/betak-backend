const express = require('express');
const router = express.Router();

// Admins
router.use('/admins', require('./adminsRoutes'));

// Roles & Permissions
router.use('/roles', require('./rolesRoutes'));
// We need to permit accessing permissions. We can export listPermissions from roleController.
// However, creating a separate route file for 1 endpoint is overkill. 
// I'll add /permissions to rolesRoutes for now but mount it carefully? 
// No, I'll allow /roles/meta/permissions or similar, or just mount /permissions to a handler.
// Simpler: Just add /permissions router here inline or to rolesRoutes as logic.
// Let's add `router.get('/permissions', roleController.listPermissions)` to rolesRoutes.js 
// BUT wait, rolesRoutes is mounted at /roles. So it becomes /roles/permissions. That's fine.

// Logs
router.use('/logs', require('./logsRoutes'));

// Realtime Stats (Moved to platform-analytics)
const authController = require('./authController');
const rateLimit = require('express-rate-limit');
const { authenticate } = require('../../middlewares/authMiddleware');

// Rate Limiter for Login (Brute Force Protection)
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, 
  max: 100, // Increased for dev/testing
  message: {
    success: false,
    error: {
      code: 'TOO_MANY_ATTEMPTS',
      message: 'Too many login attempts, please try again after 15 minutes'
    }
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Routes
router.post('/login', loginLimiter, authController.login);
router.post('/refresh', authController.refresh);
router.post('/logout', authController.logout);
router.get('/me', authenticate, authController.getMe);

module.exports = router;
