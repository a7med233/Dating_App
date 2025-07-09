const bcrypt = require('bcrypt');
const mongoose = require('mongoose');
const Admin = require('./api/models/admin');

// MongoDB connection
mongoose.connect('mongodb://localhost:27017/dating-app', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const createDefaultAdmin = async () => {
  try {
    // Check if admin already exists
    const existingAdmin = await Admin.findOne({ email: 'admin@datingapp.com' });
    
    if (existingAdmin) {
      console.log('Admin account already exists!');
      console.log('Email: admin@datingapp.com');
      console.log('Password: admin123');
      return;
    }

    // Create default admin
    const hashedPassword = await bcrypt.hash('admin123', 10);
    const admin = new Admin({
      email: 'admin@datingapp.com',
      password: hashedPassword,
      role: 'superadmin'
    });

    await admin.save();
    
    console.log('✅ Default admin account created successfully!');
    console.log('📧 Email: admin@datingapp.com');
    console.log('🔑 Password: admin123');
    console.log('👑 Role: superadmin');
    console.log('\n⚠️  Please change the password after first login!');
    
  } catch (error) {
    console.error('❌ Error creating admin account:', error);
  } finally {
    mongoose.connection.close();
  }
};

createDefaultAdmin(); 