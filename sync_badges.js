const { sequelize, Badge, UserBadge } = require('./src/database/models');

async function syncBadges() {
  try {
    console.log('Syncing Badge Tables...');
    await Badge.sync({ alter: true });
    await UserBadge.sync({ alter: true });
    console.log('Badge Tables Synced.');
    process.exit(0);
  } catch (err) {
    console.error('Error syncing badges:', err);
    process.exit(1);
  }
}

syncBadges();
