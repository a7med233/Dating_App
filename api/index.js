const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const bcrypt = require('bcrypt');
const dotenv = require('dotenv');
const http = require('http');
const socketIo = require('socket.io');

dotenv.config();

const app = express();
const port = 3000;
const cors = require('cors');

const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
});

// Simple in-memory cache for matches
const matchesCache = new Map();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

// Function to clear matches cache for a user
const clearMatchesCache = (userId) => {
  const cacheKey = `matches_${userId}`;
  matchesCache.delete(cacheKey);
  console.log('Cleared matches cache for user:', userId);
};

// Notification helper functions
const createNotification = (userId, type, title, message, data = {}) => {
  const notification = {
    id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
    userId,
    type,
    title,
    message,
    data,
    timestamp: new Date().toISOString(),
    read: false,
  };

  if (!notifications.has(userId)) {
    notifications.set(userId, []);
  }
  
  const userNotifications = notifications.get(userId);
  userNotifications.unshift(notification);
  
  // Keep only last 50 notifications per user
  if (userNotifications.length > 50) {
    userNotifications.splice(50);
  }
  
  notifications.set(userId, userNotifications);
  
  // Notify subscribers
  notificationSubscribers.forEach(callback => {
    try {
      callback(userId, notification);
    } catch (error) {
      console.error('Error in notification subscriber:', error);
    }
  });
  
  return notification;
};

const getUserNotifications = (userId) => {
  return notifications.get(userId) || [];
};

const markNotificationAsRead = (userId, notificationId) => {
  const userNotifications = notifications.get(userId);
  if (userNotifications) {
    const notification = userNotifications.find(n => n.id === notificationId);
    if (notification) {
      notification.read = true;
    }
  }
};

const markAllNotificationsAsRead = (userId) => {
  const userNotifications = notifications.get(userId);
  if (userNotifications) {
    userNotifications.forEach(n => n.read = true);
  }
};

const deleteNotification = (userId, notificationId) => {
  const userNotifications = notifications.get(userId);
  if (userNotifications) {
    const index = userNotifications.findIndex(n => n.id === notificationId);
    if (index !== -1) {
      userNotifications.splice(index, 1);
    }
  }
};

app.use(cors());

// Increase payload size limits for image uploads
app.use(bodyParser.urlencoded({extended: false, limit: '50mb'}));
app.use(bodyParser.json({limit: '50mb'}));
app.use(express.json({limit: '50mb'}));

const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'your_default_jwt_secret';

// Use environment variable for MongoDB URI
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://ahmed:Marwa%4012345@cluster0.wqfualw.mongodb.net/';

mongoose
  .connect(MONGODB_URI)
  .then(() => {
    console.log('Connected to MongoDB');
  })
  .catch(error => {
    console.log('Error connecting to MongoDB', error);
  });

app.listen(port, '0.0.0.0', () => {
  console.log('Server is running on port 3000');
  console.log('Accessible at:');
  console.log('  - Local: http://localhost:3000');
  console.log('  - Network: http://192.168.0.116:3000');
});

const User = require('./models/user');
const Chat = require('./models/message');
const Admin = require('./models/admin');
const SupportChat = require('./models/supportChat');
const { uploadImage, deleteImage } = require('./config/cloudinary');

// In-memory notification store (in production, use Redis or database)
const notifications = new Map();
const notificationSubscribers = new Set();

const generateToken = user => {
  // Define your secret key used to sign the token
  const secretKey = crypto.randomBytes(32).toString('hex');

  // Define the token payload (you can include any user data you want)
  const payload = {
    userId: user._id,
    email: user.email,
    // Add any other user data you want to include
  };

  // Generate the token with the payload and secret key
  const token = jwt.sign(payload, secretKey, {expiresIn: '1d'}); // Token expires in 1 hour

  return token;
};

