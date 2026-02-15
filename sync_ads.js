const { sequelize, AdBanner } = require('./src/database/models');

async function syncAds() {
  try {
    console.log('Syncing AdBanner Table...');
    await AdBanner.sync({ alter: true });
    console.log('AdBanner Table Synced.');
    process.exit(0);
  } catch (err) {
    console.error('Error syncing ads:', err);
    process.exit(1);
  }
}

syncAds();
