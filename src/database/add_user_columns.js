const { sequelize } = require('./models');

async function updateSchema() {
  try {
    console.log('Adding columns to users table...');
    
    await sequelize.query(`
      ALTER TABLE users 
      ADD COLUMN IF NOT EXISTS suspension_expires_at TIMESTAMP WITH TIME ZONE,
      ADD COLUMN IF NOT EXISTS live_ban_expires_at TIMESTAMP WITH TIME ZONE;
    `);

    console.log('Columns added successfully.');
    process.exit(0);
  } catch (error) {
    console.error('Failed to update schema:', error);
    process.exit(1);
  }
}

updateSchema();
