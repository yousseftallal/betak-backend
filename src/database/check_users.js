const { User } = require('./models');
const { Admin } = require('./models');

async function checkUsers() {
  try {
    const users = await User.findAll();
    console.log('--- USERS ---');
    users.forEach(u => console.log(`ID: ${u.id}, Email: ${u.email}, Role: ${u.role}`));
    if (users.length === 0) console.log('No users found.');

    const admins = await Admin.findAll();
    console.log('\n--- ADMINS ---');
    admins.forEach(a => console.log(`ID: ${a.id}, Email: ${a.email}, Role: ${a.role_id}`));
    if (admins.length === 0) console.log('No admins found.');

  } catch (error) {
    console.error('Error checking users:', error);
  } finally {
    process.exit();
  }
}

checkUsers();
