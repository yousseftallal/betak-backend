const { sequelize } = require('./models');

async function updateSchema() {
  try {
    console.log('🔄 Updating database schema (Safe Mode)...');
    
    // Sync with alter: true to update schema without dropping
    await sequelize.sync({ alter: true });
    
    console.log('✅ Schema updated successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Schema update failed:', error.message);
    process.exit(1);
  }
}

updateSchema();
