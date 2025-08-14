const mongoose = require('mongoose');

const listingSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true,
        maxlength: 100
    },
    description: {
        type: String,
        required: true,
        maxlength: 2000
    },
    category: {
        type: String,
        required: true,
        enum: ['call-girls', 'massages', 'male-escorts', 'transsexual', 'adult-meetings', 'other']
    },
    subcategory: {
        type: String
    },
    author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    location: {
        city: {
            type: String,
            required: true
        },
        area: String,
        state: String,
        country: {
            type: String,
            default: 'India'
        },
        coordinates: {
            lat: Number,
            lng: Number
        }
    },
    contact: {
        phone: {
            type: String,
            required: true
        },
        whatsapp: String,
        email: String,
        hidePhone: {
            type: Boolean,
            default: false
        }
    },
    pricing: {
        amount: Number,
        currency: {
            type: String,
            default: 'INR'
        },
        duration: String,
        negotiable: {
            type: Boolean,
            default: false
        }
    },
    images: [{
        url: String,
        isPrimary: {
            type: Boolean,
            default: false
        },
        uploadedAt: {
            type: Date,
            default: Date.now
        }
    }],
    age: {
        type: Number,
        min: 18,
        max: 99
    },
    services: [String],
    availability: {
        days: [String],
        hours: {
            from: String,
            to: String
        },
        incall: {
            type: Boolean,
            default: true
        },
        outcall: {
            type: Boolean,
            default: true
        }
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
        }
    },
    features: {
        isPremium: {
            type: Boolean,
            default: false
        },
        isFeatured: {
            type: Boolean,
            default: false
        },
        isVerified: {
            type: Boolean,
            default: false
        }
    },
    status: {
        type: String,
        enum: ['active', 'inactive', 'pending', 'rejected', 'expired'],
        default: 'pending'
    },
    expiresAt: {
        type: Date,
        default: function() {
            return new Date(+new Date() + 30*24*60*60*1000); // 30 days from now
        }
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

// Update timestamp on save
listingSchema.pre('save', function(next) {
    this.updatedAt = new Date();
    next();
});

// Virtual for formatted price
listingSchema.virtual('formattedPrice').get(function() {
    if (!this.pricing.amount) return 'Contact for price';
    return `₹${this.pricing.amount.toLocaleString('en-IN')}${this.pricing.duration ? '/' + this.pricing.duration : ''}`;
});

// Method to increment views
listingSchema.methods.incrementViews = function() {
    this.stats.views += 1;
    return this.save();
};

// Method to check if listing is expired
listingSchema.methods.isExpired = function() {
    return this.expiresAt < new Date();
};

// Index for search
listingSchema.index({ title: 'text', description: 'text' });
listingSchema.index({ 'location.city': 1, category: 1, status: 1 });
listingSchema.index({ createdAt: -1 });
listingSchema.index({ 'features.isPremium': 1, 'features.isFeatured': 1 });

module.exports = mongoose.model('Listing', listingSchema);