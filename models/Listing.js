const mongoose = require('mongoose');

const listingSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true,
    maxlength: [200, 'Title cannot exceed 200 characters']
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
    maxlength: [2000, 'Description cannot exceed 2000 characters']
  },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    required: [true, 'Category is required']
  },
  subcategory: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    default: null
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User is required']
  },
  images: [{
    url: {
      type: String,
      required: true
    },
    caption: String,
    isMain: {
      type: Boolean,
      default: false
    }
  }],
  pricing: {
    type: {
      type: String,
      enum: ['fixed', 'hourly', 'negotiable', 'free'],
      default: 'negotiable'
    },
    amount: {
      type: Number,
      min: 0
    },
    currency: {
      type: String,
      default: 'INR'
    },
    duration: String // e.g., "per hour", "per session"
  },
  location: {
    city: {
      type: String,
      required: [true, 'City is required']
    },
    state: {
      type: String,
      required: [true, 'State is required']
    },
    area: String,
    pincode: String,
    address: String,
    coordinates: {
      lat: Number,
      lng: Number
    }
  },
  contact: {
    phone: {
      type: String,
      required: [true, 'Phone number is required']
    },
    whatsapp: String,
    email: String,
    preferredContact: {
      type: String,
      enum: ['phone', 'whatsapp', 'email'],
      default: 'phone'
    },
    availability: {
      hours: String,
      days: [String]
    }
  },
  features: {
    verified: {
      type: Boolean,
      default: false
    },
    premium: {
      type: Boolean,
      default: false
    },
    featured: {
      type: Boolean,
      default: false
    },
    urgent: {
      type: Boolean,
      default: false
    }
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'pending', 'rejected', 'expired'],
    default: 'pending'
  },
  moderationNotes: {
    type: String,
    maxlength: [500, 'Moderation notes cannot exceed 500 characters']
  },
  stats: {
    views: {
      type: Number,
      default: 0
    },
    contacts: {
      type: Number,
      default: 0
    },
    favorites: {
      type: Number,
      default: 0
    },
    shares: {
      type: Number,
      default: 0
    }
  },
  ratings: {
    average: {
      type: Number,
      default: 0,
      min: 0,
      max: 5
    },
    count: {
      type: Number,
      default: 0
    }
  },
  tags: [String],
  services: [String],
  ageRange: {
    min: {
      type: Number,
      default: 18
    },
    max: {
      type: Number,
      default: 65
    }
  },
  workingHours: {
    monday: { start: String, end: String, available: Boolean },
    tuesday: { start: String, end: String, available: Boolean },
    wednesday: { start: String, end: String, available: Boolean },
    thursday: { start: String, end: String, available: Boolean },
    friday: { start: String, end: String, available: Boolean },
    saturday: { start: String, end: String, available: Boolean },
    sunday: { start: String, end: String, available: Boolean }
  },
  expiresAt: {
    type: Date,
    default: function() {
      return new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days from now
    }
  },
  lastActiveAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for main image
listingSchema.virtual('mainImage').get(function() {
  const mainImg = this.images.find(img => img.isMain);
  return mainImg ? mainImg.url : (this.images.length > 0 ? this.images[0].url : null);
});

// Virtual for formatted price
listingSchema.virtual('formattedPrice').get(function() {
  if (this.pricing.type === 'free') return 'Free';
  if (this.pricing.type === 'negotiable') return 'Negotiable';
  if (this.pricing.amount) {
    return `₹${this.pricing.amount.toLocaleString()}${this.pricing.duration ? ' ' + this.pricing.duration : ''}`;
  }
  return 'Contact for price';
});

// Indexes for search and filtering
listingSchema.index({ 
  title: 'text', 
  description: 'text',
  tags: 'text',
  services: 'text'
});

listingSchema.index({ category: 1, status: 1 });
listingSchema.index({ 'location.city': 1, status: 1 });
listingSchema.index({ user: 1, status: 1 });
listingSchema.index({ status: 1, createdAt: -1 });
listingSchema.index({ 'features.featured': 1, status: 1, createdAt: -1 });
listingSchema.index({ expiresAt: 1 });

// Method to increment view count
listingSchema.methods.incrementViews = function() {
  this.stats.views += 1;
  this.lastActiveAt = new Date();
  return this.save({ validateBeforeSave: false });
};

// Method to increment contact count
listingSchema.methods.incrementContacts = function() {
  this.stats.contacts += 1;
  return this.save({ validateBeforeSave: false });
};

// Method to check if listing is expired
listingSchema.methods.isExpired = function() {
  return this.expiresAt < new Date();
};

// Static method to get active listings
listingSchema.statics.getActive = function() {
  return this.find({ 
    status: 'active',
    expiresAt: { $gt: new Date() }
  });
};

// Static method for search
listingSchema.statics.search = function(query, filters = {}) {
  const searchQuery = {
    status: 'active',
    expiresAt: { $gt: new Date() },
    ...filters
  };

  if (query) {
    searchQuery.$text = { $search: query };
  }

  return this.find(searchQuery)
    .populate('category', 'name slug color')
    .populate('user', 'username firstName lastName profileImage ratings')
    .sort(query ? { score: { $meta: 'textScore' } } : { 'features.featured': -1, createdAt: -1 });
};

// Pre-save middleware to update lastActiveAt
listingSchema.pre('save', function(next) {
  if (this.isModified('status') && this.status === 'active') {
    this.lastActiveAt = new Date();
  }
  next();
});

module.exports = mongoose.model('Listing', listingSchema);