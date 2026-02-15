const { AdminNotification, PushCampaign } = require('./models');

async function syncNotifications() {
  try {
    console.log('🔄 Syncing Notification models...');
    await AdminNotification.sync({ alter: true });
    await PushCampaign.sync({ alter: true });
    console.log('✅ Notification tables synced.');
    process.exit(0);
  } catch (error) {
    console.error('❌ Sync failed:', error);
    process.exit(1);
  }
}

syncNotifications();
