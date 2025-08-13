const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Category name is required'],
    unique: true,
    trim: true,
    maxlength: [100, 'Category name cannot exceed 100 characters']
  },
  slug: {
    type: String,
    required: true,
    unique: true,
    lowercase: true
  },
  description: {
    type: String,
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  icon: {
    type: String,
    default: 'fas fa-star'
  },
  image: {
    type: String,
    default: null
  },
  color: {
    type: String,
    default: '#6366f1'
  },
  parentCategory: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    default: null
  },
  subcategories: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category'
  }],
  isActive: {
    type: Boolean,
    default: true
  },
  sortOrder: {
    type: Number,
    default: 0
  },
  meta: {
    keywords: [String],
    metaTitle: String,
    metaDescription: String
  },
  restrictions: {
    minAge: {
      type: Number,
      default: 18
    },
    requiresVerification: {
      type: Boolean,
      default: false
    }
  },
  stats: {
    listingCount: {
      type: Number,
      default: 0
    },
    viewCount: {
      type: Number,
      default: 0
    }
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for full category path
categorySchema.virtual('fullPath').get(function() {
  if (this.parentCategory && this.parentCategory.name) {
    return `${this.parentCategory.name} > ${this.name}`;
  }
  return this.name;
});

// Index for text search
categorySchema.index({ 
  name: 'text', 
  description: 'text',
  'meta.keywords': 'text'
});

// Index for slug
categorySchema.index({ slug: 1 });

// Pre-save middleware to generate slug
categorySchema.pre('save', function(next) {
  if (this.isModified('name')) {
    this.slug = this.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  }
  next();
});

// Static method to get categories with stats
categorySchema.statics.getWithStats = function() {
  return this.aggregate([
    {
      $lookup: {
        from: 'listings',
        localField: '_id',
        foreignField: 'category',
        as: 'listings'
      }
    },
    {
      $addFields: {
        'stats.listingCount': { $size: '$listings' }
      }
    },
    {
      $project: {
        listings: 0
      }
    },
    {
      $sort: { sortOrder: 1, name: 1 }
    }
  ]);
};

// Method to increment view count
categorySchema.methods.incrementViewCount = function() {
  this.stats.viewCount += 1;
  return this.save({ validateBeforeSave: false });
};

module.exports = mongoose.model('Category', categorySchema);