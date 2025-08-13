import mongoose, { Schema } from 'mongoose';
const listingSchema = new Schema({
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
        default: () => new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
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
listingSchema.index({ category: 1, 'location.city': 1, isActive: 1, status: 1 });
listingSchema.index({ user: 1, createdAt: -1 });
listingSchema.index({ title: 'text', description: 'text', tags: 'text' });
listingSchema.index({ 'location.coordinates': '2dsphere' });
listingSchema.index({ expiresAt: 1 });
listingSchema.pre('save', function (next) {
    if (this.isModified() && !this.isNew) {
        this.lastActiveAt = new Date();
    }
    next();
});
export default mongoose.model('Listing', listingSchema);
//# sourceMappingURL=Listing.js.map