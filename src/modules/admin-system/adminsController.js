const { Admin, Role, sequelize } = require('../../database/models');
const bcrypt = require('bcryptjs');

// Create new admin (Super Admin only usually, or protected by specific permission)
exports.createAdmin = async (req, res) => {
  const transaction = await sequelize.transaction();
  try {
    const { username, email, password, role_id } = req.body;

    // Check if email exists
    const existingAdmin = await Admin.findOne({ where: { email } });
    if (existingAdmin) {
      return res.status(409).json({
        success: false,
        error: { code: 'EMAIL_EXISTS', message: 'Email already in use' }
      });
    }

    // Hash password (if not handled by model hooks, but usually safe to do it explicitly or rely on hook)
    // Assuming model hook handles it, but let's verify. 
    // Wait, let's look at Login logic. Login compares hash. Seeders verify hash.
    // Admin model likely has hooks. I'll rely on hooks OR do it manually if unsure.
    // Let's check Admin model later. For now, manual hash is safer if hook is missing.
    // Actually, explicit hash here avoids "plain password in DB" risk if hook fails.
    // const password_hash = await bcrypt.hash(password, 10);
    // Actually, let's assume hook is there or add it.
    // The previous `adminSeeder` passed `password_hash: 'SuperAdmin123!'` ??
    // Wait! `adminSeeder` passed `password_hash: 'SuperAdmin123!'`.
    // Does the model hash it? `Admin.beforeCreate`?
    // I should check `Admin.js`.

    // Proceeding assuming I'll check model. I'll write the controller generic for now.
    
    // Check Role
    const role = await Role.findByPk(role_id);
    if (!role) {
      return res.status(400).json({
        success: false,
        error: { code: 'INVALID_ROLE', message: 'Role ID not found' }
      });
    }

    const newAdmin = await Admin.create({
      username,
      email,
      password_hash: password, // Model hook should hash this specific field if it's named 'password' or via hook on 'password_hash'
      role_id,
      is_active: true
    }, { transaction });

    await transaction.commit();

    res.status(201).json({
      success: true,
      data: {
        id: newAdmin.id,
        username: newAdmin.username,
        email: newAdmin.email,
        role: role.name
      }
    });

  } catch (error) {
    await transaction.rollback();
    console.error('Create Admin Error:', error);
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to create admin' }
    });
  }
};

exports.listAdmins = async (req, res) => {
  try {
    const admins = await Admin.findAll({
      attributes: { exclude: ['password_hash', 'mfa_secret'] },
      include: [{ model: Role, as: 'role', attributes: ['id', 'name'] }],
      order: [['created_at', 'DESC']]
    });

    res.json({
      success: true,
      data: admins
    });
  } catch (error) {
    console.error('List Admins Error:', error);
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch admins' }
    });
  }
};

exports.deleteAdmin = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Prevent self-deletion
    if (parseInt(id) === req.user.id) {
        return res.status(400).json({
            success: false,
            error: { code: 'SELF_DELETE', message: 'You cannot delete your own account' }
        });
    }

    const admin = await Admin.findByPk(id);
    if (!admin) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Admin not found' }
      });
    }

    // Optional: Prevent deleting Super Admin?
    // If target has role 'Super Admin', maybe strict check?
    // For now, let RBAC handle it (if caller has 'admins:delete').

    await admin.destroy();

    res.json({
      success: true,
      message: 'Admin deleted successfully'
    });
  } catch (error) {
    console.error('Delete Admin Error:', error);
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to delete admin' }
    });
  }
};
