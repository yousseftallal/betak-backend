const express = require('express');
const router = express.Router();
const reportController = require('./reportController');
const { authenticate } = require('../../middlewares/authMiddleware');
const { checkPermission } = require('../../middlewares/permissionMiddleware');

router.use(authenticate);

// Create Report (Public for Auth Users)
router.post('/', reportController.createReport);

// Custom middleware to allow Support Agent access
const allowReportAccess = (req, res, next) => {
    // Support Agent needs read access
    if (req.user.role.name === 'Support Agent' || req.user.role.name === 'Super Admin' || req.user.role.name === 'Admin') {
        return next();
    }
    return checkPermission('reports:read')(req, res, next);
};

// List Reports
router.get('/', allowReportAccess, reportController.listReports);

// Stats (Most Reported)
router.get('/stats/users', allowReportAccess, reportController.getMostReportedUsers);
router.get('/stats/videos', allowReportAccess, reportController.getMostReportedVideos);

// Get Report Details
router.get('/:id', allowReportAccess, reportController.getReportdetails);

// Update Status (Resolve/Ignore)
// Includes 'reports:review' and 'reports:dismiss' check in logic or broad permission
router.post('/:id/status', checkPermission(['reports:review', 'reports:dismiss']), reportController.updateReportStatus);

module.exports = router;
