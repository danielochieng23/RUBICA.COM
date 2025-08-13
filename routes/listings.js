const express = require('express');
const { body, validationResult, query } = require('express-validator');
const Listing = require('../models/Listing');
const Category = require('../models/Category');
const User = require('../models/User');
const { protect, optionalAuth } = require('../middleware/auth');

const router = express.Router();

// @desc    Get all listings with filtering
// @route   GET /api/listings
// @access  Public
router.get('/', optionalAuth, [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 50 }).withMessage('Limit must be between 1 and 50'),
  query('category').optional().isMongoId().withMessage('Invalid category ID'),
  query('city').optional().isString().withMessage('City must be a string'),
  query('minPrice').optional().isFloat({ min: 0 }).withMessage('Min price must be a positive number'),
  query('maxPrice').optional().isFloat({ min: 0 }).withMessage('Max price must be a positive number')
], async (req, res) => {
  try {
    // Check validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const {
      page = 1,
      limit = 12,
      category,
      city,
      search,
      minPrice,
      maxPrice,
      featured,
      verified,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    // Build filter object
    const filters = {
      status: 'active',
      expiresAt: { $gt: new Date() }
    };

    if (category) filters.category = category;
    if (city) filters['location.city'] = new RegExp(city, 'i');
    if (featured === 'true') filters['features.featured'] = true;
    if (verified === 'true') filters['features.verified'] = true;

    // Price filtering
    if (minPrice || maxPrice) {
      filters['pricing.amount'] = {};
      if (minPrice) filters['pricing.amount'].$gte = parseFloat(minPrice);
      if (maxPrice) filters['pricing.amount'].$lte = parseFloat(maxPrice);
    }

    // Pagination
    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const skip = (pageNum - 1) * limitNum;

    // Sort options
    const sortOptions = {};
    if (sortBy === 'price') {
      sortOptions['pricing.amount'] = sortOrder === 'desc' ? -1 : 1;
    } else if (sortBy === 'views') {
      sortOptions['stats.views'] = sortOrder === 'desc' ? -1 : 1;
    } else {
      sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;
    }

    let query;

    if (search) {
      // Text search
      query = Listing.find({
        $and: [
          { $text: { $search: search } },
          filters
        ]
      }, { score: { $meta: 'textScore' } });
      
      // Sort by text score first, then by other criteria
      query = query.sort({ score: { $meta: 'textScore' }, ...sortOptions });
    } else {
      query = Listing.find(filters).sort(sortOptions);
    }

    // Execute query with pagination
    const listings = await query
      .skip(skip)
      .limit(limitNum)
      .populate('category', 'name slug color')
      .populate('user', 'username firstName lastName profileImage ratings location.city')
      .select('-moderationNotes');

    // Get total count for pagination
    const total = await Listing.countDocuments(search ? 
      { $and: [{ $text: { $search: search } }, filters] } : 
      filters
    );

    // Calculate pagination info
    const totalPages = Math.ceil(total / limitNum);
    const hasNextPage = pageNum < totalPages;
    const hasPrevPage = pageNum > 1;

    res.status(200).json({
      success: true,
      data: listings,
      pagination: {
        currentPage: pageNum,
        totalPages,
        totalResults: total,
        hasNextPage,
        hasPrevPage,
        limit: limitNum
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching listings'
    });
  }
});

// @desc    Get single listing
// @route   GET /api/listings/:id
// @access  Public
router.get('/:id', optionalAuth, async (req, res) => {
  try {
    const listing = await Listing.findById(req.params.id)
      .populate('category', 'name slug color description')
      .populate('user', 'username firstName lastName profileImage bio ratings location.city socialMedia');

    if (!listing) {
      return res.status(404).json({
        success: false,
        message: 'Listing not found'
      });
    }

    // Check if listing is active and not expired
    if (listing.status !== 'active' || listing.isExpired()) {
      return res.status(410).json({
        success: false,
        message: 'This listing is no longer available'
      });
    }

    // Increment view count (async, don't wait)
    listing.incrementViews().catch(err => console.error('Error incrementing views:', err));

    res.status(200).json({
      success: true,
      data: listing
    });
  } catch (error) {
    console.error(error);
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: 'Invalid listing ID'
      });
    }
    res.status(500).json({
      success: false,
      message: 'Server error while fetching listing'
    });
  }
});

