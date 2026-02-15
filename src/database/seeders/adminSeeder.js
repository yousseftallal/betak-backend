const { Admin, Role } = require('../models');

async function seedAdmin() {
  try {
    console.log('🌱 Seeding Super Admin account...\n');

    // Find Super Admin role
    const superAdminRole = await Role.findOne({ where: { name: 'Super Admin' } });
    if (!superAdminRole) {
      throw new Error('Super Admin role not found. Please run role seeder first.');
    }

    // Create Super Admin account
    const [admin, created] = await Admin.findOrCreate({
      where: { email: 'superadmin@betak.com' },
      defaults: {
        username: 'superadmin',
        email: 'superadmin@betak.com',
        password_hash: 'SuperAdmin123!', // Will be hashed by model hook
        role_id: superAdminRole.id,
        is_active: true
      }
    });

    if (created) {
      console.log('✅ Super Admin account created successfully!\n');
      console.log('📧 Email: superadmin@betak.com');
      console.log('🔑 Password: SuperAdmin123!\n');
      console.log('⚠️  IMPORTANT: Change this password after first login!\n');
    } else {
      console.log('ℹ️  Super Admin account already exists.\n');
    }
  } catch (error) {
    console.error('❌ Admin seeding failed:', error.message);
    console.error(error);
    process.exit(1);
  }
}

module.exports = seedAdmin;

if (require.main === module) {
  seedAdmin().then(() => process.exit(0));
}
