const express = require('express');
const router = express.Router();
const userController = require('./userController');
const { authenticate } = require('../../middlewares/authMiddleware');
const { checkPermission } = require('../../middlewares/permissionMiddleware');

// All routes require authentication
router.use(authenticate);

// List Users (Requires 'users:read')
router.get('/', checkPermission('users:read'), userController.listUsers);

// Get Users by Segment (for Push Notifications targeting) - MUST come before /:id
router.get('/segment', checkPermission('users:read'), userController.getUsersBySegment);

// Get User Details (Requires 'users:read')
router.get('/:id', checkPermission('users:read'), userController.getUser);

// Suspend User (Requires 'users:suspend')
router.post('/:id/suspend', checkPermission('users:suspend'), userController.suspendUser);

// Ban User (Requires 'users:ban')
router.post('/:id/ban', checkPermission('users:ban'), userController.banUser);

// Restore User (Requires 'users:restore')
router.post('/:id/restore', checkPermission('users:restore'), userController.restoreUser);

// Ban User from Live (Requires 'users:suspend') - Reuse suspend permission or create new
router.post('/:id/live-ban', checkPermission('users:suspend'), userController.banFromLive);

module.exports = router;
