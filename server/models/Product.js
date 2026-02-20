const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  originalPrice: {
    type: Number,
    default: null,
    min: 0
  },
  brand: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Brand',
    required: true
  },
  category: {
    type: String,
    required: true,
    trim: true
  },
  isFeatured: {
    type: Boolean,
    default: false
  },
  featuredAt: {
    type: Date,
    default: null
  },
  colors: [
    {
      colorName: {
        type: String,
        required: true
      },
      hexCode: {
        type: String,
        required: true
      },
      images: [{
        type: String
      }],
      hoverVideo: {
        type: String,
        default: ''
      },
      sizes: [
        {
          size: {
            type: Number,
            required: true,
            min: 36,
            max: 44
          },
          stock: {
            type: Number,
            required: true,
            min: 0,
            default: 0
          }
        }
      ]
    }
  ],
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Product', productSchema);

