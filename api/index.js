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

// Import models and configs
const User = require('./models/User');
const Chat = require('./models/message');
const Admin = require('./models/admin');
const SupportChat = require('./models/supportChat');
const Report = require('./models/report');
const { uploadImage, deleteImage } = require('./config/cloudinary');

const app = express();
const port = process.env.PORT || 3000;
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

// Helper function to normalize gender values
const normalizeGender = (gender) => {
  if (!gender) return null;
  const normalized = gender.toLowerCase();
  if (normalized === 'men' || normalized === 'male') return 'Male';
  if (normalized === 'women' || normalized === 'female') return 'Female';
  return gender; // Return original if not recognized
};

// Helper function to get opposite gender for matching
const getOppositeGender = (gender) => {
  const normalized = normalizeGender(gender);
  if (normalized === 'Male') return 'Female';
  if (normalized === 'Female') return 'Male';
  return null; // Return null if gender is not recognized
};

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

// CORS configuration
const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    const allowedOrigins = [
      'https://lashwa.com',
      'https://www.lashwa.com',
      'http://localhost:3000',
      'http://localhost:3001',
      'http://localhost:5173',
      'http://127.0.0.1:5173',
      'http://127.0.0.1:3001',
      'http://127.0.0.1:3000'
    ];
    
    // Allow any Vercel deployment
    if (origin.includes('vercel.app') || origin.includes('railway.app')) {
      return callback(null, true);
    }
    
    // Check if origin is in allowed list
    if (allowedOrigins.indexOf(origin) !== -1) {
      return callback(null, true);
    }
    
    console.log('CORS blocked origin:', origin);
    return callback(new Error('Not allowed by CORS'));
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  credentials: true
};

app.use(cors(corsOptions));

// Increase payload size limits for image uploads
app.use(bodyParser.urlencoded({extended: false, limit: '50mb'}));
app.use(bodyParser.json({limit: '50mb'}));
app.use(express.json({limit: '50mb'}));

// Add headers for Android compatibility
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  res.header('Access-Control-Allow-Credentials', 'true');
  
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
  } else {
    next();
  }
});

// Create API router for /api prefix
const apiRouter = express.Router();

// Make io available to routes
apiRouter.use((req, res, next) => {
  req.io = io;
  next();
});

const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET;

// Use environment variable for MongoDB URI
const MONGODB_URI = process.env.MONGODB_URI;

// Validate environment variables
if (!JWT_SECRET) throw new Error('JWT_SECRET environment variable is required');
if (!MONGODB_URI) throw new Error('MONGODB_URI environment variable is required');

mongoose
  .connect(MONGODB_URI)
  .then(() => {
    console.log('Connected to MongoDB');
  })
  .catch(error => {
    console.log('Error connecting to MongoDB', error);
  });

// Test endpoint to check if server is running
apiRouter.get('/test', (req, res) => {
  res.json({ 
    message: 'Server is running!',
    timestamp: new Date().toISOString(),
    socketConnected: req.io.engine.clientsCount
  });
});

// Debug endpoint to check socket connections
apiRouter.get('/debug/socket-users', (req, res) => {
  const connectedUsers = Array.from(req.io.sockets.sockets.keys());
  res.json({ 
    message: 'Socket debug info',
    connectedUsers: connectedUsers.length,
    userIds: connectedUsers
  });
});

// Health check route
apiRouter.get('/', (req, res) => {
  res.send('🚀 Lashwa API is up and running!');
});

// Root route for backward compatibility
app.get('/', (req, res) => {
  res.send('🚀 Lashwa backend is up and running!');
});

// Server will be started at the end of the file after all routes are defined

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
apiRouter.post('/register', async (req, res) => {
  try {
    // Extract user data from the request body
    const userData = req.body;

    // Normalize gender values
    if (userData.gender) {
      userData.gender = normalizeGender(userData.gender);
    }

    // Filter out empty strings for optional enum fields
    if (userData.children === '') {
      delete userData.children;
    }
    if (userData.smoking === '') {
      delete userData.smoking;
    }
    if (userData.drinking === '') {
      delete userData.drinking;
    }

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
apiRouter.get('/users/:userId', async (req, res) => {
  try {
    const {userId} = req.params;
    const { requestingUserId } = req.query; // ID of the user requesting the profile

    const user = await User.findById(userId).where({ isDeleted: { $ne: true } });

    if (!user) {
      return res.status(404).json({message: 'User not found'});
    }

    // Check if user account is deactivated
    if (!user.isActive) {
      return res.status(403).json({message: 'This account has been deactivated'});
    }

    // Calculate age from dateOfBirth
    const calculateAge = (dateOfBirth) => {
      if (!dateOfBirth) return null;
      
      // Handle DD/MM/YYYY format
      let birthDate;
      if (dateOfBirth.includes('/')) {
        const [day, month, year] = dateOfBirth.split('/');
        birthDate = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
      } else {
        birthDate = new Date(dateOfBirth);
      }
      
      const today = new Date();
      let age = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--;
      }
      return age;
    };

    // Add age to user object
    const userWithAge = user.toObject();
    userWithAge.age = calculateAge(user.dateOfBirth);

    // If requesting user is the same as the profile owner, return full data
    if (requestingUserId === userId) {
      return res.status(200).json({user: userWithAge});
    }

    // For other users, filter based on visibility settings
    const filteredUser = { ...userWithAge };
    
    // Remove gender if not visible
    if (!user.genderVisible) {
      delete filteredUser.gender;
    }
    
    // Remove type if not visible
    if (!user.typeVisible) {
      delete filteredUser.type;
    }
    
    // Remove lookingFor if not visible
    if (!user.lookingForVisible) {
      delete filteredUser.lookingFor;
    }
    
    // Remove visibility flags from response
    delete filteredUser.genderVisible;
    delete filteredUser.typeVisible;
    delete filteredUser.lookingForVisible;

    return res.status(200).json({user: filteredUser});
  } catch (error) {
    console.error('Error fetching user details:', error);
    res.status(500).json({message: 'Error fetching the user details'});
  }
});

// Endpoint to update profile visibility settings
apiRouter.put('/users/:userId/visibility', async (req, res) => {
  try {
    const { userId } = req.params;
    const { genderVisible, typeVisible, lookingForVisible } = req.body;

    // Validate that at least one visibility setting is provided
    if (genderVisible === undefined && typeVisible === undefined && lookingForVisible === undefined) {
      return res.status(400).json({ message: 'At least one visibility setting must be provided' });
    }

    const updateData = {};
    if (genderVisible !== undefined) updateData.genderVisible = genderVisible;
    if (typeVisible !== undefined) updateData.typeVisible = typeVisible;
    if (lookingForVisible !== undefined) updateData.lookingForVisible = lookingForVisible;

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      updateData,
      { new: true, runValidators: true }
    );

    if (!updatedUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Clear matches cache for this user since visibility changed
    clearMatchesCache(userId);

    res.status(200).json({ 
      message: 'Visibility settings updated successfully',
      user: {
        genderVisible: updatedUser.genderVisible,
        typeVisible: updatedUser.typeVisible,
        lookingForVisible: updatedUser.lookingForVisible
      }
    });
  } catch (error) {
    console.error('Error updating visibility settings:', error);
    res.status(500).json({ message: 'Error updating visibility settings' });
  }
});

// Endpoint to update user photos
apiRouter.put('/users/:userId/photos', async (req, res) => {
  try {
    const { userId } = req.params;
    const { imageUrls } = req.body;

    if (!imageUrls || !Array.isArray(imageUrls)) {
      return res.status(400).json({ message: 'imageUrls array is required' });
    }

    // Validate userId - must be a valid ObjectId
    const mongoose = require('mongoose');
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: 'Invalid userId format' });
    }

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { imageUrls },
      { new: true, runValidators: true }
    );

    if (!updatedUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json({ 
      message: 'Photos updated successfully',
      imageUrls: updatedUser.imageUrls
    });
  } catch (error) {
    console.error('Error updating photos:', error);
    res.status(500).json({ message: 'Error updating photos' });
  }
});

