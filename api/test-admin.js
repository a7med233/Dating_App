const axios = require('axios');

const BASE_URL = 'http://localhost:3000';

async function testAdminEndpoints() {
  try {
    console.log('Testing admin endpoints...\n');

    // 1. Create an admin user
    console.log('1. Creating admin user...');
    const adminData = {
      email: 'admin@test.com',
      password: 'admin123',
      role: 'superadmin'
    };

    try {
      const createResponse = await axios.post(`${BASE_URL}/admin/register`, adminData);
      console.log('✅ Admin created:', createResponse.data);
    } catch (error) {
      if (error.response?.status === 409) {
        console.log('ℹ️ Admin already exists, continuing...');
      } else {
        console.log('❌ Failed to create admin:', error.response?.data || error.message);
        return;
      }
    }

    // 2. Login as admin
    console.log('\n2. Logging in as admin...');
    const loginResponse = await axios.post(`${BASE_URL}/admin/login`, {
      email: adminData.email,
      password: adminData.password
    });
    
    const token = loginResponse.data.token;
    console.log('✅ Login successful, token received');

    // 3. Test /admin/me endpoint
    console.log('\n3. Testing /admin/me endpoint...');
    const meResponse = await axios.get(`${BASE_URL}/admin/me`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log('✅ Admin info:', meResponse.data);

    // 4. Test /admin/stats endpoint
    console.log('\n4. Testing /admin/stats endpoint...');
    const statsResponse = await axios.get(`${BASE_URL}/admin/stats`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log('✅ Stats:', statsResponse.data);

    // 5. Test /admin/users endpoint
    console.log('\n5. Testing /admin/users endpoint...');
    const usersResponse = await axios.get(`${BASE_URL}/admin/users`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log('✅ Users count:', usersResponse.data.users?.length || 0);
    if (usersResponse.data.users?.length > 0) {
      const sampleUser = usersResponse.data.users[0];
      console.log('Sample user photos:', sampleUser.photos);
      console.log('Sample user imageUrls:', sampleUser.imageUrls);
    }

    console.log('\n🎉 All admin endpoints are working correctly!');

  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
  }
}

testAdminEndpoints();