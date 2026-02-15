const { WalletTransaction, AdBanner, sequelize } = require('./models');

async function syncFinancial() {
  try {
    console.log('🔄 Syncing Financial Tables Only...');
    
    // Sync AdBanner (Safe to alter or force if empty)
    await AdBanner.sync({ alter: true });
    console.log('✅ AdBanner synced.');

    // Sync WalletTransaction
    await WalletTransaction.sync({ alter: true });
    console.log('✅ WalletTransaction synced.');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Sync failed:', error.message);
    process.exit(1);
  }
}

syncFinancial();