// Endpoint to update user profile
apiRouter.put('/users/:userId/profile', async (req, res) => {
  try {
    const { userId } = req.params;
    const updateData = req.body;

    // Fields that can be updated
    const allowedFields = [
      'location', 'gender', 'lookingFor', 'height', 'hometown', 
      'languages', 'bio', 'children', 'smoking', 'drinking', 
      'religion', 'occupation'
    ];

    // Filter out only allowed fields
    const filteredUpdateData = {};
    allowedFields.forEach(field => {
      if (updateData[field] !== undefined) {
        filteredUpdateData[field] = updateData[field];
      }
    });

    // Filter out empty strings for optional enum fields
    if (filteredUpdateData.children === '') {
      delete filteredUpdateData.children;
    }
    if (filteredUpdateData.smoking === '') {
      delete filteredUpdateData.smoking;
    }
    if (filteredUpdateData.drinking === '') {
      delete filteredUpdateData.drinking;
    }

    // Normalize gender values if being updated
    if (filteredUpdateData.gender) {
      filteredUpdateData.gender = normalizeGender(filteredUpdateData.gender);
    }

    // Validate bio length
    if (filteredUpdateData.bio && filteredUpdateData.bio.length > 500) {
      return res.status(400).json({ message: 'Bio cannot exceed 500 characters' });
    }

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      filteredUpdateData,
      { new: true, runValidators: true }
    );

    if (!updatedUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Calculate age from dateOfBirth
    const calculateAge = (dateOfBirth) => {
      if (!dateOfBirth) return null;
      
      // Handle DD/MM/YYYY format
      let birthDate;
      if (dateOfBirth.includes('/')) {
        const [day, month, year] = dateOfBirth.split('/');
        birthDate = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
      } else {
        birthDate = new Date(dateOfBirth);
      }
      
      const today = new Date();
      let age = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--;
      }
      return age;
    };

    // Add age to user object
    const userWithAge = updatedUser.toObject();
    userWithAge.age = calculateAge(updatedUser.dateOfBirth);

    // Clear matches cache for this user since profile changed
    clearMatchesCache(userId);

    res.status(200).json({ 
      message: 'Profile updated successfully',
      user: userWithAge
    });
  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).json({ message: 'Error updating profile' });
  }
});

//endpoint to login
apiRouter.post('/login', async (req, res) => {
  try {
    const {email, password} = req.body;

    //check if the user exists already
    const user = await User.findOne({email, isDeleted: { $ne: true }});
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

    // Check if user account is deleted
    if (user.isDeleted) {
      return res.status(403).json({message: 'Your account has been deleted and cannot be accessed.'});
    }

    // Check if user account is deactivated - allow reactivation on login
    if (!user.isActive) {
      // Reactivate the account automatically on successful login
      user.isActive = true;
      user.deactivatedAt = null;
      await user.save();
      
      console.log(`Account reactivated for user: ${user.email}`);
    }

    const token = jwt.sign({userId: user._id}, JWT_SECRET, {expiresIn: '1d'});

    return res.status(200).json({token});
  } catch (error) {
    res.status(500).json({message: 'login failed'});
  }
});

apiRouter.get('/matches', async (req, res) => {
  try {
    const {userId} = req.query;

    if (!userId) {
      return res.status(400).json({message: 'User ID is required'});
    }

    console.log('Fetching matches for userId:', userId);

    // Check cache first
    const cacheKey = `matches_${userId}`;
    const cachedData = matchesCache.get(cacheKey);
    
    if (cachedData && (Date.now() - cachedData.timestamp) < CACHE_DURATION) {
      console.log('Returning cached matches for user:', userId);
      return res.status(200).json({matches: cachedData.matches});
    }

    // Fetch user with only necessary fields in a single query
    const user = await User.findById(userId)
      .select('gender type datingPreferences matches likedProfiles blockedUsers rejectedProfiles')
      .lean();

    // Also fetch users who have liked the current user to exclude them from matches
    const usersWhoLikedMe = await User.find({
      likedProfiles: userId,
      isActive: true,
      isDeleted: { $ne: true }
    }).select('_id').lean();
    
    const usersWhoLikedMeIds = usersWhoLikedMe.map(u => u._id.toString());

    if (!user) {
      console.log('User not found:', userId);
      return res.status(404).json({message: 'User not found'});
    }

    console.log('Current user data:', {
      gender: user.gender,
      type: user.type,
      datingPreferences: user.datingPreferences,
      matches: user.matches?.length || 0,
      likedProfiles: user.likedProfiles?.length || 0,
      blockedUsers: user.blockedUsers?.length || 0,
      rejectedProfiles: user.rejectedProfiles?.length || 0,
      usersWhoLikedMe: usersWhoLikedMeIds.length
    });

    // Build filter object
    let filter = {
      _id: {$ne: userId},
      visibility: {$ne: 'hidden'}, // Exclude banned users
      isActive: true, // Only show active accounts
      isDeleted: {$ne: true} // Exclude deleted accounts
    };

    // Add gender filter based on user's dating preferences
    if (user.datingPreferences && user.datingPreferences.length > 0) {
      const genderPreferences = user.datingPreferences;
      
      if (genderPreferences.includes('Everyone')) {
        // Show all genders
        filter.gender = { $in: ['Male', 'Female', 'Non-binary'] };
      } else if (genderPreferences.includes('Male') && genderPreferences.includes('Female')) {
        // Show both male and female
        filter.gender = { $in: ['Male', 'Female'] };
      } else if (genderPreferences.includes('Male')) {
        // Show only male
        filter.gender = 'Male';
      } else if (genderPreferences.includes('Female')) {
        // Show only female
        filter.gender = 'Female';
      }
    } else {
      // Fallback to opposite gender if no preferences set
      const oppositeGender = getOppositeGender(user.gender);
      if (oppositeGender) {
        filter.gender = oppositeGender;
      }
    }

    // Add type filter if user has a type
    if (user.type) {
      filter.type = user.type;
    }

    // Get IDs to exclude (matches, liked profiles, blocked users, rejected profiles, and users who liked me)
    const excludeIds = [
      userId,
      ...(user.matches || []),
      ...(user.likedProfiles || []),
      ...(user.blockedUsers || []),
      ...(user.rejectedProfiles || []),
      ...usersWhoLikedMeIds
    ];

    console.log('Excluding IDs:', {
      userId,
      matchesCount: user.matches?.length || 0,
      likedProfilesCount: user.likedProfiles?.length || 0,
      blockedUsersCount: user.blockedUsers?.length || 0,
      rejectedProfilesCount: user.rejectedProfiles?.length || 0,
      usersWhoLikedMeCount: usersWhoLikedMeIds.length,
      totalExcluded: excludeIds.length,
      rejectedProfiles: user.rejectedProfiles || [],
      usersWhoLikedMe: usersWhoLikedMeIds
    });

    // Also need to exclude users who have blocked the current user
    // We'll handle this in the query by checking if the current user is in their blockedUsers array

    // Add exclusion filter
    if (excludeIds.length > 0) {
      filter._id = {$nin: excludeIds};
    }

    // Also exclude users who have blocked the current user
    // We need to check that the current user is not in their blockedUsers array
    filter.blockedUsers = { $nin: [userId] };

    console.log('Matches filter:', JSON.stringify(filter, null, 2));

    // First, let's see how many total users exist
    const totalUsers = await User.countDocuments({});
    console.log('Total users in database:', totalUsers);

    // Check how many users match the basic filter (without exclusions)
    const basicFilter = {
      _id: {$ne: userId},
      visibility: {$ne: 'hidden'},
      isActive: true, // Only show active accounts
      isDeleted: {$ne: true} // Exclude deleted accounts
    };
    
    // Add gender filter based on user's dating preferences for basic filter
    if (user.datingPreferences && user.datingPreferences.length > 0) {
      const genderPreferences = user.datingPreferences;
      
      if (genderPreferences.includes('Everyone')) {
        // Show all genders
        basicFilter.gender = { $in: ['Male', 'Female', 'Non-binary'] };
      } else if (genderPreferences.includes('Male') && genderPreferences.includes('Female')) {
        // Show both male and female
        basicFilter.gender = { $in: ['Male', 'Female'] };
      } else if (genderPreferences.includes('Male')) {
        // Show only male
        basicFilter.gender = 'Male';
      } else if (genderPreferences.includes('Female')) {
        // Show only female
        basicFilter.gender = 'Female';
      }
    } else {
      // Fallback to opposite gender if no preferences set
      const basicOppositeGender = getOppositeGender(user.gender);
      if (basicOppositeGender) {
        basicFilter.gender = basicOppositeGender;
      }
    }
    
    if (user.type) {
      basicFilter.type = user.type;
    }
    
    const basicMatches = await User.countDocuments(basicFilter);
    console.log('Users matching basic filter (before exclusions):', basicMatches);

    // Fetch matches with only necessary fields and limit results
    const matches = await User.find(filter)
      .select('firstName imageUrls prompts gender type location hometown genderVisible typeVisible lookingForVisible lookingFor')
      .limit(50) // Limit results to improve performance
      .lean(); // Use lean() for better performance

    console.log('Final matches found:', matches.length);

    // Filter out non-visible fields
    const filteredMatches = matches.map(match => {
      const filteredMatch = { ...match };
      
      // Remove gender if not visible
      if (!match.genderVisible) {
        delete filteredMatch.gender;
      }
      
      // Remove type if not visible
      if (!match.typeVisible) {
        delete filteredMatch.type;
      }
      
      // Remove lookingFor if not visible
      if (!match.lookingForVisible) {
        delete filteredMatch.lookingFor;
      }
      
      // Remove visibility flags from response
      delete filteredMatch.genderVisible;
      delete filteredMatch.typeVisible;
      delete filteredMatch.lookingForVisible;
      
      return filteredMatch;
    });

    // Cache the results
    matchesCache.set(cacheKey, {
      matches: filteredMatches,
      timestamp: Date.now()
    });

    console.log('Returning filtered matches:', filteredMatches.length);
    return res.status(200).json({matches: filteredMatches});
  } catch (error) {
    console.error('Error fetching matches:', error);
    res.status(500).json({message: 'Internal server error'});
  }
});