// Backend Route to Create User and Generate Token
app.post('/register', async (req, res) => {
  try {
    // Extract user data from the request body
    const userData = req.body;

    // Hash the password before saving
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(userData.password, saltRounds);
    userData.password = hashedPassword;

    // Create a new user using the User model
    const newUser = new User(userData);

    await newUser.save();

    // Generate a token for the new user (use consistent secret)
    const token = jwt.sign({userId: newUser._id}, JWT_SECRET, {expiresIn: '1d'});
    // Return the new user data along with the token
    res.status(201).json({token});
  } catch (error) {
    console.error('Error creating user:', error);
    res.status(500).json({error: 'Internal Server Error'});
  }
});

// app.get('/user', async (req, res) => {
//   try {
//     // Get the user details based on the user ID from the authentication token
//     const userId = req.user.id; // Assuming the user ID is stored in the request object after authentication
//     const user = await User.findById(userId);

//     if (!user) {
//       return res.status(404).json({message: 'User not found'});
//     }

//     res.status(200).json(user);
//   } catch (error) {
//     console.error('Error fetching user details:', error);
//     res.status(500).json({message: 'Internal server error'});
//   }
// });

//fetch users data
app.get('/users/:userId', async (req, res) => {
  try {
    const {userId} = req.params;

    const user = await User.findById(userId);

    if (!user) {
      return res.status(500).json({message: 'User not found'});
    }

    return res.status(200).json({user});
  } catch (error) {
    res.status(500).json({message: 'Error fetching the user details'});
  }
});

//endpoint to login
app.post('/login', async (req, res) => {
  try {
    const {email, password} = req.body;

    //check if the user exists already
    const user = await User.findOne({email});
    if (!user) {
      return res.status(401).json({message: 'Invalid email or password'});
    }

    //check if password is correct using bcrypt
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({message: 'Invalid password'});
    }

    // Check if user is banned
    if (user.visibility === 'hidden') {
      return res.status(403).json({message: 'Your account has been banned. Please contact support for assistance.'});
    }

    const token = jwt.sign({userId: user._id}, JWT_SECRET, {expiresIn: '1d'});

    return res.status(200).json({token});
  } catch (error) {
    res.status(500).json({message: 'login failed'});
  }
});

app.get('/matches', async (req, res) => {
  try {
    const {userId} = req.query;

    if (!userId) {
      return res.status(400).json({message: 'User ID is required'});
    }

    // Check cache first
    const cacheKey = `matches_${userId}`;
    const cachedData = matchesCache.get(cacheKey);
    
    if (cachedData && (Date.now() - cachedData.timestamp) < CACHE_DURATION) {
      console.log('Returning cached matches for user:', userId);
      return res.status(200).json({matches: cachedData.matches});
    }

    // Fetch user with only necessary fields in a single query
    const user = await User.findById(userId)
      .select('gender type matches likedProfiles')
      .lean();

    if (!user) {
      return res.status(404).json({message: 'User not found'});
    }

    // Build filter object
    let filter = {
      _id: {$ne: userId},
      visibility: {$ne: 'hidden'} // Exclude banned users
    };

    // Add gender filter
    if (user.gender === 'Men') {
      filter.gender = 'Women';
    } else if (user.gender === 'Women') {
      filter.gender = 'Men';
    }

    // Add type filter if user has a type
    if (user.type) {
      filter.type = user.type;
    }

    // Get IDs to exclude (matches and liked profiles)
    const excludeIds = [
      userId,
      ...(user.matches || []),
      ...(user.likedProfiles || [])
    ];

    // Add exclusion filter
    if (excludeIds.length > 0) {
      filter._id = {$nin: excludeIds};
    }

    console.log('Matches filter:', filter);

    // Fetch matches with only necessary fields and limit results
    const matches = await User.find(filter)
      .select('firstName imageUrls prompts gender type location hometown')
      .limit(50) // Limit results to improve performance
      .lean(); // Use lean() for better performance

    // Cache the results
    matchesCache.set(cacheKey, {
      matches,
      timestamp: Date.now()
    });

    return res.status(200).json({matches});
  } catch (error) {
    console.error('Error fetching matches:', error);
    res.status(500).json({message: 'Internal server error'});
  }
});

