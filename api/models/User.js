const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Define the user schema
const userSchema = new Schema({
  firstName: {
    type: String,
    required: true,
  },
  lastName: {
    type: String,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  gender: {
    type: String,
    required: true,
  },
  dateOfBirth: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    required: true,
  },
  location: {
    type: String,
    required: true,
  },
  hometown: {
    type: String,
    required: true,
  },
  // New fields for enhanced profile
  bio: {
    type: String,
    maxlength: 500, // Limit bio to 500 characters
  },
  height: {
    type: String, // e.g., "5'8"", "175 cm"
  },
  languages: [{
    type: String,
  }],
  children: {
    type: String,
    enum: ['Yes, I have children', 'No, I don\'t have children', 'Prefer not to say'],
  },
  smoking: {
    type: String,
    enum: ['Yes, I smoke', 'No, I don\'t smoke', 'Occasionally', 'Prefer not to say'],
  },
  drinking: {
    type: String,
    enum: ['Yes, I drink', 'No, I don\'t drink', 'Occasionally', 'Prefer not to say'],
  },
  religion: {
    type: String,
  },
  occupation: {
    type: String,
  },
  datingPreferences: [
    {
      type: String,
    },
  ],
  lookingFor: {
    type: String,
    required: true,
  },
  photos: [
    {
      type: String, // Store URLs of profile pictures
    },
  ],
  prompts: [
    {
      question: {
        type: String,
        required: true,
      },
      answer: {
        type: String,
        required: true,
      },
    },
  ],
  //   genderPreference: {
  //     type: String,
  //     enum: ['male', 'female', 'both'],
  //     required: true,
  //   },
  //   ageRangePreference: {
  //     min: {
  //       type: Number,
  //       default: 18,
  //     },
  //     max: {
  //       type: Number,
  //       default: 99,
  //     },
  //   },
  likedProfiles: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  ],
  receivedLikes: [
    {
      userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
      },
      image: {
        type: String,
        required: true,
      },
      comment: {
        type: String,
      },
    },
  ],
  matches: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  ],
  lastLogin: {
    type: Date,
    default: Date.now,
  },
  lastActive: {
    type: Date,
    default: Date.now,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  visibility: {
    type: String,
    enum: ['public', 'hidden'],
    default: 'public',
  },
  // Profile section visibility settings
  genderVisible: {
    type: Boolean,
    default: true,
  },
  typeVisible: {
    type: Boolean,
    default: true,
  },
  lookingForVisible: {
    type: Boolean,
    default: true,
  },
  blockedUsers: [
    {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
  ],
  rejectedProfiles: [
    {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
  ],
  notificationPreferences: {
    // Define notification preferences here
  },
});

// Create the User model
const User = mongoose.model('User', userSchema);

// Add indexes for better query performance
userSchema.index({ gender: 1, type: 1, visibility: 1 });
userSchema.index({ _id: 1, gender: 1, type: 1 });
userSchema.index({ matches: 1 });
userSchema.index({ likedProfiles: 1 });

module.exports = User;