// @desc    Create new listing
// @route   POST /api/listings
// @access  Private
router.post('/', protect, [
  body('title')
    .isLength({ min: 10, max: 200 })
    .withMessage('Title must be between 10 and 200 characters'),
  body('description')
    .isLength({ min: 50, max: 2000 })
    .withMessage('Description must be between 50 and 2000 characters'),
  body('category')
    .isMongoId()
    .withMessage('Valid category is required'),
  body('location.city')
    .notEmpty()
    .withMessage('City is required'),
  body('location.state')
    .notEmpty()
    .withMessage('State is required'),
  body('contact.phone')
    .isMobilePhone()
    .withMessage('Valid phone number is required'),
  body('images')
    .isArray({ min: 1 })
    .withMessage('At least one image is required')
], async (req, res) => {
  try {
    // Check validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    // Verify category exists
    const category = await Category.findById(req.body.category);
    if (!category) {
      return res.status(400).json({
        success: false,
        message: 'Invalid category'
      });
    }

    // Create listing
    const listingData = {
      ...req.body,
      user: req.user.id
    };

    const listing = await Listing.create(listingData);

    // Populate the created listing
    await listing.populate('category', 'name slug color');
    await listing.populate('user', 'username firstName lastName');

    // Add listing to user's listings array
    await User.findByIdAndUpdate(req.user.id, {
      $push: { listings: listing._id }
    });

    res.status(201).json({
      success: true,
      message: 'Listing created successfully',
      data: listing
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server error while creating listing'
    });
  }
});

// @desc    Update listing
// @route   PUT /api/listings/:id
// @access  Private
router.put('/:id', protect, [
  body('title')
    .optional()
    .isLength({ min: 10, max: 200 })
    .withMessage('Title must be between 10 and 200 characters'),
  body('description')
    .optional()
    .isLength({ min: 50, max: 2000 })
    .withMessage('Description must be between 50 and 2000 characters'),
  body('category')
    .optional()
    .isMongoId()
    .withMessage('Valid category is required')
], async (req, res) => {
  try {
    // Check validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    let listing = await Listing.findById(req.params.id);

    if (!listing) {
      return res.status(404).json({
        success: false,
        message: 'Listing not found'
      });
    }

    // Check ownership
    if (listing.user.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this listing'
      });
    }

    // If category is being updated, verify it exists
    if (req.body.category) {
      const category = await Category.findById(req.body.category);
      if (!category) {
        return res.status(400).json({
          success: false,
          message: 'Invalid category'
        });
      }
    }

    // Update listing
    listing = await Listing.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true
      }
    ).populate('category', 'name slug color')
     .populate('user', 'username firstName lastName');

    res.status(200).json({
      success: true,
      message: 'Listing updated successfully',
      data: listing
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating listing'
    });
  }
});

// @desc    Delete listing
// @route   DELETE /api/listings/:id
// @access  Private
router.delete('/:id', protect, async (req, res) => {
  try {
    const listing = await Listing.findById(req.params.id);

    if (!listing) {
      return res.status(404).json({
        success: false,
        message: 'Listing not found'
      });
    }

    // Check ownership
    if (listing.user.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this listing'
      });
    }

    await listing.deleteOne();

    // Remove listing from user's listings array
    await User.findByIdAndUpdate(listing.user, {
      $pull: { listings: listing._id }
    });

    res.status(200).json({
      success: true,
      message: 'Listing deleted successfully'
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server error while deleting listing'
    });
  }
});

// @desc    Contact listing owner
// @route   POST /api/listings/:id/contact
// @access  Private
router.post('/:id/contact', protect, async (req, res) => {
  try {
    const listing = await Listing.findById(req.params.id);

    if (!listing) {
      return res.status(404).json({
        success: false,
        message: 'Listing not found'
      });
    }

    if (listing.status !== 'active' || listing.isExpired()) {
      return res.status(410).json({
        success: false,
        message: 'This listing is no longer available'
      });
    }

    // Increment contact count (async, don't wait)
    listing.incrementContacts().catch(err => console.error('Error incrementing contacts:', err));

    // Return contact information
    res.status(200).json({
      success: true,
      message: 'Contact information retrieved',
      data: {
        phone: listing.contact.phone,
        whatsapp: listing.contact.whatsapp,
        email: listing.contact.email,
        preferredContact: listing.contact.preferredContact
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server error while retrieving contact information'
    });
  }
});

// @desc    Get user's own listings
// @route   GET /api/listings/user/me
// @access  Private
router.get('/user/me', protect, async (req, res) => {
  try {
    const { page = 1, limit = 10, status } = req.query;

    const filters = { user: req.user.id };
    if (status) filters.status = status;

    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const skip = (pageNum - 1) * limitNum;

    const listings = await Listing.find(filters)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum)
      .populate('category', 'name slug color');

    const total = await Listing.countDocuments(filters);

    res.status(200).json({
      success: true,
      data: listings,
      pagination: {
        currentPage: pageNum,
        totalPages: Math.ceil(total / limitNum),
        totalResults: total
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching user listings'
    });
  }
});

module.exports = router;