// Endpoint for liking a profile
app.post('/like-profile', async (req, res) => {
  try {
    const {userId, likedUserId, image, comment} = req.body;

    // Get user details for notification
    const user = await User.findById(userId).select('firstName');
    const likedUser = await User.findById(likedUserId).select('firstName');

    // Update the liked user's receivedLikes array
    await User.findByIdAndUpdate(likedUserId, {
      $push: {
        receivedLikes: {
          userId: userId,
          image: image,
          comment: comment,
        },
      },
    });
    // Update the user's likedProfiles array
    await User.findByIdAndUpdate(userId, {
      $push: {
        likedProfiles: likedUserId,
      },
    });

    // Send notification to the liked user
    createNotification(
      likedUserId,
      'like',
      'New Like! 💕',
      `${user.firstName} liked your profile${comment ? ` and left a comment` : ''}`,
      {
        fromUserId: userId,
        fromUserName: user.firstName,
        comment: comment,
        image: image
      }
    );

    // Clear matches cache for both users
    clearMatchesCache(userId);
    clearMatchesCache(likedUserId);

    res.status(200).json({message: 'Profile liked successfully'});
  } catch (error) {
    console.error('Error liking profile:', error);
    res.status(500).json({message: 'Internal server error'});
  }
});

app.get('/received-likes/:userId', async (req, res) => {
  try {
    const {userId} = req.params;

    const likes = await User.findById(userId)
      .populate('receivedLikes.userId', 'firstName imageUrls prompts')
      .select('receivedLikes');

    res.status(200).json({receivedLikes: likes.receivedLikes});
  } catch (error) {
    console.error('Error fetching received likes:', error);
    res.status(500).json({message: 'Internal server error'});
  }
});

