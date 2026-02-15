const { Permission, Role, RolePermission } = require('../models');

async function seedPermissions() {
  try {
    console.log('🌱 Seeding permissions...\n');

    const permissions = [
      // User Management Permissions
      { code: 'users:read', description: 'View user list and profiles', category: 'users' },
      { code: 'users:suspend', description: 'Temporarily suspend user accounts', category: 'users' },
      { code: 'users:ban', description: 'Permanently ban user accounts', category: 'users' },
      { code: 'users:restore', description: 'Un-ban or un-suspend users', category: 'users' },
      { code: 'users:notes', description: 'Add internal notes on users', category: 'users' },
      
      // Video Management Permissions
      { code: 'videos:read', description: 'View videos and metadata', category: 'videos' },
      { code: 'videos:hide', description: 'Hide videos from platform', category: 'videos' },
      { code: 'videos:delete', description: 'Permanently delete videos', category: 'videos' },
      { code: 'videos:restore', description: 'Restore hidden videos', category: 'videos' },
      { code: 'videos:edit', description: 'Edit video metadata', category: 'videos' },
      
      // Reports & Moderation Permissions
      { code: 'reports:read', description: 'View report queue', category: 'reports' },
      { code: 'reports:review', description: 'Review and action reports', category: 'reports' },
      { code: 'reports:dismiss', description: 'Dismiss reports', category: 'reports' },
      { code: 'reports:assign', description: 'Assign reports to moderators', category: 'reports' },
      
      // Analytics Permissions
      { code: 'analytics:read', description: 'View platform analytics', category: 'analytics' },
      { code: 'analytics:export', description: 'Export analytics data', category: 'analytics' },
      
      // Activity Logs Permissions
      { code: 'logs:read', description: 'View admin activity logs', category: 'logs' },
      { code: 'logs:export', description: 'Export activity logs', category: 'logs' },
      
      // System Settings Permissions
      { code: 'settings:read', description: 'View system settings', category: 'settings' },
      { code: 'settings:write', description: 'Modify system settings', category: 'settings' },
      
      // Admin Management Permissions
      { code: 'admins:read', description: 'View admin accounts', category: 'admins' },
      { code: 'admins:create', description: 'Create new admin accounts', category: 'admins' },
      { code: 'admins:edit', description: 'Edit admin accounts', category: 'admins' },
      { code: 'admins:delete', description: 'Delete admin accounts', category: 'admins' }
    ];

    // Create all permissions
    for (const permData of permissions) {
      await Permission.findOrCreate({
        where: { code: permData.code },
        defaults: permData
      });
      console.log(`✅ Permission "${permData.code}" created/verified`);
    }

    console.log('\n🔗 Assigning permissions to roles...\n');

    // Define role permission mappings
    const rolePermissions = {
      'Super Admin': [
        // All permissions
        ...permissions.map(p => p.code)
      ],
      'Admin': [
        // User management (all except permanent bans)
        'users:read', 'users:suspend', 'users:restore', 'users:notes',
        // Video management (all)
        'videos:read', 'videos:hide', 'videos:delete', 'videos:restore', 'videos:edit',
        // Reports (all)
        'reports:read', 'reports:review', 'reports:dismiss', 'reports:assign',
        // Analytics
        'analytics:read', 'analytics:export',
        // Logs (read only)
        'logs:read'
      ],
      'Moderator': [
        // User management (limited)
        'users:read', 'users:suspend', 'users:notes',
        // Video management (limited)
        'videos:read', 'videos:hide', 'videos:restore',
        // Reports
        'reports:read', 'reports:review', 'reports:dismiss',
        // Analytics (read only)
        'analytics:read'
      ],
      'Analyst': [
        // Analytics and logs only
        'analytics:read', 'analytics:export',
        'logs:read', 'logs:export',
        'users:read',
        'videos:read'
      ],
      'Content Manager': [
        // Videos
        'videos:read', 'videos:hide', 'videos:delete', 'videos:restore', 'videos:edit',
        // Reports
        'reports:read', 'reports:review', 'reports:dismiss', 'reports:assign',
        // Users (Read only for context)
        'users:read'
      ],
      'Financial Manager': [
          // If we add finance permissions later, they go here.
          // For now, they rely on role check.
          'users:read',
          'users:read',
          'analytics:read', // Required to view creator analytics and dashboard stats
          'settings:read',
          'settings:update' // Required for Automation Settings on Finance Page
      ],
      'Support Agent': [
          'users:read', 'users:notes' // Can see users and notes
      ]
    };

    // Assign permissions to roles
    for (const [roleName, permCodes] of Object.entries(rolePermissions)) {
      const role = await Role.findOne({ where: { name: roleName } });
      if (!role) {
        console.log(`⚠️  Role "${roleName}" not found, skipping...`);
        continue;
      }

      for (const code of permCodes) {
        const permission = await Permission.findOne({ where: { code } });
        if (permission) {
          await RolePermission.findOrCreate({
            where: {
              role_id: role.id,
              permission_id: permission.id
            }
          });
        }
      }
      console.log(`✅ Permissions assigned to "${roleName}"`);
    }

    console.log('\n✅ Permission seeding completed!\n');
    console.log('\n✅ Permission seeding completed!\n');
  } catch (error) {
    console.error('❌ Permission seeding failed:', error.message);
    process.exit(1);
  }
}

module.exports = seedPermissions;

if (require.main === module) {
  seedPermissions().then(() => process.exit(0));
}
