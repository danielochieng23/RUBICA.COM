import express from 'express';
import { authMiddleware, optionalAuthMiddleware } from '../middleware/auth';
import Listing from '../models/Listing';

const router = express.Router();

// @route   GET /api/listings
// @desc    Get all listings with filters
// @access  Public
router.get('/', optionalAuthMiddleware, async (req, res) => {
  try {
    const { category, city, page = 1, limit = 20, search } = req.query;
    
    const query: any = { 
      isActive: true, 
      status: 'approved',
      expiresAt: { $gt: new Date() }
    };
    
    if (category) query.category = category;
    if (city) query['location.city'] = new RegExp(city as string, 'i');
    if (search) {
      query.$text = { $search: search as string };
    }

    const listings = await Listing.find(query)
      .populate('category', 'name slug')
      .populate('user', 'name isVerified')
      .sort({ isPremium: -1, createdAt: -1 })
      .limit(Number(limit))
      .skip((Number(page) - 1) * Number(limit));

    const total = await Listing.countDocuments(query);

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
  } catch (error) {
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
router.post('/', authMiddleware, async (req, res) => {
  try {
    const listingData = {
      ...req.body,
      user: req.user?.userId
    };

    const listing = new Listing(listingData);
    await listing.save();

    res.status(201).json({
      success: true,
      message: 'Listing created successfully',
      data: { listing }
    });
  } catch (error) {
    console.error('Create listing error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

export default router;