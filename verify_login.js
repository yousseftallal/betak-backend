const { Admin, AdminActivityLog, sequelize } = require('./src/database/models');

async function verifyLogin() {
  try {
    console.log('🔍 Checking AdminActivityLog table...');
    // Force sync only this model to ensure table exists (Safe for dev, hazardous for prod but this IS dev/debugging)
    // Better: just try to count.
    try {
        await AdminActivityLog.count();
        console.log('✅ AdminActivityLog table exists.');
    } catch (e) {
        console.error('❌ AdminActivityLog table issues:', e.original?.message || e.message);
        console.log('🛠 Attempting to sync AdminActivityLog model...');
        await AdminActivityLog.sync(); // Create table if missing
        console.log('✅ AdminActivityLog table created.');
    }

    console.log('Done.');
    process.exit(0);

  } catch (error) {
    console.error('Script Error:', error);
    process.exit(1);
  }
}

verifyLogin();
