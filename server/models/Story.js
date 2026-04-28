const mongoose = require('mongoose');

const storySchema = new mongoose.Schema({
  imageUrl: {
    type: String,
    required: true
  },
  mediaType: {
    type: String,
    enum: ['image', 'video'],
    default: 'image'
  },
  title: {
    type: String,
    default: ''
  },
  link: {
    type: String,
    default: ''
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Story', storySchema);
