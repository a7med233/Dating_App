const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true
  },
  birthDate: {
    type: Date,
    required: true
  },
  location: {
    latitude: Number,
    longitude: Number,
    address: String
  },
  gender: {
    type: String,
    required: true,
    enum: ['Male', 'Female', 'Non-binary', 'Other']
  },
  type: {
    type: String,
    required: true
  },
  datingType: {
    type: String,
    required: true
  },
  lookingFor: {
    type: String,
    required: true
  },
  hometown: {
    type: String,
    required: true
  },
  photos: [{
    type: String // URLs to photos
  }],
  prompts: [{
    question: String,
    answer: String
  }],
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update the updatedAt field before saving
userSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('User', userSchema); 