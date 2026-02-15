const { sequelize } = require('./models');

async function runMigrations() {
  try {
    console.log('🔄 Starting database migration...\n');
    
    // Sync all models with database
    // { force: true } = DROPS existing tables and recreates them (use for fresh install)
    await sequelize.sync({ force: true });
    
    console.log('✅ Database migration completed successfully!\n');
    console.log('📊 All tables have been created/updated.\n');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    console.error(error);
    process.exit(1);
  }
}

// Run migrations
runMigrations();
