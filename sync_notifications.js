require('dotenv').config();
const { sequelize, AdminNotification, User } = require('./src/database/models');

async function syncNotifications() {
    try {
        console.log('🔄 Connecting to database...');
        await sequelize.authenticate();
        console.log('✅ Connection successful.');

        console.log('🔄 Syncing AdminNotification table...');
        await AdminNotification.sync({ alter: true });
        console.log('✅ AdminNotification table synced successfully!');

        // Also sync User just in case
        console.log('🔄 Syncing User table...');
        await User.sync({ alter: true });
        console.log('✅ User table synced successfully!');

    } catch (error) {
        console.error('❌ Sync failed:', error);
    } finally {
        await sequelize.close();
    }
}

syncNotifications();
