const { Role, Permission, RolePermission, sequelize } = require('../../database/models');

/**
 * List all roles with their permissions
 * GET /api/v1/admin/roles
 */
exports.listRoles = async (req, res) => {
    try {
        const roles = await Role.findAll({
            include: [{
                model: Permission,
                as: 'permissions', // Ensure association matches model definition
                attributes: ['id', 'name', 'slug']
            }],
            order: [['id', 'ASC']]
        });

        return res.json({
            success: true,
            data: roles
        });
    } catch (error) {
        console.error('List Roles Error:', error);
        return res.status(500).json({ success: false, message: 'Failed to fetch roles' });
    }
};

/**
 * Create a new role
 * POST /api/v1/admin/roles
 * Body: { name: "Support Agent", permissions: [1, 2, 5] }
 */
exports.createRole = async (req, res) => {
    const transaction = await sequelize.transaction();
    try {
        const { name, permissions } = req.body;

        if (!name) return res.status(400).json({ success: false, message: 'Role name is required' });

        const existingRole = await Role.findOne({ where: { name } });
        if (existingRole) {
            return res.status(409).json({ success: false, message: 'Role name already exists' });
        }

        const newRole = await Role.create({ name }, { transaction });

        if (permissions && permissions.length > 0) {
            // permissions is array of IDs
            await newRole.setPermissions(permissions, { transaction });
        }

        await transaction.commit();

        // Fetch again to include permissions
        const createdRole = await Role.findByPk(newRole.id, {
            include: [{ model: Permission, as: 'permissions' }]
        });

        return res.status(201).json({
            success: true,
            data: createdRole,
            message: 'Role created successfully'
        });

    } catch (error) {
        await transaction.rollback();
        console.error('Create Role Error:', error);
        return res.status(500).json({ success: false, message: 'Failed to create role' });
    }
};

/**
 * Update an existing role
 * PUT /api/v1/admin/roles/:id
 */
exports.updateRole = async (req, res) => {
    const transaction = await sequelize.transaction();
    try {
        const { id } = req.params;
        const { name, permissions } = req.body;

        const role = await Role.findByPk(id);
        if (!role) return res.status(404).json({ success: false, message: 'Role not found' });

        if (role.name === 'Super Admin') {
            return res.status(403).json({ success: false, message: 'Cannot modify Super Admin role' });
        }

        if (name) {
             // Check unique name if changed
             if (name !== role.name) {
                 const exists = await Role.findOne({ where: { name } });
                 if (exists) return res.status(409).json({ success: false, message: 'Role name already in use' });
                 await role.update({ name }, { transaction });
             }
        }

        if (permissions) {
            await role.setPermissions(permissions, { transaction });
        }

        await transaction.commit();

        const updatedRole = await Role.findByPk(id, {
            include: [{ model: Permission, as: 'permissions' }]
        });

        return res.json({
            success: true,
            data: updatedRole,
            message: 'Role updated successfully'
        });

    } catch (error) {
        await transaction.rollback();
        console.error('Update Role Error:', error);
        return res.status(500).json({ success: false, message: 'Failed to update role' });
    }
};

/**
 * Delete a role
 * DELETE /api/v1/admin/roles/:id
 */
exports.deleteRole = async (req, res) => {
    const transaction = await sequelize.transaction();
    try {
        const { id } = req.params;
        const role = await Role.findByPk(id);

        if (!role) return res.status(404).json({ success: false, message: 'Role not found' });

        if (['Super Admin', 'Admin'].includes(role.name)) {
             return res.status(403).json({ success: false, message: 'Cannot delete core system roles' });
        }

        // Check if any admin is assigned this role
        // Need to import Admin model if associating, but database constraint might handle it.
        // Or we check manually.
        // Assuming we rely on DB constraint or generic check.
        // Let's rely on try-catch for foreign key constraint error if admins exist.

        await role.destroy({ transaction });
        await transaction.commit();

        return res.json({ success: true, message: 'Role deleted successfully' });

    } catch (error) {
        await transaction.rollback();
        if (error.name === 'SequelizeForeignKeyConstraintError') {
             return res.status(400).json({ success: false, message: 'Cannot delete role: Assigned to existing admins' });
        }
        console.error('Delete Role Error:', error);
        return res.status(500).json({ success: false, message: 'Failed to delete role' });
    }
};

/**
 * List all available permissions (for selection UI)
 * GET /api/v1/admin/permissions
 */
exports.listPermissions = async (req, res) => {
    try {
        const permissions = await Permission.findAll();
        return res.json({ success: true, data: permissions });
    } catch (error) {
        return res.status(500).json({ success: false, message: 'Failed to fetch permissions' });
    }
};
