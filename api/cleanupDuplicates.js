const mongoose = require('mongoose');
const User = require('./models/user');

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/datingapp', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const cleanupDuplicates = async () => {
  try {
    console.log('Starting cleanup of duplicate entries...');
    
    // Get all users
    const users = await User.find({});
    console.log(`Found ${users.length} users to process`);
    
    let updatedCount = 0;
    
    for (const user of users) {
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
        await User.findByIdAndUpdate(user._id, updates);
        updatedCount++;
      }
    }
    
    console.log(`Cleanup completed! Updated ${updatedCount} users`);
    
  } catch (error) {
    console.error('Error during cleanup:', error);
  } finally {
    mongoose.connection.close();
  }
};

// Run the cleanup
cleanupDuplicates(); 