//endpoint to create a match betweeen two people
app.post('/create-match', async (req, res) => {
  try {
    const {currentUserId, selectedUserId} = req.body;

    // Get user details for notifications
    const currentUser = await User.findById(currentUserId).select('firstName');
    const selectedUser = await User.findById(selectedUserId).select('firstName');

    //update the selected user's crushes array and the matches array
    await User.findByIdAndUpdate(selectedUserId, {
      $push: {matches: currentUserId},
      $pull: {likedProfiles: currentUserId},
    });

    //update the current user's matches array recievedlikes array
    await User.findByIdAndUpdate(currentUserId, {
      $push: {matches: selectedUserId},
    });

    // Find the user document by ID and update the receivedLikes array
    const updatedUser = await User.findByIdAndUpdate(
      currentUserId,
      {
        $pull: {receivedLikes: {userId: selectedUserId}},
      },
      {new: true},
    );

    if (!updatedUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Send match notifications to both users
    createNotification(
      currentUserId,
      'match',
      'It\'s a Match! 🎉',
      `You and ${selectedUser.firstName} liked each other!`,
      {
        matchedUserId: selectedUserId,
        matchedUserName: selectedUser.firstName
      }
    );

    createNotification(
      selectedUserId,
      'match',
      'It\'s a Match! 🎉',
      `You and ${currentUser.firstName} liked each other!`,
      {
        matchedUserId: currentUserId,
        matchedUserName: currentUser.firstName
      }
    );

    // If the user document was successfully updated
    res.status(200).json({message: 'ReceivedLikes updated successfully'});

    // Clear matches cache for both users
    clearMatchesCache(currentUserId);
    clearMatchesCache(selectedUserId);

  } catch (error) {
    res.status(500).json({message: 'Error creating a match', error});
  }
});

// Endpoint to get all matches of a specific user
app.get('/get-matches/:userId', async (req, res) => {
  try {
    const {userId} = req.params;

    // Find the user by ID and populate the matches field
    const user = await User.findById(userId).populate(
      'matches',
      'firstName imageUrls',
    );

    if (!user) {
      return res.status(404).json({message: 'User not found'});
    }

    // Extract matches from the user object
    const matches = user.matches;

    res.status(200).json({matches});
  } catch (error) {
    console.error('Error getting matches:', error);
    res.status(500).json({message: 'Internal server error'});
  }
});

io.on('connection', socket => {
  console.log('a user is connected');

  socket.on('sendMessage', async data => {
    try {
      const {senderId, receiverId, message} = data;

      console.log('data', data);

      const newMessage = new Chat({senderId, receiverId, message});
      await newMessage.save();

      // Get sender details for notification
      const sender = await User.findById(senderId).select('firstName');
      
      // Send notification to receiver
      createNotification(
        receiverId,
        'message',
        'New Message 💬',
        `${sender.firstName} sent you a message`,
        {
          fromUserId: senderId,
          fromUserName: sender.firstName,
          message: message.substring(0, 50) + (message.length > 50 ? '...' : '')
        }
      );

      //emit the message to the receiver
      io.to(receiverId).emit('receiveMessage', newMessage);
    } catch (error) {
      console.log('Error handling the messages');
    }
    socket.on('disconnet', () => {
      console.log('user disconnected');
    });
  });
});

server.listen(8000, () => {
  console.log('Socket.IO server running on port 8000');
});

app.get('/messages', async (req, res) => {
  try {
    const {senderId, receiverId} = req.query;

    console.log(senderId);
    console.log(receiverId);

    const messages = await Chat.find({
      $or: [
        {senderId: senderId, receiverId: receiverId},
        {senderId: receiverId, receiverId: senderId},
      ],
    }).populate('senderId', '_id name');

    res.status(200).json(messages);
  } catch (error) {
    res.status(500).json({message: 'Error in getting messages', error});
  }
});

// Endpoint to check if an email already exists
app.post('/check-email', async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }
    const user = await User.findOne({ email });
    if (user) {
      return res.status(409).json({ message: 'Email already exists' });
    }
    return res.status(200).json({ message: 'Email is available' });
  } catch (error) {
    console.error('Error checking email existence:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Upload photo to Cloudinary
app.post('/upload-photo', async (req, res) => {
  try {
    const { imageBase64, userId } = req.body;
    
    if (!imageBase64) {
      return res.status(400).json({ message: 'Image data is required' });
    }

    // Upload image to Cloudinary
    const uploadResult = await uploadImage(imageBase64, `dating-app/users/${userId}`);
    
    res.status(200).json({
      message: 'Photo uploaded successfully',
      imageUrl: uploadResult.url,
      publicId: uploadResult.public_id,
    });
  } catch (error) {
    console.error('Error uploading photo:', error);
    res.status(500).json({ message: 'Failed to upload photo' });
  }
});

// Upload multiple photos to Cloudinary
app.post('/upload-photos', async (req, res) => {
  try {
    const { images, userId } = req.body;
    
    if (!images || !Array.isArray(images) || images.length === 0) {
      return res.status(400).json({ message: 'Images array is required' });
    }

    const uploadPromises = images.map(async (imageBase64, index) => {
      try {
        const uploadResult = await uploadImage(imageBase64, `dating-app/users/${userId}`);
        return {
          index,
          url: uploadResult.url,
          publicId: uploadResult.public_id,
          success: true
        };
      } catch (error) {
        console.error(`Error uploading image ${index}:`, error);
        return { index, error: error.message, success: false };
      }
    });

    const uploadResults = await Promise.all(uploadPromises);
    const successfulUploads = uploadResults.filter(result => result.success);
    const failedUploads = uploadResults.filter(result => !result.success);

    if (successfulUploads.length > 0) {
      res.status(200).json({
        message: 'Photos uploaded successfully',
        successful: successfulUploads,
        failed: failedUploads,
        totalUploaded: successfulUploads.length,
      });
    } else {
      res.status(200).json({
        message: 'No photos were successfully uploaded',
        successful: [],
        failed: failedUploads,
        totalUploaded: 0
      });
    }
  } catch (error) {
    console.error('Error uploading photos:', error);
    res.status(500).json({ message: 'Failed to upload photos' });
  }
});

// Admin registration endpoint (for initial setup, remove or protect after first use)
app.post('/admin/register', async (req, res) => {
  try {
    const { email, password, role } = req.body;
    const existing = await Admin.findOne({ email });
    if (existing) {
      return res.status(409).json({ message: 'Admin already exists' });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const admin = new Admin({ email, password: hashedPassword, role });
    await admin.save();
    res.status(201).json({ message: 'Admin registered' });
  } catch (error) {
    res.status(500).json({ message: 'Error registering admin', error });
  }
});

// Admin login endpoint
app.post('/admin/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const admin = await Admin.findOne({ email });
    if (!admin) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }
    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid password' });
    }
    const token = jwt.sign({ adminId: admin._id, role: admin.role }, JWT_SECRET, { expiresIn: '1d' });
    res.status(200).json({ token, role: admin.role });
  } catch (error) {
    res.status(500).json({ message: 'Admin login failed', error });
  }
});