// Endpoint for liking a profile
apiRouter.post('/like-profile', async (req, res) => {
  try {
    const {userId, likedUserId, image, comment} = req.body;

    // Check if users are already matched
    const currentUser = await User.findById(userId).select('matches blockedUsers');
    const likedUser = await User.findById(likedUserId).select('matches blockedUsers');

    if (!currentUser || !likedUser) {
      return res.status(404).json({message: 'User not found'});
    }

    // Check if they are already matched
    const isAlreadyMatched = currentUser.matches && currentUser.matches.includes(likedUserId);
    const isAlreadyMatchedReverse = likedUser.matches && likedUser.matches.includes(userId);

    if (isAlreadyMatched || isAlreadyMatchedReverse) {
      return res.status(400).json({message: 'You are already matched with this user'});
    }

    // Check if either user has blocked the other
    const isBlocked = currentUser.blockedUsers && currentUser.blockedUsers.includes(likedUserId);
    const isBlockedReverse = likedUser.blockedUsers && likedUser.blockedUsers.includes(userId);

    if (isBlocked || isBlockedReverse) {
      return res.status(403).json({message: 'Cannot like this user'});
    }

    // Get user details for notification
    const user = await User.findById(userId).select('firstName');
    const likedUserDetails = await User.findById(likedUserId).select('firstName');

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
      $addToSet: {
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

// Endpoint for rejecting a profile
apiRouter.post('/reject-profile', async (req, res) => {
  try {
    const {userId, rejectedUserId} = req.body;

    if (!userId || !rejectedUserId) {
      return res.status(400).json({message: 'User ID and rejected user ID are required'});
    }

    // Check if users exist
    const user = await User.findById(userId);
    const rejectedUser = await User.findById(rejectedUserId);

    if (!user || !rejectedUser) {
      return res.status(404).json({message: 'User not found'});
    }

    // Add the rejected user to the user's rejectedProfiles array
    // This prevents them from showing up again in matches
    await User.findByIdAndUpdate(userId, {
      $addToSet: { rejectedProfiles: rejectedUserId }
    });

    console.log(`User ${userId} rejected user ${rejectedUserId}`);

    // Clear matches cache for the user
    clearMatchesCache(userId);

    res.status(200).json({message: 'Profile rejected successfully'});
  } catch (error) {
    console.error('Error rejecting profile:', error);
    res.status(500).json({message: 'Internal server error'});
  }
});

// Endpoint for unrejecting a profile (in case user changes their mind)
apiRouter.post('/unreject-profile', async (req, res) => {
  try {
    const {userId, rejectedUserId} = req.body;

    if (!userId || !rejectedUserId) {
      return res.status(400).json({message: 'User ID and rejected user ID are required'});
    }

    // Check if user exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({message: 'User not found'});
    }

    // Remove the rejected user from the user's rejectedProfiles array
    await User.findByIdAndUpdate(userId, {
      $pull: { rejectedProfiles: rejectedUserId }
    });

    // Clear matches cache for the user
    clearMatchesCache(userId);

    res.status(200).json({message: 'Profile unrejected successfully'});
  } catch (error) {
    console.error('Error unrejecting profile:', error);
    res.status(500).json({message: 'Internal server error'});
  }
});

// Get rejected profiles endpoint
apiRouter.get('/rejected-profiles/:userId', async (req, res) => {
  try {
    const { userId } = req.params;

    if (!userId) {
      return res.status(400).json({ message: 'User ID is required' });
    }

    const user = await User.findById(userId)
      .populate('rejectedProfiles', 'firstName lastName email imageUrls age location')
      .select('rejectedProfiles');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json({ 
      rejectedProfiles: user.rejectedProfiles || [] 
    });
  } catch (error) {
    console.error('Error fetching rejected profiles:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Debug endpoint to check rejection status
apiRouter.get('/debug-rejection/:userId/:otherUserId', async (req, res) => {
  try {
    const { userId, otherUserId } = req.params;

    const user = await User.findById(userId).select('rejectedProfiles blockedUsers');
    const otherUser = await User.findById(otherUserId).select('rejectedProfiles blockedUsers');

    if (!user || !otherUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    const userRejectedOther = user.rejectedProfiles && user.rejectedProfiles.includes(otherUserId);
    const otherRejectedUser = otherUser.rejectedProfiles && otherUser.rejectedProfiles.includes(userId);
    const userBlockedOther = user.blockedUsers && user.blockedUsers.includes(otherUserId);
    const otherBlockedUser = otherUser.blockedUsers && otherUser.blockedUsers.includes(userId);

    res.status(200).json({
      userRejectedOther,
      otherRejectedUser,
      userBlockedOther,
      otherBlockedUser,
      userRejectedProfiles: user.rejectedProfiles || [],
      otherRejectedProfiles: otherUser.rejectedProfiles || [],
      userBlockedUsers: user.blockedUsers || [],
      otherBlockedUsers: otherUser.blockedUsers || []
    });
  } catch (error) {
    console.error('Error checking rejection status:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Debug endpoint to get all rejected profiles for a user
apiRouter.get('/debug-rejected-profiles/:userId', async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId)
      .populate('rejectedProfiles', 'firstName lastName email')
      .select('rejectedProfiles');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json({
      rejectedProfiles: user.rejectedProfiles || [],
      count: user.rejectedProfiles ? user.rejectedProfiles.length : 0
    });
  } catch (error) {
    console.error('Error fetching rejected profiles:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

apiRouter.get('/received-likes/:userId', async (req, res) => {
  try {
    const {userId} = req.params;

    const user = await User.findById(userId)
      .populate('receivedLikes.userId', 'firstName imageUrls prompts age location occupation dateOfBirth')
      .select('receivedLikes blockedUsers rejectedProfiles');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Filter out likes from blocked users and rejected users
    const filteredLikes = user.receivedLikes.filter(like => {
      const isBlocked = user.blockedUsers && user.blockedUsers.includes(like.userId._id);
      const isRejected = user.rejectedProfiles && user.rejectedProfiles.includes(like.userId._id);
      return !isBlocked && !isRejected;
    });

    // Calculate age for each like if not already present
    const calculateAge = (dateOfBirth) => {
      if (!dateOfBirth) return null;
      
      // Handle DD/MM/YYYY format
      let birthDate;
      if (dateOfBirth.includes('/')) {
        const [day, month, year] = dateOfBirth.split('/');
        birthDate = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
      } else {
        birthDate = new Date(dateOfBirth);
      }
      
      const today = new Date();
      let age = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--;
      }
      return age;
    };

    // Add age to each like if not present
    const likesWithAge = filteredLikes.map(like => {
      const likeObj = like.toObject ? like.toObject() : like;
      if (likeObj.userId && !likeObj.userId.age && likeObj.userId.dateOfBirth) {
        likeObj.userId.age = calculateAge(likeObj.userId.dateOfBirth);
      }
      return likeObj;
    });

    res.status(200).json({receivedLikes: likesWithAge});
  } catch (error) {
    console.error('Error fetching received likes:', error);
    res.status(500).json({message: 'Internal server error'});
  }
});

//endpoint to create a match betweeen two people
apiRouter.post('/create-match', async (req, res) => {
  try {
    const {currentUserId, selectedUserId} = req.body;

    // Check if either user has blocked the other
    const currentUser = await User.findById(currentUserId).select('firstName blockedUsers');
    const selectedUser = await User.findById(selectedUserId).select('firstName blockedUsers');

    if (!currentUser || !selectedUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if either user has blocked the other
    const isBlocked = currentUser.blockedUsers && currentUser.blockedUsers.includes(selectedUserId);
    const isBlockedReverse = selectedUser.blockedUsers && selectedUser.blockedUsers.includes(currentUserId);

    if (isBlocked || isBlockedReverse) {
      return res.status(403).json({ message: 'Cannot create match with this user' });
    }

    //update the selected user's crushes array and the matches array
    await User.findByIdAndUpdate(selectedUserId, {
      $addToSet: {matches: currentUserId},
      $pull: {likedProfiles: currentUserId},
    });

    //update the current user's matches array recievedlikes array
    await User.findByIdAndUpdate(currentUserId, {
      $addToSet: {matches: selectedUserId},
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
apiRouter.get('/get-matches/:userId', async (req, res) => {
  try {
    const {userId} = req.params;

    // Find the user by ID and populate the matches field
    const user = await User.findById(userId)
      .populate('matches', 'firstName imageUrls age location occupation prompts bio hometown height languages children smoking drinking religion type lookingFor dateOfBirth')
      .populate('blockedUsers', '_id');

    if (!user) {
      return res.status(404).json({message: 'User not found'});
    }

    // Extract matches from the user object and filter out blocked users
    let matches = user.matches.filter(match => {
      return !user.blockedUsers || !user.blockedUsers.some(blocked => blocked._id.toString() === match._id.toString());
    });

    // Calculate age for each match if not already present
    const calculateAge = (dateOfBirth) => {
      if (!dateOfBirth) return null;
      
      // Handle DD/MM/YYYY format
      let birthDate;
      if (dateOfBirth.includes('/')) {
        const [day, month, year] = dateOfBirth.split('/');
        birthDate = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
      } else {
        birthDate = new Date(dateOfBirth);
      }
      
      const today = new Date();
      let age = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--;
      }
      return age;
    };

    // Add age to each match if not present
    matches = matches.map(match => {
      const matchObj = match.toObject ? match.toObject() : match;
      if (!matchObj.age && matchObj.dateOfBirth) {
        matchObj.age = calculateAge(matchObj.dateOfBirth);
      }
      return matchObj;
    });

    res.status(200).json({matches});
  } catch (error) {
    console.error('Error getting matches:', error);
    res.status(500).json({message: 'Internal server error'});
  }
});

// Store connected users for online status tracking
const connectedUsers = new Map();

io.on('connection', socket => {
  console.log('a user is connected');

  // User joins their own room for private messaging
  socket.on('join', async userId => {
    socket.join(userId);
    console.log('User joined room:', userId);
    
    // Mark user as online and update lastActive
    try {
      await User.findByIdAndUpdate(userId, {
        lastActive: new Date(),
        isOnline: true
      });
      
      // Store socket connection for this user
      connectedUsers.set(userId, socket.id);
      
      // Broadcast to all clients that this user is online
      socket.broadcast.emit('userOnline', userId);
      
      console.log('User marked as online:', userId);
    } catch (error) {
      console.error('Error marking user as online:', error);
    }
  });

  socket.on('sendMessage', async data => {
    try {
      const {senderId, receiverId, message} = data;
      console.log('Received sendMessage event:', data);
      
      if (!senderId || !receiverId || !message) {
        console.log('Invalid message data:', { senderId, receiverId, message });
        return;
      }
      
      const newMessage = new Chat({senderId, receiverId, message});
      await newMessage.save();
      console.log('Message saved to database:', newMessage);
      
      // Get sender details for notification
      const sender = await User.findById(senderId).select('firstName');
      console.log('Sender details:', sender);
      
      if (!sender) {
        console.log('Sender not found for ID:', senderId);
        return;
      }
      
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
      
      // Emit the message to both sender and receiver rooms
      console.log('Emitting message to receiver room:', receiverId);
      io.to(receiverId).emit('receiveMessage', newMessage);
      console.log('Emitting message to sender room:', senderId);
      io.to(senderId).emit('receiveMessage', newMessage);
      console.log('Message emitted successfully');
    } catch (error) {
      console.log('Error handling the messages:', error);
    }
  });

  socket.on('disconnect', async () => {
    console.log('user disconnected');
    
    // Find which user this socket belonged to
    let disconnectedUserId = null;
    for (const [userId, socketId] of connectedUsers.entries()) {
      if (socketId === socket.id) {
        disconnectedUserId = userId;
        break;
      }
    }
    
    if (disconnectedUserId) {
      // Mark user as offline
      try {
        await User.findByIdAndUpdate(disconnectedUserId, {
          isOnline: false
        });
        
        // Remove from connected users map
        connectedUsers.delete(disconnectedUserId);
        
        // Broadcast to all clients that this user is offline
        socket.broadcast.emit('userOffline', disconnectedUserId);
        
        console.log('User marked as offline:', disconnectedUserId);
      } catch (error) {
        console.error('Error marking user as offline:', error);
      }
    }
  });
});



apiRouter.get('/messages', async (req, res) => {
  try {
    const {senderId, receiverId} = req.query;

    if (!senderId || !receiverId) {
      return res.status(400).json({ message: 'senderId and receiverId are required' });
    }

    const messages = await Chat.find({
      $or: [
        {senderId: senderId, receiverId: receiverId},
        {senderId: receiverId, receiverId: senderId},
      ],
    }).populate('senderId', '_id firstName').sort({ timestamp: 1 });

    res.status(200).json(messages);
  } catch (error) {
    console.log('Error in /messages endpoint:', error);
    res.status(500).json({message: 'Error in getting messages', error});
  }
});

// Send a message via HTTP (alternative to Socket.IO)
apiRouter.post('/messages/send', async (req, res) => {
  try {
    const {senderId, receiverId, message} = req.body;
    console.log('Received HTTP message request:', { senderId, receiverId, message });
    
    if (!senderId || !receiverId || !message) {
      return res.status(400).json({ 
        message: 'senderId, receiverId, and message are required' 
      });
    }
    
    const newMessage = new Chat({senderId, receiverId, message});
    await newMessage.save();
    console.log('Message saved to database via HTTP:', newMessage);
    
    // Get sender details for notification
    const sender = await User.findById(senderId).select('firstName');
    console.log('Sender details:', sender);
    
    if (sender) {
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
    }
    
    // Emit the message via Socket.IO if available (for real-time updates)
    try {
      io.to(receiverId).emit('receiveMessage', newMessage);
      io.to(senderId).emit('receiveMessage', newMessage);
      console.log('Message emitted via Socket.IO');
    } catch (socketError) {
      console.log('Socket.IO not available, message sent via HTTP only');
    }
    
    res.status(200).json({ 
      success: true, 
      message: 'Message sent successfully',
      data: newMessage
    });
  } catch (error) {
    console.log('Error sending message via HTTP:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error sending message', 
      error: error.message 
    });
  }
});

// Get user online status
apiRouter.get('/user-status/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    
    const user = await User.findById(userId).select('isOnline lastActive');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Check if user is considered online (active within last 5 minutes)
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
    const isRecentlyActive = user.lastActive > fiveMinutesAgo;
    
    res.status(200).json({
      isOnline: user.isOnline && isRecentlyActive,
      lastActive: user.lastActive
    });
  } catch (error) {
    console.error('Error getting user status:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Endpoint to check if an email already exists
apiRouter.post('/check-email', async (req, res) => {
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
apiRouter.post('/upload-photo', async (req, res) => {
  try {
    const { imageBase64, userId } = req.body;
    
    if (!imageBase64) {
      return res.status(400).json({ message: 'Image data is required' });
    }

    console.log('Upload photo request received for user:', userId);
    console.log('Cloudinary config check:');
    console.log('- Cloud name:', process.env.CLOUDINARY_CLOUD_NAME ? 'Set' : 'Not set');
    console.log('- API Key:', process.env.CLOUDINARY_API_KEY ? 'Set' : 'Not set');
    console.log('- API Secret:', process.env.CLOUDINARY_API_SECRET ? 'Set' : 'Not set');

    // Upload image to Cloudinary
    const uploadResult = await uploadImage(imageBase64, `dating-app/users/${userId}`);
    
    console.log('Upload successful:', uploadResult.url);
    
    // Save the uploaded image URL to the user's profile
    try {
      const updatedUser = await User.findByIdAndUpdate(userId, { 
        $push: { imageUrls: uploadResult.url },
        $unset: { photos: 1 } // Remove old photos field if it exists
      }, { new: true });
      
      console.log('User updated successfully:', updatedUser._id);
      console.log('Current imageUrls:', updatedUser.imageUrls);
    } catch (updateError) {
      console.error('Error updating user:', updateError);
      throw updateError;
    }
    
    res.status(200).json({
      message: 'Photo uploaded successfully',
      imageUrl: uploadResult.url,
      publicId: uploadResult.public_id,
    });
  } catch (error) {
    console.error('Error uploading photo:', error);
    console.error('Error details:', {
      message: error.message,
      stack: error.stack,
      name: error.name
    });
    res.status(500).json({ 
      message: 'Failed to upload photo',
      error: error.message 
    });
  }
});

// Upload multiple photos to Cloudinary
apiRouter.post('/upload-photos', async (req, res) => {
  try {
    const { images, userId } = req.body;
    
    if (!images || !Array.isArray(images) || images.length === 0) {
      return res.status(400).json({ message: 'Images array is required' });
    }

    // Validate userId - must be a valid ObjectId or 'temp'
    if (userId && userId !== 'temp') {
      const mongoose = require('mongoose');
      if (!mongoose.Types.ObjectId.isValid(userId)) {
        return res.status(400).json({ message: 'Invalid userId format' });
      }
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
      // Save the uploaded image URLs to the user's profile
      const imageUrls = successfulUploads.map(upload => upload.url);
      
      // Only update user if userId is valid and not 'temp'
      if (userId && userId !== 'temp') {
        try {
          const updatedUser = await User.findByIdAndUpdate(userId, { 
            imageUrls,
            $unset: { photos: 1 } // Remove old photos field if it exists
          }, { new: true });
          
          console.log('User updated successfully:', updatedUser._id);
          console.log('Current imageUrls:', updatedUser.imageUrls);
        } catch (updateError) {
          console.error('Error updating user:', updateError);
          // Don't throw error here, just log it and continue
          console.log('Continuing without user update due to error');
        }
      } else {
        console.log('Skipping user update - userId is temp or invalid');
      }

      res.status(200).json({
        message: 'Photos uploaded successfully',
        successful: successfulUploads,
        failed: failedUploads,
        totalUploaded: successfulUploads.length,
        imageUrls: imageUrls
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
apiRouter.post('/admin/register', async (req, res) => {
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
apiRouter.post('/admin/login', async (req, res) => {
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
apiRouter.get('/admin/me', adminAuth(), async (req, res) => {
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

// Get all users (admin only) - Enhanced with comprehensive data
apiRouter.get('/admin/users', adminAuth(), async (req, res) => {
  try {
    const { page = 1, limit = 50, search, gender, type, visibility, sortBy = 'createdAt', sortOrder = 'desc' } = req.query;
    
    // Build filter object
    const filter = {};
    if (search) {
      filter.$or = [
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { location: { $regex: search, $options: 'i' } },
        { hometown: { $regex: search, $options: 'i' } }
      ];
    }
    if (gender) filter.gender = gender;
    if (type) filter.type = type;
    if (visibility) filter.visibility = visibility;

    // Build sort object
    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    // Get users with pagination
    const users = await User.find(filter)
      .select('-password')
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit))
      .populate('matches', 'firstName lastName email')
      .populate('likedProfiles', 'firstName lastName email')
      .populate('blockedUsers', 'firstName lastName email');

    // Get total count for pagination
    const totalUsers = await User.countDocuments(filter);
    
    // Calculate age for each user
    const usersWithAge = users.map(user => {
      const userObj = user.toObject();
      if (userObj.dateOfBirth) {
        const birthDate = new Date(userObj.dateOfBirth);
        const today = new Date();
        let age = today.getFullYear() - birthDate.getFullYear();
        const monthDiff = today.getMonth() - birthDate.getMonth();
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
          age--;
        }
        userObj.age = age;
      }
      return userObj;
    });

    res.status(200).json({ 
      users: usersWithAge, 
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(totalUsers / parseInt(limit)),
        totalUsers,
        hasNextPage: skip + users.length < totalUsers,
        hasPrevPage: parseInt(page) > 1
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching users', error: error.message });
  }
});

// Get detailed user information (admin only)
apiRouter.get('/admin/users/:userId/details', adminAuth(), async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await User.findById(userId)
      .select('-password')
      .populate('matches', 'firstName lastName email imageUrls')
      .populate('likedProfiles', 'firstName lastName email imageUrls')
      .populate('blockedUsers', 'firstName lastName email')
      .populate('rejectedProfiles', 'firstName lastName email');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Calculate age
    const userObj = user.toObject();
    if (userObj.dateOfBirth) {
      const birthDate = new Date(userObj.dateOfBirth);
      const today = new Date();
      let age = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--;
      }
      userObj.age = age;
    }

    // Get user activity stats
    const userStats = {
      totalMatches: userObj.matches?.length || 0,
      totalLikes: userObj.likedProfiles?.length || 0,
      totalBlocked: userObj.blockedUsers?.length || 0,
      totalRejected: userObj.rejectedProfiles?.length || 0,
      daysSinceJoined: Math.floor((new Date() - new Date(userObj.createdAt)) / (1000 * 60 * 60 * 24)),
      daysSinceLastActive: Math.floor((new Date() - new Date(userObj.lastActive)) / (1000 * 60 * 60 * 24))
    };

    res.status(200).json({ user: userObj, stats: userStats });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching user details', error: error.message });
  }
});

// Delete a user (admin only)
apiRouter.delete('/admin/users/:userId', adminAuth(), async (req, res) => {
  try {
    const { userId } = req.params;
    await User.findByIdAndDelete(userId);
    res.status(200).json({ message: 'User deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting user', error });
  }
});

// Update user information (admin only)
apiRouter.patch('/admin/users/:userId', adminAuth(), async (req, res) => {
  try {
    const { userId } = req.params;
    const updateData = req.body;
    
    // Remove sensitive fields that shouldn't be updated via admin
    delete updateData.password;
    delete updateData.email; // Email should be updated through a separate process
    
    const user = await User.findByIdAndUpdate(
      userId,
      updateData,
      { new: true }
    ).select('-password');
    
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.status(200).json({ message: 'User updated successfully', user });
  } catch (error) {
    res.status(500).json({ message: 'Error updating user', error: error.message });
  }
});

// Ban or unban a user (admin only)
apiRouter.patch('/admin/users/:userId/ban', adminAuth(), async (req, res) => {
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
apiRouter.patch('/admin/users/:userId/subscription', adminAuth(), async (req, res) => {
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

// Enhanced Analytics endpoint (admin only)
apiRouter.get('/admin/analytics', adminAuth(), async (req, res) => {
  try {
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay());
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    // Basic user counts
    const totalUsers = await User.countDocuments();
    const maleUsers = await User.countDocuments({ 
      gender: { $regex: /^male$/i } // Case-insensitive match for "male" or "Male"
    });
    const femaleUsers = await User.countDocuments({ 
      gender: { $regex: /^female$/i } // Case-insensitive match for "female" or "Female"
    });
    const otherUsers = await User.countDocuments({ 
      gender: { 
        $not: { 
          $regex: /^(male|female)$/i 
        } 
      } 
    });
    const bannedUsers = await User.countDocuments({ visibility: 'hidden' });
    const activeUsers = await User.countDocuments({ visibility: 'public' });

    // Activity metrics
    const activeToday = await User.countDocuments({ lastActive: { $gte: startOfToday } });
    const activeThisWeek = await User.countDocuments({ lastActive: { $gte: startOfWeek } });
    const activeThisMonth = await User.countDocuments({ lastActive: { $gte: startOfMonth } });
    const newSignups = await User.countDocuments({ createdAt: { $gte: startOfToday } });
    const newSignupsThisWeek = await User.countDocuments({ createdAt: { $gte: startOfWeek } });
    const newSignupsThisMonth = await User.countDocuments({ createdAt: { $gte: startOfMonth } });

    // User engagement metrics
    const usersWithMatches = await User.countDocuments({ 'matches.0': { $exists: true } });
    const usersWithLikes = await User.countDocuments({ 'likedProfiles.0': { $exists: true } });
    const usersWithPhotos = await User.countDocuments({ 'imageUrls.0': { $exists: true } });

    // Simple user type distribution
    const userTypes = await User.aggregate([
      { $group: { _id: '$type', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]).catch(() => []);

    // Simple location distribution
    const topLocations = await User.aggregate([
      { $match: { location: { $exists: true, $ne: '' } } },
      { $group: { _id: '$location', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]).catch(() => []);

    // Simple age distribution
    const ageDistribution = await User.aggregate([
      { $match: { dateOfBirth: { $exists: true, $ne: null } } },
      {
        $addFields: {
          age: {
            $floor: {
              $divide: [
                { $subtract: [new Date(), '$dateOfBirth'] },
                365 * 24 * 60 * 60 * 1000
              ]
            }
          }
        }
      },
      {
        $bucket: {
          groupBy: '$age',
          boundaries: [18, 25, 35, 45, 55, 65, 100],
          default: '65+',
          output: { count: { $sum: 1 } }
        }
      }
    ]).catch(() => []);

    // Recent activity trends (last 7 days)
    const activityTrend = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      const startOfDay = new Date(date.getFullYear(), date.getMonth(), date.getDate());
      const endOfDay = new Date(startOfDay.getTime() + 24 * 60 * 60 * 1000);
      
      const activeCount = await User.countDocuments({
        lastActive: { $gte: startOfDay, $lt: endOfDay }
      });
      
      activityTrend.push({
        date: startOfDay.toISOString().split('T')[0],
        activeUsers: activeCount
      });
    }

    res.status(200).json({
      // Basic counts
      totalUsers,
      maleUsers,
      femaleUsers,
      otherUsers,
      bannedUsers,
      activeUsers,
      
      // Activity metrics
      activeToday,
      activeThisWeek,
      activeThisMonth,
      newSignups,
      newSignupsThisWeek,
      newSignupsThisMonth,
      
      // Distributions
      userTypes,
      ageDistribution,
      topLocations,
      
      // Trends
      activityTrend,
      
      // Engagement
      usersWithMatches,
      usersWithLikes,
      usersWithPhotos,
      
      // Percentages
      engagementRate: totalUsers > 0 ? Math.round((usersWithMatches / totalUsers) * 100) : 0,
      photoUploadRate: totalUsers > 0 ? Math.round((usersWithPhotos / totalUsers) * 100) : 0,
      banRate: totalUsers > 0 ? Math.round((bannedUsers / totalUsers) * 100) : 0
    });
  } catch (error) {
    console.error('Analytics error:', error);
    res.status(500).json({ message: 'Error fetching analytics', error: error.message });
  }
});

// Get a user's match history (admin only)
apiRouter.get('/admin/users/:userId/matches', adminAuth(), async (req, res) => {
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
apiRouter.get('/admin/users/:userId/messages', adminAuth(), async (req, res) => {
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
apiRouter.get('/admin/admins', adminAuth('superadmin'), async (req, res) => {
  try {
    const admins = await Admin.find().select('-password');
    res.status(200).json({ admins });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching admins', error });
  }
});

// Update an admin user (role/password, superadmin only)
apiRouter.patch('/admin/admins/:id', adminAuth('superadmin'), async (req, res) => {
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
apiRouter.delete('/admin/admins/:id', adminAuth('superadmin'), async (req, res) => {
  try {
    const { id } = req.params;
    await Admin.findByIdAndDelete(id);
    res.status(200).json({ message: 'Admin deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting admin', error });
  }
});

// User: Start or get support chat
apiRouter.post('/support/chat', async (req, res) => {
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
apiRouter.post('/support/message', async (req, res) => {
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
apiRouter.get('/support/chat', async (req, res) => {
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
apiRouter.get('/admin/support/chats', adminAuth(), async (req, res) => {
  try {
    const chats = await SupportChat.find().populate('userId', 'email').sort('-updatedAt');
    res.status(200).json({ chats });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching chats', error });
  }
});

// Admin: Get chat by id
apiRouter.get('/admin/support/chat/:id', adminAuth(), async (req, res) => {
  try {
    const chat = await SupportChat.findById(req.params.id).populate('userId', 'email');
    if (!chat) return res.status(404).json({ message: 'Chat not found' });
    res.status(200).json({ chat });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching chat', error });
  }
});

// Admin: Send message
apiRouter.post('/admin/support/message', adminAuth(), async (req, res) => {
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
apiRouter.get('/notifications/:userId', (req, res) => {
  try {
    const { userId } = req.params;
    const userNotifications = getUserNotifications(userId);
    res.json(userNotifications);
  } catch (error) {
    console.error('Error fetching notifications:', error);
    res.status(500).json({ error: 'Failed to fetch notifications' });
  }
});

apiRouter.post('/notifications/:userId/read/:notificationId', (req, res) => {
  try {
    const { userId, notificationId } = req.params;
    markNotificationAsRead(userId, notificationId);
    res.json({ success: true });
  } catch (error) {
    console.error('Error marking notification as read:', error);
    res.status(500).json({ error: 'Failed to mark notification as read' });
  }
});

apiRouter.post('/notifications/:userId/read-all', (req, res) => {
  try {
    const { userId } = req.params;
    markAllNotificationsAsRead(userId);
    res.json({ success: true });
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    res.status(500).json({ error: 'Failed to mark all notifications as read' });
  }
});

apiRouter.delete('/notifications/:userId/:notificationId', (req, res) => {
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
apiRouter.post('/admin/notifications/send', adminAuth(), async (req, res) => {
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

apiRouter.get('/admin/notifications/stats', adminAuth(), (req, res) => {
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

// Test endpoint to see all users (for debugging)
apiRouter.get('/test-users', async (req, res) => {
  try {
    const users = await User.find({})
      .select('firstName gender type visibility')
      .lean();
    
    console.log('All users in database:', users);
    res.status(200).json({
      totalUsers: users.length,
      users: users
    });
  } catch (error) {
    console.error('Error fetching test users:', error);
    res.status(500).json({message: 'Internal server error'});
  }
});

// Get user stats (profile views, likes received, matches)
apiRouter.get('/user-stats/:userId', async (req, res) => {
  try {
    const { userId } = req.params;

    if (!userId) {
      return res.status(400).json({ message: 'User ID is required' });
    }

    // Get the user to access their data
    const user = await User.findById(userId)
      .select('receivedLikes matches')
      .lean();

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Count received likes - this is real data
    const likesReceived = user.receivedLikes?.length || 0;

    // Count matches - this is real data
    const matchesCount = user.matches?.length || 0;

    console.log('Raw user data for stats:', {
      userId,
      receivedLikes: user.receivedLikes,
      matches: user.matches,
      likesCount: likesReceived,
      matchesCount: matchesCount
    });

    // For profile views, let's be more realistic
    // Since we don't have a proper tracking system yet, we'll show a reasonable estimate
    // based on the user's activity level
    let profileViews = 0;
    if (likesReceived > 0 || matchesCount > 0) {
      // If they have likes or matches, they've been viewed
      profileViews = Math.max(likesReceived * 2, matchesCount * 3, 5);
    } else {
      // New users start with a few views
      profileViews = 3;
    }

    const stats = {
      profileViews,
      likesReceived,
      matchesCount
    };

    console.log('User stats for:', userId, stats);
    res.status(200).json({ stats });
  } catch (error) {
    console.error('Error fetching user stats:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Track profile view (call this when someone views a profile)
apiRouter.post('/track-profile-view', async (req, res) => {
  try {
    const { viewedUserId, viewerUserId } = req.body;

    if (!viewedUserId) {
      return res.status(400).json({ message: 'Viewed user ID is required' });
    }

    // In a real app, you'd store this in a separate collection
    // For now, we'll just log it
    console.log('Profile view tracked:', { viewedUserId, viewerUserId, timestamp: new Date() });

    res.status(200).json({ message: 'Profile view tracked successfully' });
  } catch (error) {
    console.error('Error tracking profile view:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Test endpoint to see all users and their stats
apiRouter.get('/test-users-stats', async (req, res) => {
  try {
    const users = await User.find({})
      .select('firstName email receivedLikes matches')
      .lean();

    const usersWithStats = users.map(user => ({
      id: user._id,
      name: user.firstName,
      email: user.email,
      receivedLikes: user.receivedLikes?.length || 0,
      matches: user.matches?.length || 0,
      rawReceivedLikes: user.receivedLikes,
      rawMatches: user.matches
    }));

    console.log('All users with stats:', usersWithStats);
    res.status(200).json({ users: usersWithStats });
  } catch (error) {
    console.error('Error fetching test users stats:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Test endpoint to create a notification
apiRouter.post('/test-create-notification', async (req, res) => {
  try {
    const { userId, type, title, message } = req.body;
    
    if (!userId || !type || !title || !message) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    const notification = createNotification(userId, type, title, message);
    console.log('Test notification created:', notification);
    
    res.status(200).json({ 
      message: 'Test notification created successfully',
      notification 
    });
  } catch (error) {
    console.error('Error creating test notification:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Endpoint to deduplicate matches and likedProfiles arrays
apiRouter.post('/deduplicate-user/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    let needsUpdate = false;
    const updates = {};
    
    // Clean up matches array
    if (user.matches && user.matches.length > 0) {
      const uniqueMatches = [...new Set(user.matches.map(match => match.toString()))];
      if (uniqueMatches.length !== user.matches.length) {
        console.log(`User ${user.firstName} (${user._id}): Found ${user.matches.length - uniqueMatches.length} duplicate matches`);
        updates.matches = uniqueMatches;
        needsUpdate = true;
      }
    }
    
    // Clean up likedProfiles array
    if (user.likedProfiles && user.likedProfiles.length > 0) {
      const uniqueLikedProfiles = [...new Set(user.likedProfiles.map(profile => profile.toString()))];
      if (uniqueLikedProfiles.length !== user.likedProfiles.length) {
        console.log(`User ${user.firstName} (${user._id}): Found ${user.likedProfiles.length - uniqueLikedProfiles.length} duplicate liked profiles`);
        updates.likedProfiles = uniqueLikedProfiles;
        needsUpdate = true;
      }
    }
    
    // Update user if needed
    if (needsUpdate) {
      await User.findByIdAndUpdate(userId, updates);
      res.status(200).json({ 
        message: 'User deduplicated successfully',
        removedDuplicates: true
      });
    } else {
      res.status(200).json({ 
        message: 'No duplicates found',
        removedDuplicates: false
      });
    }
    
  } catch (error) {
    console.error('Error deduplicating user:', error);
    res.status(500).json({ message: 'Error deduplicating user' });
  }
});

// Block/Unblock user endpoint
apiRouter.post('/block-user', async (req, res) => {
  try {
    const { userId, blockedUserId } = req.body;

    if (!userId || !blockedUserId) {
      return res.status(400).json({ message: 'User ID and blocked user ID are required' });
    }

    if (userId === blockedUserId) {
      return res.status(400).json({ message: 'Cannot block yourself' });
    }

    const user = await User.findById(userId);
    const blockedUser = await User.findById(blockedUserId);

    if (!user || !blockedUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if already blocked
    const isAlreadyBlocked = user.blockedUsers && user.blockedUsers.includes(blockedUserId);
    
    if (isAlreadyBlocked) {
      return res.status(400).json({ message: 'User is already blocked' });
    }

    // Add to blocked users (unidirectional blocking)
    // Only the user who initiates the block adds the other user to their blockedUsers array
    await User.findByIdAndUpdate(userId, {
      $addToSet: { blockedUsers: blockedUserId }
    });

    // Remove from matches if they were matched
    await User.findByIdAndUpdate(userId, {
      $pull: { matches: blockedUserId }
    });
    await User.findByIdAndUpdate(blockedUserId, {
      $pull: { matches: userId }
    });

    // Remove from liked profiles
    await User.findByIdAndUpdate(userId, {
      $pull: { likedProfiles: blockedUserId }
    });
    await User.findByIdAndUpdate(blockedUserId, {
      $pull: { likedProfiles: userId }
    });

    // Remove from received likes
    await User.findByIdAndUpdate(userId, {
      $pull: { receivedLikes: { userId: blockedUserId } }
    });
    await User.findByIdAndUpdate(blockedUserId, {
      $pull: { receivedLikes: { userId: userId } }
    });

    // Clear matches cache for both users
    clearMatchesCache(userId);
    clearMatchesCache(blockedUserId);

    res.status(200).json({ message: 'User blocked successfully' });
  } catch (error) {
    console.error('Error blocking user:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Unblock user endpoint
apiRouter.post('/unblock-user', async (req, res) => {
  try {
    const { userId, blockedUserId } = req.body;

    if (!userId || !blockedUserId) {
      return res.status(400).json({ message: 'User ID and blocked user ID are required' });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if user is blocked
    const isBlocked = user.blockedUsers && user.blockedUsers.includes(blockedUserId);
    
    if (!isBlocked) {
      return res.status(400).json({ message: 'User is not blocked' });
    }

    // Remove from blocked users (unidirectional unblocking)
    // Only the user who initiated the unblock removes the other user from their blockedUsers array
    await User.findByIdAndUpdate(userId, {
      $pull: { blockedUsers: blockedUserId }
    });

    // Clear matches cache for both users
    clearMatchesCache(userId);
    clearMatchesCache(blockedUserId);

    res.status(200).json({ message: 'User unblocked successfully' });
  } catch (error) {
    console.error('Error unblocking user:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get blocked users endpoint
apiRouter.get('/blocked-users/:userId', async (req, res) => {
  try {
    const { userId } = req.params;

    if (!userId) {
      return res.status(400).json({ message: 'User ID is required' });
    }

    const user = await User.findById(userId)
      .populate('blockedUsers', 'firstName lastName email imageUrls age location dateOfBirth')
      .select('blockedUsers');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json({ 
      blockedUsers: user.blockedUsers || [] 
    });
  } catch (error) {
    console.error('Error fetching blocked users:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Report user endpoint
apiRouter.post('/report-user', async (req, res) => {
  try {
    const { reporterId, reportedUserId, reason, description } = req.body;

    if (!reporterId || !reportedUserId || !reason) {
      return res.status(400).json({ message: 'Reporter ID, reported user ID, and reason are required' });
    }

    if (reporterId === reportedUserId) {
      return res.status(400).json({ message: 'Cannot report yourself' });
    }

    // Check if users exist
    const reporter = await User.findById(reporterId);
    const reportedUser = await User.findById(reportedUserId);

    if (!reporter || !reportedUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if already reported by this user
    const existingReport = await Report.findOne({
      reporterId,
      reportedUserId,
      status: { $in: ['pending', 'reviewed'] }
    });

    if (existingReport) {
      return res.status(400).json({ message: 'You have already reported this user' });
    }

    // Create new report
    const report = new Report({
      reporterId,
      reportedUserId,
      reason,
      description: description || '',
      status: 'pending'
    });

    await report.save();

    res.status(201).json({ 
      message: 'User reported successfully',
      reportId: report._id
    });
  } catch (error) {
    console.error('Error reporting user:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get user reports (for admin)
apiRouter.get('/admin/reports', adminAuth(), async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const skip = (page - 1) * limit;

    let query = {};
    if (status) {
      query.status = status;
    }

    const reports = await Report.find(query)
      .populate('reporterId', 'firstName lastName email')
      .populate('reportedUserId', 'firstName lastName email')
      .populate('reviewedBy', 'email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Report.countDocuments(query);

    res.status(200).json({
      reports,
      total,
      page: parseInt(page),
      totalPages: Math.ceil(total / limit)
    });
  } catch (error) {
    console.error('Error fetching reports:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Update report status (for admin)
apiRouter.patch('/admin/reports/:reportId', adminAuth(), async (req, res) => {
  try {
    const { reportId } = req.params;
    const { status, adminNotes } = req.body;
    const adminId = req.admin.adminId;

    if (!status) {
      return res.status(400).json({ message: 'Status is required' });
    }

    const report = await Report.findById(reportId);
    if (!report) {
      return res.status(404).json({ message: 'Report not found' });
    }

    const updateData = {
      status,
      reviewedBy: adminId,
      reviewedAt: new Date()
    };

    if (adminNotes) {
      updateData.adminNotes = adminNotes;
    }

    const updatedReport = await Report.findByIdAndUpdate(
      reportId,
      updateData,
      { new: true }
    ).populate('reporterId', 'firstName lastName email')
     .populate('reportedUserId', 'firstName lastName email')
     .populate('reviewedBy', 'email');

    res.status(200).json({
      message: 'Report updated successfully',
      report: updatedReport
    });
  } catch (error) {
    console.error('Error updating report:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get report statistics (for admin dashboard)
apiRouter.get('/admin/reports/stats', adminAuth(), async (req, res) => {
  try {
    const totalReports = await Report.countDocuments();
    const pendingReports = await Report.countDocuments({ status: 'pending' });
    const reviewedReports = await Report.countDocuments({ status: 'reviewed' });
    const resolvedReports = await Report.countDocuments({ status: 'resolved' });
    const dismissedReports = await Report.countDocuments({ status: 'dismissed' });

    // Get reports by reason
    const reportsByReason = await Report.aggregate([
      {
        $group: {
          _id: '$reason',
          count: { $sum: 1 }
        }
      }
    ]);

    // Get recent reports (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const recentReports = await Report.countDocuments({
      createdAt: { $gte: sevenDaysAgo }
    });

    res.status(200).json({
      totalReports,
      pendingReports,
      reviewedReports,
      resolvedReports,
      dismissedReports,
      reportsByReason,
      recentReports
    });
  } catch (error) {
    console.error('Error fetching report statistics:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Check if user is blocked by another user
apiRouter.get('/check-blocked/:userId/:otherUserId', async (req, res) => {
  try {
    const { userId, otherUserId } = req.params;

    if (!userId || !otherUserId) {
      return res.status(400).json({ message: 'Both user IDs are required' });
    }

    const user = await User.findById(userId).select('blockedUsers');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const isBlocked = user.blockedUsers && user.blockedUsers.includes(otherUserId);

    res.status(200).json({ 
      isBlocked,
      blockedByMe: isBlocked
    });
  } catch (error) {
    console.error('Error checking blocked status:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get reports for a specific user (for admin)
apiRouter.get('/admin/users/:userId/reports', adminAuth(), async (req, res) => {
  try {
    const { userId } = req.params;

    const reports = await Report.find({
      $or: [
        { reporterId: userId },
        { reportedUserId: userId }
      ]
    })
    .populate('reporterId', 'firstName lastName email')
    .populate('reportedUserId', 'firstName lastName email')
    .populate('reviewedBy', 'email')
    .sort({ createdAt: -1 });

    res.status(200).json({ reports });
  } catch (error) {
    console.error('Error fetching user reports:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Account Management Endpoints

// Deactivate user account
apiRouter.put('/users/:userId/deactivate', async (req, res) => {
  try {
    const { userId } = req.params;
    const { password } = req.body;

    if (!password) {
      return res.status(400).json({ message: 'Password is required to deactivate account' });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid password' });
    }

    // Deactivate account
    user.isActive = false;
    user.deactivatedAt = new Date();
    await user.save();

    res.status(200).json({ 
      message: 'Account deactivated successfully',
      deactivatedAt: user.deactivatedAt
    });
  } catch (error) {
    console.error('Error deactivating account:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Reactivate user account
apiRouter.put('/users/:userId/reactivate', async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Reactivate account
    user.isActive = true;
    user.deactivatedAt = null;
    await user.save();

    res.status(200).json({ 
      message: 'Account reactivated successfully'
    });
  } catch (error) {
    console.error('Error reactivating account:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Delete user account permanently
apiRouter.delete('/users/:userId/delete', async (req, res) => {
  try {
    const { userId } = req.params;
    const { password } = req.body;

    if (!password) {
      return res.status(400).json({ message: 'Password is required to delete account' });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid password' });
    }

    // Mark account as deleted (soft delete)
    user.isDeleted = true;
    user.deletedAt = new Date();
    user.isActive = false; // Also deactivate
    await user.save();

    res.status(200).json({ 
      message: 'Account deleted successfully',
      deletedAt: user.deletedAt
    });
  } catch (error) {
    console.error('Error deleting account:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get account status
apiRouter.get('/users/:userId/account-status', async (req, res) => {
  try {
    const { userId } = req.params;

    // Validate ObjectId format
    if (!userId || !userId.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ message: 'Invalid user ID format' });
    }

    const user = await User.findById(userId).select('isActive isDeleted deactivatedAt deletedAt');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json({
      isActive: user.isActive,
      isDeleted: user.isDeleted,
      deactivatedAt: user.deactivatedAt,
      deletedAt: user.deletedAt
    });
  } catch (error) {
    console.error('Error fetching account status:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Mount the API router
app.use('/api', apiRouter);

const PORT = process.env.PORT || 3000; // Use environment PORT or default to 3000

server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`Socket.IO server is also running on port ${PORT}`);
});
