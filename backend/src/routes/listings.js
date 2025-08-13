"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_1 = require("../middleware/auth");
const Listing_1 = __importDefault(require("../models/Listing"));
const router = express_1.default.Router();
// @route   GET /api/listings
// @desc    Get all listings with filters
// @access  Public
router.get('/', auth_1.optionalAuthMiddleware, async (req, res) => {
    try {
        const { category, city, page = 1, limit = 20, search } = req.query;
        const query = {
            isActive: true,
            status: 'approved',
            expiresAt: { $gt: new Date() }
        };
        if (category)
            query.category = category;
        if (city)
            query['location.city'] = new RegExp(city, 'i');
        if (search) {
            query.$text = { $search: search };
        }
        const listings = await Listing_1.default.find(query)
            .populate('category', 'name slug')
            .populate('user', 'name isVerified')
            .sort({ isPremium: -1, createdAt: -1 })
            .limit(Number(limit))
            .skip((Number(page) - 1) * Number(limit));
        const total = await Listing_1.default.countDocuments(query);
        res.json({
            success: true,
            data: {
                listings,
                pagination: {
                    page: Number(page),
                    limit: Number(limit),
                    total,
                    pages: Math.ceil(total / Number(limit))
                }
            }
        });
    }
    catch (error) {
        console.error('Get listings error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
});
// @route   POST /api/listings
// @desc    Create a new listing
// @access  Private
router.post('/', auth_1.authMiddleware, async (req, res) => {
    try {
        const listingData = {
            ...req.body,
            user: req.user?.userId
        };
        const listing = new Listing_1.default(listingData);
        await listing.save();
        res.status(201).json({
            success: true,
            message: 'Listing created successfully',
            data: { listing }
        });
    }
    catch (error) {
        console.error('Create listing error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
});
exports.default = router;
//# sourceMappingURL=listings.js.map