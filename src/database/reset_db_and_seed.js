const { sequelize, User, Admin, Role, Permission, Video, Creator } = require('./models');
const bcrypt = require('bcryptjs');

async function resetAndSeed() {
  try {
    console.log('🔄 Connecting to database...');
    await sequelize.authenticate();
    console.log('✅ Connected.');

    console.log('🗑️ Dropping and re-creating tables...');
    await sequelize.sync({ force: true });
    console.log('✅ Database schema reset.');

    console.log('🌱 Seeding Roles...');
    const roles = await Role.bulkCreate([
      { name: 'Super Admin', description: 'Full access to everything' },
      { name: 'Admin', description: 'Standard administrative access' },
      { name: 'Moderator', description: 'Can moderate content' },
      { name: 'Creator', description: 'Verified content creator' },
      { name: 'User', description: 'Standard user' }
    ]);
    const superAdminRole = roles[0];
    const userRole = roles[4];

    console.log('🌱 Seeding Super Admin...');
    // Note: Admin model hook hashes 'password_hash' automatically
    await Admin.create({
      username: 'superadmin',
      email: 'superadmin@betak.com',
      password_hash: 'SuperAdmin123!', 
      role_id: superAdminRole.id,
      is_active: true
    });
    console.log('   -> Created: superadmin@betak.com / SuperAdmin123!');

    console.log('🌱 Seeding User (Ahmed_Vlogs)...');
    // Note: User model hook hashes 'password' (virtual) -> 'password_hash'
    const ahmed = await User.create({
      username: 'Ahmed_Vlogs',
      email: 'ahmed@betak.com',
      password: 'User123!',
      role_id: userRole.id,
      status: 'active',
      bio: 'Travel vlogger showing the beauty of Egypt 🇪🇬',
      is_verified: true,
      followers_count: 50000,
      videos_count: 0
    });
    console.log('   -> Created: ahmed@betak.com / User123!');

    // Initialize Creator profile for Ahmed
    await Creator.create({
      user_id: ahmed.id,
      username: ahmed.username,
      followers_count: 50000,
      total_videos: 0,
      engagement_rate: 8.5,
      last_active_at: new Date()
    });

    console.log('✅ Database reset and seeded successfully.');
    process.exit(0);

  } catch (error) {
    console.error('❌ Failed to reset/seed database:', error);
    process.exit(1);
  }
}

resetAndSeed();
