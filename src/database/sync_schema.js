const { sequelize } = require('./models');

async function syncSchema() {
    try {
        console.log('🔄 Syncing database schema (alter: true)...');
        await sequelize.sync({ alter: true });
        console.log('✅ Database schema updated successfully.');
        process.exit(0);
    } catch (error) {
        console.error('❌ Schema sync failed:', error);
        process.exit(1);
    }
}

syncSchema();
