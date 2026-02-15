const { sequelize, VerificationRequest } = require('./models');

async function syncVerification() {
  try {
    console.log('🔄 Syncing VerificationRequest model...');
    await VerificationRequest.sync({ alter: true });
    console.log('✅ VerificationRequest table synced successfully.');
    process.exit(0);
  } catch (error) {
    console.error('❌ Sync failed:', error);
    process.exit(1);
  }
}

syncVerification();
