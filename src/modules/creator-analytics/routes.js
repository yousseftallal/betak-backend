const express = require('express');
const router = express.Router();
const creatorController = require('./creatorController');
const { authenticate } = require('../../middlewares/authMiddleware');
const { checkPermission } = require('../../middlewares/permissionMiddleware');

router.use(authenticate);

// Platform Creator Analytics (Must be before /:id)
// Custom middleware to allow Content Manager access even if DB permissions aren't synced
const allowAnalyticsAccess = (req, res, next) => {
    // Allows Content Manager, Super Admin, and Admin
    if (req.user.role.name === 'Content Manager' || req.user.role.name === 'Super Admin' || req.user.role.name === 'Admin') {
        return next();
    }
    return checkPermission('analytics:read')(req, res, next);
};

router.get('/analytics', allowAnalyticsAccess, creatorController.getCreatorAnalytics);

// List Creators
router.get('/', checkPermission('users:read'), creatorController.listCreators); 

// Top Creators (Must be before /:id)
router.get('/top', checkPermission('analytics:read'), creatorController.getTopCreators); 

// Get Details
router.get('/:id', checkPermission('users:read'), creatorController.getCreatorDetails);

// Get Revenue (Sensitive)
router.get('/:id/revenue', checkPermission('analytics:read'), creatorController.getCreatorRevenue);

// Get Daily Activity
router.get('/:id/daily-activity', checkPermission('analytics:read'), creatorController.getCreatorDailyActivity);

// Verify Creator
router.post('/:id/verify', checkPermission('users:read'), creatorController.verifyCreator);

module.exports = router;
