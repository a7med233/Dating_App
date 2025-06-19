const express = require('express');
const mongoose = require('mongoose');
const crypto = require('crypto');
const User = require('./models/User');

const app = express();
const port = 5000;
const cors = require('cors');
const bodyParser = require('body-parser');

const http = require('http').createServer(app);
const io = require('socket.io')(http);

app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

mongoose.connect('mongodb+srv://ahmed:Marwa%4012345@cluster0.wqfualw.mongodb.net/')
  .then(() => {
    console.log('Connected to MongoDB'); 
  })
  .catch(err => {
    console.log('MongoDB connection error:', err);
  });

// Basic route for testing
app.get('/', (req, res) => {
  res.json({ message: 'Dating App API is running!' });
});

// User registration endpoint
app.post('/api/register', async (req, res) => {
  try {
    const userData = req.body;
    
    // Check if user already exists
    const existingUser = await User.findOne({ email: userData.email });
    if (existingUser) {
      return res.status(400).json({ error: 'User already exists with this email' });
    }
    
    // Hash the password
    const hashedPassword = crypto.createHash('sha256').update(userData.password).digest('hex');
    
    // Create new user
    const user = new User({
      ...userData,
      password: hashedPassword
    });
    
    await user.save();
    
    res.status(201).json({ 
      message: 'User registered successfully',
      userId: user._id 
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// User login endpoint
app.post('/api/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Find user by email
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    // Check password
    const hashedPassword = crypto.createHash('sha256').update(password).digest('hex');
    if (user.password !== hashedPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    res.json({ 
      message: 'Login successful',
      userId: user._id,
      user: {
        name: user.name,
        email: user.email
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Use http.listen instead of app.listen for Socket.IO compatibility
http.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});