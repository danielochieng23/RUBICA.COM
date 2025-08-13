const express = require('express');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const Listing = require('../models/Listing');
const Category = require('../models/Category');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// All routes require admin authentication
router.use(protect);
router.use(authorize('admin'));

// @desc    Get admin dashboard statistics
// @route   GET /api/admin/stats
// @access  Private (Admin)
router.get('/stats', async (req, res) => {
  try {
    const [
      totalUsers,
      totalListings,
      totalCategories,
      activeListings,
      pendingListings,
      verifiedUsers,
      todayRegistrations,
      todayListings
    ] = await Promise.all([
      User.countDocuments(),
      Listing.countDocuments(),
      Category.countDocuments(),
      Listing.countDocuments({ status: 'active' }),
      Listing.countDocuments({ status: 'pending' }),
      User.countDocuments({ isVerified: true }),
      User.countDocuments({
        createdAt: {
          $gte: new Date(new Date().setHours(0, 0, 0, 0))
        }
      }),
      Listing.countDocuments({
        createdAt: {
          $gte: new Date(new Date().setHours(0, 0, 0, 0))
        }
      })
    ]);

    // Get recent activities
    const recentUsers = await User.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .select('username firstName lastName createdAt');

    const recentListings = await Listing.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .populate('user', 'username firstName lastName')
      .populate('category', 'name')
      .select('title status createdAt');

    // Category-wise listing counts
    const categoryStats = await Category.aggregate([
      {
        $lookup: {
          from: 'listings',
          localField: '_id',
          foreignField: 'category',
          as: 'listings'
        }
      },
      {
        $project: {
          name: 1,
          listingCount: { $size: '$listings' },
          activeListings: {
            $size: {
              $filter: {
                input: '$listings',
                cond: { $eq: ['$$this.status', 'active'] }
              }
            }
          }
        }
      },
      { $sort: { listingCount: -1 } }
    ]);

    res.status(200).json({
      success: true,
      data: {
        summary: {
          totalUsers,
          totalListings,
          totalCategories,
          activeListings,
          pendingListings,
          verifiedUsers,
          todayRegistrations,
          todayListings
        },
        recentActivities: {
          users: recentUsers,
          listings: recentListings
        },
        categoryStats
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching admin statistics'
    });
  }
});

// @desc    Get pending listings for moderation
// @route   GET /api/admin/listings/pending
// @access  Private (Admin)
router.get('/listings/pending', async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;

    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const skip = (pageNum - 1) * limitNum;

    const listings = await Listing.find({ status: 'pending' })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum)
      .populate('user', 'username firstName lastName email')
      .populate('category', 'name');

    const total = await Listing.countDocuments({ status: 'pending' });

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
      message: 'Server error while fetching pending listings'
    });
  }
});

// @desc    Moderate listing (approve/reject)
// @route   PUT /api/admin/listings/:id/moderate
// @access  Private (Admin)
router.put('/listings/:id/moderate', [
  body('action')
    .isIn(['approve', 'reject'])
    .withMessage('Action must be either approve or reject'),
  body('moderationNotes')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Moderation notes cannot exceed 500 characters')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { action, moderationNotes } = req.body;
    const listing = await Listing.findById(req.params.id);

    if (!listing) {
      return res.status(404).json({
        success: false,
        message: 'Listing not found'
      });
    }

    if (listing.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: 'Listing is not pending moderation'
      });
    }

    const updateData = {
      status: action === 'approve' ? 'active' : 'rejected',
      moderationNotes: moderationNotes || ''
    };

    const updatedListing = await Listing.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    ).populate('user', 'username firstName lastName email');

    res.status(200).json({
      success: true,
      message: `Listing ${action}d successfully`,
      data: updatedListing
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server error while moderating listing'
    });
  }
});

// @desc    Get all listings with admin filters
// @route   GET /api/admin/listings
// @access  Private (Admin)
router.get('/listings', async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      status,
      category,
      search,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    const filters = {};
    if (status) filters.status = status;
    if (category) filters.category = category;
    if (search) {
      filters.$or = [
        { title: new RegExp(search, 'i') },
        { description: new RegExp(search, 'i') }
      ];
    }

    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const skip = (pageNum - 1) * limitNum;

    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const listings = await Listing.find(filters)
      .sort(sortOptions)
      .skip(skip)
      .limit(limitNum)
      .populate('user', 'username firstName lastName email')
      .populate('category', 'name slug');

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
      message: 'Server error while fetching listings'
    });
  }
});

