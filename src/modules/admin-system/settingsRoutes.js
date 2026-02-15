const express = require('express');
const router = express.Router();
const settingsController = require('./settingsController');
const { authenticate } = require('../../middlewares/authMiddleware');
const { checkPermission } = require('../../middlewares/permissionMiddleware');

router.use(authenticate);

// Custom middleware: Allow specific roles OR check for permission
const allowSettingsAccess = (permission) => {
  return (req, res, next) => {
    // Explicitly allow Financial Manager, Super Admin, Admin, Moderator (Safety), Support Agent
    if (['Financial Manager', 'Super Admin', 'Admin', 'Moderator', 'Support Agent'].includes(req.role)) {
      return next();
    }
    // Otherwise fallback to strict permission check
    return checkPermission(permission)(req, res, next);
  };
};

// Get Settings
router.get('/:category?', allowSettingsAccess('settings:read'), settingsController.getSettings);

// Update Settings
router.patch('/:category?', allowSettingsAccess('settings:write'), settingsController.updateSettings);

// Backup Route (Strictly Super Admin Only)
router.post('/backup', 
  (req, res, next) => {
    if (req.role !== 'Super Admin') return res.status(403).json({ error: 'Only Super Admin can trigger backups' });
    next();
  },
  settingsController.triggerBackup
);

module.exports = router;
