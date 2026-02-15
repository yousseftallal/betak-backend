async function testLogin() {
  try {
    const response = await fetch('http://localhost:3000/api/v1/admin/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'superadmin@betak.com',
        password: 'SuperAdmin123!'
      })
    });

    const data = await response.json();
    
    if (response.ok) {
      console.log('✅ Login Success:', data.success);
    } else {
      console.error('❌ Login Failed:', response.status);
      console.error('Response Body:', JSON.stringify(data, null, 2));
    }

  } catch (error) {
    console.error('Fetch Error:', error);
  }
}

testLogin();
