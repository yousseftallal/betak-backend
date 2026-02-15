const { sequelize } = require('./models');

async function updateEnum() {
  try {
    console.log('🔄 Updating enum_reports_reported_type...');
    
    // Postgres specific command to add value to enum
    await sequelize.query(`
      ALTER TYPE "enum_reports_reported_type" ADD VALUE IF NOT EXISTS 'sound';
    `);

    console.log('✅ Enum updated successfully.');
    process.exit(0);
  } catch (error) {
    console.error('❌ Failed to update enum:', error);
    process.exit(1);
  }
}

updateEnum();
