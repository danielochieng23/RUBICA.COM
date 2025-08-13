import mongoose, { Document, Schema } from 'mongoose';

export interface IListing extends Document {
  title: string;
  description: string;
  category: mongoose.Types.ObjectId;
  user: mongoose.Types.ObjectId;
  images: string[];
  price?: {
    amount: number;
    currency: string;
    type: 'hourly' | 'daily' | 'fixed' | 'negotiable';
  };
  location: {
    city: string;
    state: string;
    country: string;
    address?: string;
    coordinates?: {
      lat: number;
      lng: number;
    };
  };
  contact: {
    phone?: string;
    email?: string;
    whatsapp?: string;
    telegram?: string;
  };
  availability: {
    days: string[];
    hours: {
      start: string;
      end: string;
    };
    isAvailable24x7: boolean;
  };
  services: string[];
  ageRange?: {
    min: number;
    max: number;
  };
  bodyType?: string;
  ethnicity?: string;
  languages: string[];
  isVerified: boolean;
  isPremium: boolean;
  isActive: boolean;
  status: 'pending' | 'approved' | 'rejected' | 'expired';
  views: number;
  likes: number;
  reports: number;
  expiresAt: Date;
  lastActiveAt: Date;
  metaTitle?: string;
  metaDescription?: string;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

const listingSchema = new Schema<IListing>({
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200
  },
  description: {
    type: String,
    required: true,
    trim: true,
    maxlength: 2000
  },
  category: {
    type: Schema.Types.ObjectId,
    ref: 'Category',
    required: true
  },
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  images: [{
    type: String,
    required: true
  }],
  price: {
    amount: {
      type: Number,
      min: 0
    },
    currency: {
      type: String,
      default: 'INR'
    },
    type: {
      type: String,
      enum: ['hourly', 'daily', 'fixed', 'negotiable'],
      default: 'hourly'
    }
  },
  location: {
    city: {
      type: String,
      required: true,
      trim: true
    },
    state: {
      type: String,
      required: true,
      trim: true
    },
    country: {
      type: String,
      default: 'India',
      trim: true
    },
    address: {
      type: String,
      trim: true
    },
    coordinates: {
      lat: Number,
      lng: Number
    }
  },
  contact: {
    phone: String,
    email: String,
    whatsapp: String,
    telegram: String
  },
  availability: {
    days: [{
      type: String,
      enum: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']
    }],
    hours: {
      start: String,
      end: String
    },
    isAvailable24x7: {
      type: Boolean,
      default: false
    }
  },
  services: [{
    type: String,
    trim: true
  }],
  ageRange: {
    min: {
      type: Number,
      min: 18,
      max: 100
    },
    max: {
      type: Number,
      min: 18,
      max: 100
    }
  },
  bodyType: {
    type: String,
    trim: true
  },
  ethnicity: {
    type: String,
    trim: true
  },
  languages: [{
    type: String,
    trim: true
  }],
  isVerified: {
    type: Boolean,
    default: false
  },
  isPremium: {
    type: Boolean,
    default: false
  },
  isActive: {
    type: Boolean,
    default: true
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'expired'],
    default: 'pending'
  },
  views: {
    type: Number,
    default: 0
  },
  likes: {
    type: Number,
    default: 0
  },
  reports: {
    type: Number,
    default: 0
  },
  expiresAt: {
    type: Date,
    default: () => new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days from now
  },
  lastActiveAt: {
    type: Date,
    default: Date.now
  },
  metaTitle: String,
  metaDescription: String,
  tags: [{
    type: String,
    trim: true,
    lowercase: true
  }]
}, {
  timestamps: true
});

// Indexes for better search performance
listingSchema.index({ category: 1, 'location.city': 1, isActive: 1, status: 1 });
listingSchema.index({ user: 1, createdAt: -1 });
listingSchema.index({ title: 'text', description: 'text', tags: 'text' });
listingSchema.index({ 'location.coordinates': '2dsphere' });
listingSchema.index({ expiresAt: 1 });

// Update lastActiveAt when listing is modified
listingSchema.pre('save', function(next) {
  if (this.isModified() && !this.isNew) {
    this.lastActiveAt = new Date();
  }
  next();
});

export default mongoose.model<IListing>('Listing', listingSchema);