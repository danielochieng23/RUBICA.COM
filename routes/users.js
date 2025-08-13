const express = require('express');
const { query } = require('express-validator');
const User = require('../models/User');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// @desc    Get all users (Admin only)
// @route   GET /api/users
// @access  Private (Admin)
router.get('/', protect, authorize('admin'), [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 50 }).withMessage('Limit must be between 1 and 50'),
  query('role').optional().isIn(['user', 'provider', 'admin']).withMessage('Invalid role'),
  query('isActive').optional().isBoolean().withMessage('isActive must be a boolean')
], async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      search,
      role,
      isActive,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    // Build filter object
    const filters = {};
    if (role) filters.role = role;
    if (isActive !== undefined) filters.isActive = isActive === 'true';

    // Search functionality
    if (search) {
      filters.$or = [
        { username: new RegExp(search, 'i') },
        { firstName: new RegExp(search, 'i') },
        { lastName: new RegExp(search, 'i') },
        { email: new RegExp(search, 'i') }
      ];
    }

    // Pagination
    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const skip = (pageNum - 1) * limitNum;

    // Sort options
    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

    // Execute query
    const users = await User.find(filters)
      .sort(sortOptions)
      .skip(skip)
      .limit(limitNum)
      .select('-password')
      .populate('listings', 'title status createdAt');

    const total = await User.countDocuments(filters);

    res.status(200).json({
      success: true,
      data: users,
      pagination: {
        currentPage: pageNum,
        totalPages: Math.ceil(total / limitNum),
        totalResults: total,
        hasNextPage: pageNum < Math.ceil(total / limitNum),
        hasPrevPage: pageNum > 1
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching users'
    });
  }
});

// @desc    Get single user by ID
// @route   GET /api/users/:id
// @access  Private (Admin) or own profile
router.get('/:id', protect, async (req, res) => {
  try {
    // Check if user is requesting their own profile or is admin
    if (req.user.id !== req.params.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to access this profile'
      });
    }

    const user = await User.findById(req.params.id)
      .select('-password')
      .populate('listings', 'title status createdAt stats')
      .populate('favorites', 'title mainImage pricing.amount location.city');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    console.error(error);
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: 'Invalid user ID'
      });
    }
    res.status(500).json({
      success: false,
      message: 'Server error while fetching user'
    });
  }
});

// @desc    Get user profile by username (Public profile view)
// @route   GET /api/users/profile/:username
// @access  Public
router.get('/profile/:username', async (req, res) => {
  try {
    const user = await User.findOne({ 
      username: req.params.username,
      isActive: true 
    })
    .select('username firstName lastName profileImage bio location ratings socialMedia createdAt')
    .populate({
      path: 'listings',
      match: { status: 'active' },
      select: 'title description mainImage pricing location stats features createdAt',
      populate: {
        path: 'category',
        select: 'name slug color'
      },
      options: { sort: { 'features.featured': -1, createdAt: -1 } }
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User profile not found'
      });
    }

    res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching user profile'
    });
  }
});

// @desc    Update user status (Admin only)
// @route   PUT /api/users/:id/status
// @access  Private (Admin)
router.put('/:id/status', protect, authorize('admin'), async (req, res) => {
  try {
    const { isActive, isVerified } = req.body;

    const updateFields = {};
    if (isActive !== undefined) updateFields.isActive = isActive;
    if (isVerified !== undefined) updateFields.isVerified = isVerified;

    const user = await User.findByIdAndUpdate(
      req.params.id,
      updateFields,
      {
        new: true,
        runValidators: true
      }
    ).select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'User status updated successfully',
      data: user
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating user status'
    });
  }
});

// @desc    Update user role (Admin only)
// @route   PUT /api/users/:id/role
// @access  Private (Admin)
router.put('/:id/role', protect, authorize('admin'), async (req, res) => {
  try {
    const { role } = req.body;

    if (!['user', 'provider', 'admin'].includes(role)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid role. Must be user, provider, or admin'
      });
    }

    // Prevent admin from changing their own role
    if (req.user.id === req.params.id) {
      return res.status(400).json({
        success: false,
        message: 'You cannot change your own role'
      });
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { role },
      {
        new: true,
        runValidators: true
      }
    ).select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'User role updated successfully',
      data: user
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating user role'
    });
  }
});

// @desc    Delete user (Admin only)
// @route   DELETE /api/users/:id
// @access  Private (Admin)
router.delete('/:id', protect, authorize('admin'), async (req, res) => {
  try {
    // Prevent admin from deleting their own account
    if (req.user.id === req.params.id) {
      return res.status(400).json({
        success: false,
        message: 'You cannot delete your own account'
      });
    }

    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Check if user has active listings
    const Listing = require('../models/Listing');
    const activeListingsCount = await Listing.countDocuments({
      user: req.params.id,
      status: 'active'
    });

    if (activeListingsCount > 0) {
      return res.status(400).json({
        success: false,
        message: `Cannot delete user. They have ${activeListingsCount} active listings. Please deactivate the user instead.`
      });
    }

    // Delete all user's listings
    await Listing.deleteMany({ user: req.params.id });

    // Delete user
    await user.deleteOne();

    res.status(200).json({
      success: true,
      message: 'User deleted successfully'
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server error while deleting user'
    });
  }
});

// @desc    Add listing to favorites
// @route   POST /api/users/favorites/:listingId
// @access  Private
router.post('/favorites/:listingId', protect, async (req, res) => {
  try {
    const { listingId } = req.params;

    // Check if listing exists
    const Listing = require('../models/Listing');
    const listing = await Listing.findById(listingId);

    if (!listing) {
      return res.status(404).json({
        success: false,
        message: 'Listing not found'
      });
    }

    // Check if already in favorites
    const user = await User.findById(req.user.id);
    if (user.favorites.includes(listingId)) {
      return res.status(400).json({
        success: false,
        message: 'Listing already in favorites'
      });
    }

    // Add to favorites
    await User.findByIdAndUpdate(req.user.id, {
      $push: { favorites: listingId }
    });

    res.status(200).json({
      success: true,
      message: 'Listing added to favorites'
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server error while adding to favorites'
    });
  }
});

// @desc    Remove listing from favorites
// @route   DELETE /api/users/favorites/:listingId
// @access  Private
router.delete('/favorites/:listingId', protect, async (req, res) => {
  try {
    const { listingId } = req.params;

    await User.findByIdAndUpdate(req.user.id, {
      $pull: { favorites: listingId }
    });

    res.status(200).json({
      success: true,
      message: 'Listing removed from favorites'
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server error while removing from favorites'
    });
  }
});

module.exports = router;