const { SupportTicket } = require('./models');

async function syncSupport() {
  try {
    console.log('🔄 Syncing SupportTicket model...');
    await SupportTicket.sync({ alter: true });
    console.log('✅ SupportTicket table synced successfully.');
    process.exit(0);
  } catch (error) {
    console.error('❌ Sync failed:', error);
    process.exit(1);
  }
}

syncSupport();
