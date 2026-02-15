const express = require('express');
const router = express.Router();
const statsController = require('./statsController');
const { authenticate } = require('../../middlewares/authMiddleware');
const { checkPermission } = require('../../middlewares/permissionMiddleware');

router.use(authenticate);

// Custom middleware to ensure access for relevant roles
const allowAnalyticsAccess = (req, res, next) => {
    const allowedRoles = ['Super Admin', 'Admin', 'Financial Manager', 'Content Manager', 'Analyst', 'Support Agent'];
    if (allowedRoles.includes(req.user.role.name)) {
        return next();
    }
    return checkPermission('analytics:read')(req, res, next);
};

// Real-time Stats
router.get('/realtime', allowAnalyticsAccess, statsController.getRealtimeStats);

// Dashboard Overview (Home) - Requires read analytics
router.get('/overview', allowAnalyticsAccess, statsController.getDashboardOverview);

// Daily Stats History (Charts)
router.get('/daily', allowAnalyticsAccess, statsController.getDailyStats);

// Weekly/Peak/Trending
router.get('/peak-hours', allowAnalyticsAccess, statsController.getPeakHours);
router.get('/trending-creators', allowAnalyticsAccess, statsController.getTrendingCreators);
router.get('/demographics', allowAnalyticsAccess, statsController.getDemographics);
router.get('/revenue', allowAnalyticsAccess, statsController.getRevenueStats);

module.exports = router;
