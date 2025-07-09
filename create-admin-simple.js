const https = require('https');
const http = require('http');

// Simple function to make HTTP requests
function makeRequest(url, data) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const isHttps = urlObj.protocol === 'https:';
    const client = isHttps ? https : http;
    
    const options = {
      hostname: urlObj.hostname,
      port: urlObj.port || (isHttps ? 443 : 80),
      path: urlObj.pathname,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(data)
      }
    };

    const req = client.request(options, (res) => {
      let responseData = '';
      
      res.on('data', (chunk) => {
        responseData += chunk;
      });
      
      res.on('end', () => {
        try {
          const parsed = JSON.parse(responseData);
          resolve({ status: res.statusCode, data: parsed });
        } catch (e) {
          resolve({ status: res.statusCode, data: responseData });
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    req.write(data);
    req.end();
  });
}

async function createAdmin() {
  const adminData = {
    email: 'admin@datingapp.com',
    password: 'admin123',
    role: 'superadmin'
  };

  try {
    console.log('🚀 Creating admin account...');
    console.log('📧 Email:', adminData.email);
    console.log('🔑 Password:', adminData.password);
    console.log('👑 Role:', adminData.role);
    console.log('');

    const response = await makeRequest(
      'http://localhost:8000/admin/register',
      JSON.stringify(adminData)
    );

    if (response.status === 201) {
      console.log('✅ Admin account created successfully!');
      console.log('');
      console.log('🎉 You can now log in to the admin panel with:');
      console.log('   Email: admin@datingapp.com');
      console.log('   Password: admin123');
      console.log('');
      console.log('⚠️  Please change the password after first login!');
    } else if (response.status === 409) {
      console.log('ℹ️  Admin account already exists!');
      console.log('');
      console.log('🎉 You can log in with:');
      console.log('   Email: admin@datingapp.com');
      console.log('   Password: admin123');
    } else {
      console.log('❌ Error creating admin account:');
      console.log('Status:', response.status);
      console.log('Response:', response.data);
    }
  } catch (error) {
    console.log('❌ Error connecting to server:');
    console.log('Make sure your backend server is running on http://localhost:8000');
    console.log('Error:', error.message);
  }
}

createAdmin(); 