"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importStar(require("mongoose"));
const listingSchema = new mongoose_1.Schema({
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
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'Category',
        required: true
    },
    user: {
        type: mongoose_1.Schema.Types.ObjectId,
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
listingSchema.pre('save', function (next) {
    if (this.isModified() && !this.isNew) {
        this.lastActiveAt = new Date();
    }
    next();
});
exports.default = mongoose_1.default.model('Listing', listingSchema);
//# sourceMappingURL=Listing.js.map