// Middleware to verify admin JWT and role
function adminAuth(requiredRole) {
  return (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'No token provided' });
    }
    const token = authHeader.split(' ')[1];
    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      if (requiredRole && decoded.role !== requiredRole) {
        return res.status(403).json({ message: 'Insufficient role' });
      }
      req.admin = decoded;
      next();
    } catch (err) {
      return res.status(401).json({ message: 'Invalid token' });
    }
  };
}

// Get current admin info
app.get('/admin/me', adminAuth(), async (req, res) => {
  try {
    const admin = await Admin.findById(req.admin.adminId).select('-password');
    if (!admin) {
      return res.status(404).json({ message: 'Admin not found' });
    }
    res.status(200).json({ admin });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching admin info', error });
  }
});

// Get all users (admin only)
app.get('/admin/users', adminAuth(), async (req, res) => {
  try {
    const users = await User.find().select('-password');
    res.status(200).json({ users });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching users', error });
  }
});

// Delete a user (admin only)
app.delete('/admin/users/:userId', adminAuth(), async (req, res) => {
  try {
    const { userId } = req.params;
    await User.findByIdAndDelete(userId);
    res.status(200).json({ message: 'User deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting user', error });
  }
});

// Ban or unban a user (admin only)
app.patch('/admin/users/:userId/ban', adminAuth(), async (req, res) => {
  try {
    const { userId } = req.params;
    const { ban } = req.body; // true to ban, false to unban
    const user = await User.findByIdAndUpdate(
      userId,
      { visibility: ban ? 'hidden' : 'public' },
      { new: true }
    );
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.status(200).json({ message: ban ? 'User banned' : 'User unbanned', user });
  } catch (error) {
    res.status(500).json({ message: 'Error updating user visibility', error });
  }
});

// Update a user's subscription (admin only)
app.patch('/admin/users/:userId/subscription', adminAuth(), async (req, res) => {
  try {
    const { userId } = req.params;
    const { subscriptionType, subscriptionStart, subscriptionEnd, isSubscribed } = req.body;
    const user = await User.findByIdAndUpdate(
      userId,
      {
        ...(subscriptionType && { subscriptionType }),
        ...(subscriptionStart && { subscriptionStart }),
        ...(subscriptionEnd && { subscriptionEnd }),
        ...(typeof isSubscribed === 'boolean' && { isSubscribed }),
      },
      { new: true }
    );
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.status(200).json({ message: 'Subscription updated', user });
  } catch (error) {
    res.status(500).json({ message: 'Error updating subscription', error });
  }
});

// Analytics endpoint (admin only)
app.get('/admin/analytics', adminAuth(), async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const maleUsers = await User.countDocuments({ gender: 'male' });
    const femaleUsers = await User.countDocuments({ gender: 'female' });
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay());
    const activeToday = await User.countDocuments({ lastActive: { $gte: startOfToday } });
    const activeThisWeek = await User.countDocuments({ lastActive: { $gte: startOfWeek } });
    const newSignups = await User.countDocuments({ createdAt: { $gte: startOfToday } });
    const newSignupsThisWeek = await User.countDocuments({ createdAt: { $gte: startOfWeek } });
    // Stub: flagged users and reported profiles/posts (replace with real queries if available)
    const flaggedUsers = await User.countDocuments({ flagged: true });
    const reportedProfiles = 5; // TODO: Replace with real count from reports collection
    // User activity by day (stub)
    const activeUsersByDay = [12, 19, 3, 5, 2, 3, 7];
    res.status(200).json({
      totalUsers,
      maleUsers,
      femaleUsers,
      activeToday,
      activeThisWeek,
      newSignups,
      newSignupsThisWeek,
      flaggedUsers,
      reportedProfiles,
      activeUsersByDay,
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching analytics', error });
  }
});

