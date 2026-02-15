require('dotenv').config();
const { sequelize } = require('./src/database/models');

async function syncDatabase() {
    try {
        console.log('🔄 Connecting to database...');
        await sequelize.authenticate();
        console.log('✅ Connection successful.');

        console.log('🔄 Syncing models (creating missing tables)...');
        // alter: true adds missing columns/tables without dropping data
        await sequelize.sync({ alter: true });
        console.log('✅ Database synced successfully!');

    } catch (error) {
        console.error('❌ Sync failed:', error);
    } finally {
        await sequelize.close();
    }
}

syncDatabase();
