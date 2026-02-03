const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    sparse: true,
    lowercase: true,
    trim: true
  },
  phoneNumber: {
    type: String,
    sparse: true,
    trim: true
  },
  passwordHash: {
    type: String
  },
  authProvider: {
    type: String,
    enum: ['email', 'phone'],
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  lastLogin: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

userSchema.index({ email: 1 }, { sparse: true, unique: true });
userSchema.index({ phoneNumber: 1 }, { sparse: true, unique: true });

module.exports = mongoose.model('User', userSchema);
