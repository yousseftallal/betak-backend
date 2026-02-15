require('dotenv').config();
const { sequelize, User, AdminNotification } = require('./src/database/models');

async function resetUsers() {
    try {
        console.log('Connecting to database...');
        await sequelize.authenticate();
        console.log('✅ Connection successful.');

        // Try to clear AdminNotifications if it exists, ignore if not
        try {
            if (AdminNotification) {
                // Use force: true if needed, or just standard destroy
                await AdminNotification.destroy({ where: {}, truncate: true, cascade: true });
            }
        } catch (e) {
            console.log('⚠️ Note: Could not clear AdminNotifications (might be empty or locked):', e.message);
        }

        const userCount = await User.count();
        console.log(`Current User Count: ${userCount}`);

        if (userCount > 0) {
            console.log('🗑️ Clearing Users...');
            await User.destroy({ where: {}, truncate: true, cascade: true });
            console.log('✅ All users verified cleared.');
        } else {
            console.log('ℹ️ Users table already empty.');
        }
    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        await sequelize.close();
    }
}

resetUsers();
