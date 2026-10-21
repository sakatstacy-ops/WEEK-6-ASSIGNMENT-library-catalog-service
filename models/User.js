const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    minlength: 3,
    maxlength: 40,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
  },
  passwordHash: {
    type: String,
    required: true,
    select: false,
  },
  role: {
    type: String,
    enum: ['patron', 'librarian'],
    default: 'patron',
    required: true,
  },
  readingList: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Book',
  }],
}, {
  timestamps: true,
});

module.exports = mongoose.model('User', userSchema);
