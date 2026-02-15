const { Role } = require('../models');

async function seedRoles() {
  try {
    console.log('🌱 Seeding roles...\n');

    const roles = [
      {
        name: 'Super Admin',
        description: 'Full system access including admin management and system settings'
      },
      {
        name: 'Admin',
        description: 'Standard moderation and management access (no admin creation or system settings)'
      },
      {
        name: 'Moderator',
        description: 'Content review and moderation only (cannot ban permanently or delete)'
      },
      {
        name: 'Analyst',
        description: 'Read-only access to analytics and logs'
      },
      {
        name: 'User',
        description: 'Regular platform user (not admin)'
      },
      {
        name: 'Support Agent',
        description: 'Access to Support Tickets only'
      },
      {
        name: 'Financial Manager',
        description: 'Access to Finance, Revenue, and Ads'
      },
      {
        name: 'Content Manager',
        description: 'Access to Videos, Reports, and Push Campaigns'
      }
    ];

    for (const roleData of roles) {
      await Role.findOrCreate({
        where: { name: roleData.name },
        defaults: roleData
      });
      console.log(`✅ Role "${roleData.name}" created/verified`);
    }

    console.log('\n✅ Role seeding completed!\n');
  } catch (error) {
    console.error('❌ Role seeding failed:', error.message);
    process.exit(1);
  }
}

module.exports = seedRoles;

if (require.main === module) {
  seedRoles().then(() => process.exit(0));
}