// @desc    Feature/unfeature listing
// @route   PUT /api/admin/listings/:id/feature
// @access  Private (Admin)
router.put('/listings/:id/feature', async (req, res) => {
  try {
    const { featured } = req.body;
    
    const listing = await Listing.findByIdAndUpdate(
      req.params.id,
      { 'features.featured': featured },
      { new: true }
    );

    if (!listing) {
      return res.status(404).json({
        success: false,
        message: 'Listing not found'
      });
    }

    res.status(200).json({
      success: true,
      message: `Listing ${featured ? 'featured' : 'unfeatured'} successfully`,
      data: listing
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating listing feature status'
    });
  }
});

// @desc    Verify/unverify listing
// @route   PUT /api/admin/listings/:id/verify
// @access  Private (Admin)
router.put('/listings/:id/verify', async (req, res) => {
  try {
    const { verified } = req.body;
    
    const listing = await Listing.findByIdAndUpdate(
      req.params.id,
      { 'features.verified': verified },
      { new: true }
    );

    if (!listing) {
      return res.status(404).json({
        success: false,
        message: 'Listing not found'
      });
    }

    res.status(200).json({
      success: true,
      message: `Listing ${verified ? 'verified' : 'unverified'} successfully`,
      data: listing
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating listing verification status'
    });
  }
});

// @desc    Bulk actions on listings
// @route   POST /api/admin/listings/bulk-action
// @access  Private (Admin)
router.post('/listings/bulk-action', [
  body('action')
    .isIn(['approve', 'reject', 'delete', 'feature', 'unfeature'])
    .withMessage('Invalid action'),
  body('listingIds')
    .isArray({ min: 1 })
    .withMessage('At least one listing ID is required'),
  body('listingIds.*')
    .isMongoId()
    .withMessage('Invalid listing ID format')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { action, listingIds, moderationNotes } = req.body;

    let updateQuery = {};
    let message = '';

    switch (action) {
      case 'approve':
        updateQuery = { status: 'active', moderationNotes: moderationNotes || '' };
        message = 'Listings approved successfully';
        break;
      case 'reject':
        updateQuery = { status: 'rejected', moderationNotes: moderationNotes || '' };
        message = 'Listings rejected successfully';
        break;
      case 'feature':
        updateQuery = { 'features.featured': true };
        message = 'Listings featured successfully';
        break;
      case 'unfeature':
        updateQuery = { 'features.featured': false };
        message = 'Listings unfeatured successfully';
        break;
      case 'delete':
        await Listing.deleteMany({ _id: { $in: listingIds } });
        message = 'Listings deleted successfully';
        break;
    }

    if (action !== 'delete') {
      await Listing.updateMany(
        { _id: { $in: listingIds } },
        updateQuery
      );
    }

    res.status(200).json({
      success: true,
      message,
      affectedCount: listingIds.length
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server error while performing bulk action'
    });
  }
});

// @desc    Create initial admin user (for setup)
// @route   POST /api/admin/setup
// @access  Public (only if no admin exists)
router.post('/setup', async (req, res) => {
  try {
    // Check if admin already exists
    const existingAdmin = await User.findOne({ role: 'admin' });
    
    if (existingAdmin) {
      return res.status(400).json({
        success: false,
        message: 'Admin user already exists'
      });
    }

    const adminData = {
      username: 'admin',
      email: process.env.ADMIN_EMAIL || 'admin@rubica.com',
      password: process.env.ADMIN_PASSWORD || 'admin123',
      firstName: 'Admin',
      lastName: 'User',
      phone: '+1234567890',
      location: {
        city: 'Delhi',
        state: 'Delhi',
        country: 'India'
      },
      role: 'admin',
      isVerified: true,
      isActive: true
    };

    const admin = await User.create(adminData);

    res.status(201).json({
      success: true,
      message: 'Admin user created successfully',
      data: {
        id: admin._id,
        username: admin.username,
        email: admin.email
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server error while creating admin user'
    });
  }
});

module.exports = router;