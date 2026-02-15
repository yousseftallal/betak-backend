const { sequelize } = require('./models');

// Helper to make require work if it exports a function
const runSeeder = async (path) => {
  const seeder = require(path);
  if (typeof seeder === 'function') {
    await seeder();
  } else {
    // If it's just a script that ran on require (bad practice but possible)
    // or exports a promise
    await seeder;
  }
};

async function runAllSeeders() {
  try {
    console.log('🌱 Running all seeders...\n');
    console.log('='.repeat(50) + '\n');

    // Run role seeder
    console.log('1️⃣  Seeding Roles...');
    await runSeeder('./seeders/roleSeeder');
    
    // Run permission seeder
    console.log('\n2️⃣  Seeding Permissions...');
    await runSeeder('./seeders/permissionSeeder');
    
    // Run admin seeder
    console.log('\n3️⃣  Seeding Super Admin...');
    await runSeeder('./seeders/adminSeeder');
    
    // Run creator seeder
    console.log('\n4️⃣  Seeding Creators & Analytics...');
    await runSeeder('./seeders/creatorSeeder');

    // Run verification seeder
    console.log('\n5️⃣  Seeding Verification Requests...');
    await runSeeder('./seeders/verificationSeeder');

    // Run live stream seeder
    console.log('\n6️⃣  Seeding Live Streams...');
    await runSeeder('./seeders/liveStreamSeeder');

    // Run sound seeder
    console.log('\n7️⃣  Seeding Sounds...');
    await runSeeder('./seeders/soundSeeder');

    // Run notification seeder
    console.log('\n8️⃣  Seeding Notifications...');
    await runSeeder('./seeders/notificationSeeder');

    // Run support seeder
    console.log('\n9️⃣  Seeding Support Tickets...');
    await runSeeder('./seeders/supportSeeder');

    // Run extensive seeder (Bulk data)
    console.log('\n🔟 Seeding Extensive Test Data (Bulk Users, Finance, Reports)...');
    await runSeeder('./seeders/extensiveSeeder');

    console.log('\n' + '='.repeat(50));
    console.log('✅ All seeders completed successfully!\n');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  }
}

runAllSeeders();