// Get a user's match history (admin only)
app.get('/admin/users/:userId/matches', adminAuth(), async (req, res) => {
  try {
    // TODO: Replace with real match history from DB
    const matches = [
      { name: 'Alice', date: '2024-06-01' },
      { name: 'Bob', date: '2024-06-02' },
    ];
    res.status(200).json({ matches });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching match history', error });
  }
});

// Get a user's message history (admin only)
app.get('/admin/users/:userId/messages', adminAuth(), async (req, res) => {
  try {
    // TODO: Replace with real message history from DB
    const messages = [
      { to: 'Alice', text: 'Hi!', date: '2024-06-01' },
      { from: 'Bob', text: 'Hello!', date: '2024-06-02' },
    ];
    res.status(200).json({ messages });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching message history', error });
  }
});

// List all admin users (superadmin only)
app.get('/admin/admins', adminAuth('superadmin'), async (req, res) => {
  try {
    const admins = await Admin.find().select('-password');
    res.status(200).json({ admins });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching admins', error });
  }
});

// Update an admin user (role/password, superadmin only)
app.patch('/admin/admins/:id', adminAuth('superadmin'), async (req, res) => {
  try {
    const { id } = req.params;
    const { role, password } = req.body;
    const update = {};
    if (role) update.role = role;
    if (password) {
      const bcrypt = require('bcrypt');
      update.password = await bcrypt.hash(password, 10);
    }
    const admin = await Admin.findByIdAndUpdate(id, update, { new: true }).select('-password');
    if (!admin) return res.status(404).json({ message: 'Admin not found' });
    res.status(200).json({ admin });
  } catch (error) {
    res.status(500).json({ message: 'Error updating admin', error });
  }
});

// Delete an admin user (superadmin only)
app.delete('/admin/admins/:id', adminAuth('superadmin'), async (req, res) => {
  try {
    const { id } = req.params;
    await Admin.findByIdAndDelete(id);
    res.status(200).json({ message: 'Admin deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting admin', error });
  }
});

// User: Start or get support chat
app.post('/support/chat', async (req, res) => {
  try {
    const { userId } = req.body;
    let chat = await SupportChat.findOne({ userId, status: 'open' });
    if (!chat) {
      chat = new SupportChat({ userId, messages: [] });
      await chat.save();
    }
    res.status(200).json({ chat });
  } catch (error) {
    res.status(500).json({ message: 'Error starting chat', error });
  }
});

// User: Send message
app.post('/support/message', async (req, res) => {
  try {
    const { chatId, text } = req.body;
    const chat = await SupportChat.findById(chatId);
    if (!chat) return res.status(404).json({ message: 'Chat not found' });
    chat.messages.push({ sender: 'user', text });
    await chat.save();
    io.to(chatId).emit('support_message', { chatId, message: { sender: 'user', text, timestamp: new Date() } });
    res.status(200).json({ chat });
  } catch (error) {
    res.status(500).json({ message: 'Error sending message', error });
  }
});

// User: Get own chat
app.get('/support/chat', async (req, res) => {
  try {
    const { userId } = req.query;
    const chat = await SupportChat.findOne({ userId, status: 'open' });
    if (!chat) return res.status(404).json({ message: 'No open chat' });
    res.status(200).json({ chat });
  } catch (error) {
    res.status(500).json({ message: 'Error getting chat', error });
  }
});

// Admin: List all support chats
app.get('/admin/support/chats', adminAuth(), async (req, res) => {
  try {
    const chats = await SupportChat.find().populate('userId', 'email').sort('-updatedAt');
    res.status(200).json({ chats });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching chats', error });
  }
});

