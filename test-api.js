const axios = require('axios');

const API_BASE_URL = 'http://192.168.0.116:3000';

async function testAPI() {
  console.log('Testing API endpoints...\n');

  try {
    // Test 1: Check email endpoint
    console.log('1. Testing /check-email endpoint...');
    const emailResponse = await axios.post(`${API_BASE_URL}/check-email`, {
      email: 'test@example.com'
    });
    console.log('✅ Email check successful:', emailResponse.data);

    // Test 2: Test registration endpoint
    console.log('\n2. Testing /register endpoint...');
    const registerResponse = await axios.post(`${API_BASE_URL}/register`, {
      firstName: 'Test',
      lastName: 'User',
      email: 'testuser@example.com',
      password: 'testpassword123',
      gender: 'Men',
      dateOfBirth: '01/01/1990',
      type: 'Casual',
      location: 'Test City',
      hometown: 'Test Town',
      datingPreferences: ['Casual'],
      lookingFor: 'Women',
      imageUrls: [],
      prompts: []
    });
    console.log('✅ Registration successful:', registerResponse.data);

    // Test 3: Test login endpoint
    console.log('\n3. Testing /login endpoint...');
    const loginResponse = await axios.post(`${API_BASE_URL}/login`, {
      email: 'testuser@example.com',
      password: 'testpassword123'
    });
    console.log('✅ Login successful:', loginResponse.data);

    console.log('\n🎉 All API tests passed!');

  } catch (error) {
    console.error('\n❌ API test failed:');
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', error.response.data);
    } else {
      console.error('Error:', error.message);
    }
  }
}

testAPI(); 