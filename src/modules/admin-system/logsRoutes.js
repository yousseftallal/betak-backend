const express = require('express');
const router = express.Router();
const adminLogsController = require('./adminLogsController');
const { authenticate } = require('../../middlewares/authMiddleware');
const { checkPermission } = require('../../middlewares/permissionMiddleware');

router.use(authenticate);

// List Logs - Requires broad admin access or specific permission
// Assuming 'logs:read' or simply ensuring they are admin
router.get('/', checkPermission('logs:read'), adminLogsController.listLogs);

module.exports = router;
