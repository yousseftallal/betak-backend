const express = require('express');
const router = express.Router();
const adminsController = require('./adminsController');
const { authenticate } = require('../../middlewares/authMiddleware');
const { checkPermission } = require('../../middlewares/permissionMiddleware');

router.use(authenticate);

// Create new admin (Restricted to 'admins:create' which usually only Super Admin has)
router.post('/', checkPermission('admins:create'), adminsController.createAdmin);

// List admins (Restricted to 'admins:read')
router.get('/', checkPermission('admins:read'), adminsController.listAdmins);

// Delete admin (Restricted to 'admins:delete')
router.delete('/:id', checkPermission('admins:delete'), adminsController.deleteAdmin);

module.exports = router;
