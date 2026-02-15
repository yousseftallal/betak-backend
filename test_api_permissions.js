const { Admin, Role } = require('./src/database/models');

async function testPermissions() {
  try {
    // 1. Get Super Admin
    const admin = await Admin.findOne({ where: { email: 'superadmin@betak.com' } });
    if (!admin) {
        console.error('Super Admin not found in DB');
        return;
    }
    
    // 2. Generate Token
    // Simulate what authController does. 
    // It likely uses generateTokens(admin) which returns { accessToken ... }
    const { generateTokens } = require('./src/config/jwt'); 
    const { accessToken } = generateTokens(admin);
    console.log('Generated Token:', accessToken.substring(0, 20) + '...');
    
    // Debug Payload
    const jwt = require('jsonwebtoken');
    const decoded = jwt.decode(accessToken);
    console.log('Decoded Payload:', JSON.stringify(decoded));

    // 3. Make Request
    try {
      const response = await fetch('http://localhost:3000/api/v1/admin/stats/overview', {
        headers: { Authorization: `Bearer ${accessToken}` }
      });
      
      const data = await response.json();
      
      if (response.ok) {
        console.log('✅ Success:', data);
      } else {
        console.error('❌ Failed:', response.status, data);
      }
    } catch (err) {
      console.error('❌ Request Error:', err.message);
    }

  } catch (error) {
    console.error('Script Error:', error);
  } finally {
    process.exit();
  }
}

testPermissions();