// Admin: Get chat by id
app.get('/admin/support/chat/:id', adminAuth(), async (req, res) => {
  try {
    const chat = await SupportChat.findById(req.params.id).populate('userId', 'email');
    if (!chat) return res.status(404).json({ message: 'Chat not found' });
    res.status(200).json({ chat });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching chat', error });
  }
});

// Admin: Send message
app.post('/admin/support/message', adminAuth(), async (req, res) => {
  try {
    const { chatId, text, adminId } = req.body;
    const chat = await SupportChat.findById(chatId);
    if (!chat) return res.status(404).json({ message: 'Chat not found' });
    chat.messages.push({ sender: 'admin', text });
    chat.adminId = adminId;
    await chat.save();
    io.to(chatId).emit('support_message', { chatId, message: { sender: 'admin', text, timestamp: new Date() } });
    res.status(200).json({ chat });
  } catch (error) {
    res.status(500).json({ message: 'Error sending message', error });
  }
});

// Socket.IO for real-time support chat
io.on('connection', socket => {
  socket.on('join_support_chat', chatId => {
    socket.join(chatId);
  });
  // No need for send_message here, handled by REST and broadcast
});

// Notification endpoints
app.get('/api/notifications/:userId', (req, res) => {
  try {
    const { userId } = req.params;
    const userNotifications = getUserNotifications(userId);
    res.json(userNotifications);
  } catch (error) {
    console.error('Error fetching notifications:', error);
    res.status(500).json({ error: 'Failed to fetch notifications' });
  }
});

app.post('/api/notifications/:userId/read/:notificationId', (req, res) => {
  try {
    const { userId, notificationId } = req.params;
    markNotificationAsRead(userId, notificationId);
    res.json({ success: true });
  } catch (error) {
    console.error('Error marking notification as read:', error);
    res.status(500).json({ error: 'Failed to mark notification as read' });
  }
});

app.post('/api/notifications/:userId/read-all', (req, res) => {
  try {
    const { userId } = req.params;
    markAllNotificationsAsRead(userId);
    res.json({ success: true });
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    res.status(500).json({ error: 'Failed to mark all notifications as read' });
  }
});

app.delete('/api/notifications/:userId/:notificationId', (req, res) => {
  try {
    const { userId, notificationId } = req.params;
    deleteNotification(userId, notificationId);
    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting notification:', error);
    res.status(500).json({ error: 'Failed to delete notification' });
  }
});

// Admin notification endpoints
app.post('/admin/notifications/send', adminAuth(), async (req, res) => {
  try {
    const { targetUsers, type, title, message, data } = req.body;
    
    if (!targetUsers || !type || !title || !message) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const sentNotifications = [];
    
    for (const userId of targetUsers) {
      const notification = createNotification(userId, type, title, message, data);
      sentNotifications.push(notification);
    }

    res.json({ 
      success: true, 
      message: `Sent ${sentNotifications.length} notifications`,
      notifications: sentNotifications 
    });
  } catch (error) {
    console.error('Error sending admin notifications:', error);
    res.status(500).json({ error: 'Failed to send notifications' });
  }
});

app.get('/admin/notifications/stats', adminAuth(), (req, res) => {
  try {
    const stats = {
      totalUsers: notifications.size,
      totalNotifications: Array.from(notifications.values()).reduce((sum, userNotifs) => sum + userNotifs.length, 0),
      unreadNotifications: Array.from(notifications.values()).reduce((sum, userNotifs) => sum + userNotifs.filter(n => !n.read).length, 0),
      notificationTypes: {}
    };

    // Count notification types
    Array.from(notifications.values()).forEach(userNotifs => {
      userNotifs.forEach(notification => {
        stats.notificationTypes[notification.type] = (stats.notificationTypes[notification.type] || 0) + 1;
      });
    });

    res.json(stats);
  } catch (error) {
    console.error('Error fetching notification stats:', error);
    res.status(500).json({ error: 'Failed to fetch notification stats' });
  }
});
