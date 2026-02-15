const express = require('express');
const router = express.Router();
const notificationController = require('./notificationController');
const { authenticate, authorizeRole } = require('../../middlewares/authMiddleware'); // checkPermission not exported from authMiddleware usually
const { checkPermission } = require('../../middlewares/permissionMiddleware');

router.use(authenticate);

// Admin Alerts
router.get('/alerts', notificationController.getAdminNotifications);
// Old route kept for backward compatibility if needed, but we start using new ones
router.put('/alerts/read', notificationController.markAsRead); 

// Custom middleware to allow Support Agent access to notifications
const allowNotificationAccess = (req, res, next) => {
    // All authenticated admins/staff should ideally be able to read their own notifications
    // But since we use specific permission check, we bypass for role
    if (req.user.role.name === 'Support Agent' || req.user.role.name === 'Financial Manager' || req.user.role.name === 'Content Manager' || req.user.role.name === 'Super Admin' || req.user.role.name === 'Admin') {
        return next();
    }
    return checkPermission('notifications:read')(req, res, next);
};

// Mark all as read
router.patch('/read-all', allowNotificationAccess, notificationController.markAsRead);

// Mark single as read
router.patch('/:id/read', allowNotificationAccess, notificationController.markOneRead);

router.post('/alerts', notificationController.createAdminAlert); // For testing
router.post('/alerts', notificationController.createAdminAlert); // For testing

// Push Campaigns (Content Manager)
const requireContent = authorizeRole(['Super Admin', 'Admin', 'Content Manager']);

router.get('/campaigns', requireContent, notificationController.listCampaigns);
router.post('/campaigns', requireContent, notificationController.createCampaign);

module.exports = router;
