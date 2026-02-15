const { Admin, Role } = require('./src/database/models');

async function checkAdmin() {
  try {
    const admin = await Admin.findOne({ 
      where: { email: 'superadmin@betak.com' },
      include: [{ model: Role, as: 'role' }]
    });

    if (admin) {
      console.log(`Admin Found: ID ${admin.id}`);
      console.log(`Role: ${admin.role ? admin.role.name : 'NULL'}`);
    } else {
      console.log('Admin not found');
    }
  } catch (error) {
    console.error('Error:', error);
  } finally {
    process.exit();
  }
}

checkAdmin();
