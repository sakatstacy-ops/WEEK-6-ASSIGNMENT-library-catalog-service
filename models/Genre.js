const mongoose = require('mongoose');

const genreSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    unique: true,
  },
  slug: {
    type: String,
    required: true,
    trim: true,
    lowercase: true,
    unique: true,
    match: /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
  },
}, {
  timestamps: true,
});

module.exports = mongoose.model('Genre', genreSchema);