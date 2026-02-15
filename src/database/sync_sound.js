const { Sound } = require('./models');

async function syncSound() {
  try {
    console.log('🔄 Syncing Sound model...');
    await Sound.sync({ alter: true });
    console.log('✅ Sound table synced successfully.');
    process.exit(0);
  } catch (error) {
    console.error('❌ Sync failed:', error);
    process.exit(1);
  }
}

syncSound();
