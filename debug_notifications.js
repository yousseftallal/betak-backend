const { AdminNotification, Admin, sequelize } = require('./src/database/models');

async function testNotifications() {
  try {
    await sequelize.authenticate();
    console.log('Database connected.');

    // 1. Check Admins
    const admins = await Admin.findAll();
    console.log(`Found ${admins.length} admins.`);
    admins.forEach(a => console.log(`- Admin: ${a.username} (ID: ${a.id})`));

    // 2. Create Test Notification
    const performTest = true;
    if (performTest && admins.length > 0) {
        console.log('Creating test notification...');
        const adminId = admins[0].id;
        
        await AdminNotification.create({
            admin_id: adminId,
            title: 'Test Notification',
            message: 'This is a test notification from debug script.',
            type: 'info',
            is_read: false
        });
        console.log('Test notification created for Admin ID:', adminId);
    }

    // 3. Check Notifications
    const notifs = await AdminNotification.findAll({ limit: 5, order: [['created_at', 'DESC']] });
    console.log(`Found ${notifs.length} recent notifications:`);
    notifs.forEach(n => console.log(`- [${n.id}] For Admin ${n.admin_id}: ${n.title} (Read: ${n.is_read})`));

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await sequelize.close();
  }
}

testNotifications();
