const express = require('express');
const router = express.Router();
const roleController = require('./roleController');
// Middleware (ensure these authenticators are imported correctly)
const term = require('../../middlewares/authMiddleware');
const requireAuth = term.authenticate;
const requireRole = term.authorizeRole;

// Base path: /api/v1/admin/roles

// List Roles
router.get('/', requireAuth, requireRole(['Super Admin', 'Admin']), roleController.listRoles);

// List All Permissions (mounted at /roles/permissions)
router.get('/permissions', requireAuth, requireRole(['Super Admin', 'Admin']), roleController.listPermissions);

// Create Role (Super Admin only)
router.post('/', requireAuth, requireRole(['Super Admin']), roleController.createRole);

// Update Role (Super Admin only)
router.put('/:id', requireAuth, requireRole(['Super Admin']), roleController.updateRole);

// Delete Role (Super Admin only)
router.delete('/:id', requireAuth, requireRole(['Super Admin']), roleController.deleteRole);

// Permissions List (for UI)
// Actually this might be simpler as /permissions, but mounting under roles seems okay or separate.
// Let's expose it as /api/v1/admin/permissions via a separate mounting or sub-route here if base path is flexible.
// Since we will mount this file at /api/v1/admin/roles, we can't easily do /permissions unless we do `../permissions`.
// Better to export router and perhaps permissionRouter if needed, or just handle it here.
// NOTE: I will mount this at /api/v1/admin/roles.
// Start of permissions route:
// router.get('/permissions', ...) -> /api/v1/admin/roles/permissions ? No.
// Let's rely on main `routes.js` to mount permissions separately or just put it here.
// I'll add it here but it will be /api/v1/admin/roles/permissions (not ideal REST but functional).
// OR, I create `permissionsRoutes.js`.
// Let's stick effectively to:
// GET /api/v1/admin/permissions -> mapped in routes.js to roleController.listPermissions

module.exports = router;
