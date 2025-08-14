const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Listing = require('../models/Listing');
const { isAuthenticated } = require('../middleware/auth');

// User dashboard
router.get('/dashboard', isAuthenticated, async (req, res) => {
    try {
        const user = await User.findById(req.session.user.id);
        
        // Get user's listings stats
        const listingsCount = await Listing.countDocuments({ author: user._id });
        const activeListings = await Listing.countDocuments({ 
            author: user._id, 
            status: 'active' 
        });
        
        // Get recent listings
        const recentListings = await Listing.find({ author: user._id })
            .limit(5)
            .sort('-createdAt');

        res.render('pages/dashboard', {
            title: 'Dashboard - RUBICA',
            user,
            stats: {
                totalListings: listingsCount,
                activeListings,
                views: recentListings.reduce((sum, l) => sum + l.stats.views, 0)
            },
            recentListings
        });
    } catch (error) {
        console.error('Dashboard error:', error);
        res.status(500).render('pages/error', {
            title: 'Error',
            message: 'Error loading dashboard'
        });
    }
});

// User profile
router.get('/profile', isAuthenticated, async (req, res) => {
    try {
        const user = await User.findById(req.session.user.id);
        
        res.render('pages/profile', {
            title: 'My Profile - RUBICA',
            user,
            success: req.query.success,
            error: req.query.error
        });
    } catch (error) {
        console.error('Profile error:', error);
        res.status(500).render('pages/error', {
            title: 'Error',
            message: 'Error loading profile'
        });
    }
});

// Update profile
router.post('/profile', isAuthenticated, async (req, res) => {
    try {
        const user = await User.findById(req.session.user.id);
        
        const { username, email, phone, city, state } = req.body;
        
        // Check if username/email already taken by another user
        const existingUser = await User.findOne({
            _id: { $ne: user._id },
            $or: [{ email }, { username }]
        });
        
        if (existingUser) {
            return res.redirect('/user/profile?error=Username or email already taken');
        }
        
        // Update user
        user.username = username;
        user.email = email;
        user.phone = phone;
        user.location.city = city;
        user.location.state = state;
        
        await user.save();
        
        // Update session
        req.session.user.username = username;
        req.session.user.email = email;
        
        res.redirect('/user/profile?success=Profile updated successfully');
    } catch (error) {
        console.error('Update profile error:', error);
        res.redirect('/user/profile?error=Failed to update profile');
    }
});

// Change password
router.get('/change-password', isAuthenticated, (req, res) => {
    res.render('pages/change-password', {
        title: 'Change Password - RUBICA',
        message: req.query.message,
        error: req.query.error
    });
});

// Change password handler
router.post('/change-password', isAuthenticated, async (req, res) => {
    try {
        const { currentPassword, newPassword, confirmPassword } = req.body;
        
        if (newPassword !== confirmPassword) {
            return res.redirect('/user/change-password?error=New passwords do not match');
        }
        
        const user = await User.findById(req.session.user.id);
        
        // Verify current password
        const isValid = await user.comparePassword(currentPassword);
        if (!isValid) {
            return res.redirect('/user/change-password?error=Current password is incorrect');
        }
        
        // Update password
        user.password = newPassword;
        await user.save();
        
        res.redirect('/user/change-password?message=Password changed successfully');
    } catch (error) {
        console.error('Change password error:', error);
        res.redirect('/user/change-password?error=Failed to change password');
    }
});

// My listings
router.get('/my-listings', isAuthenticated, async (req, res) => {
    try {
        const { status = 'all', page = 1 } = req.query;
        const perPage = 20;
        const skip = (page - 1) * perPage;
        
        let query = { author: req.session.user.id };
        if (status !== 'all') {
            query.status = status;
        }
        
        const listings = await Listing.find(query)
            .skip(skip)
            .limit(perPage)
            .sort('-createdAt');
            
        const totalListings = await Listing.countDocuments(query);
        const totalPages = Math.ceil(totalListings / perPage);
        
        res.render('pages/my-listings', {
            title: 'My Listings - RUBICA',
            listings,
            selectedStatus: status,
            currentPage: parseInt(page),
            totalPages,
            totalListings,
            deleted: req.query.deleted
        });
    } catch (error) {
        console.error('My listings error:', error);
        res.status(500).render('pages/error', {
            title: 'Error',
            message: 'Error loading listings'
        });
    }
});

// Favorites
router.get('/favorites', isAuthenticated, async (req, res) => {
    try {
        const user = await User.findById(req.session.user.id).populate('favorites');
        
        res.render('pages/favorites', {
            title: 'My Favorites - RUBICA',
            favorites: user.favorites || []
        });
    } catch (error) {
        console.error('Favorites error:', error);
        res.status(500).render('pages/error', {
            title: 'Error',
            message: 'Error loading favorites'
        });
    }
});

// Add to favorites
router.post('/favorites/:listingId', isAuthenticated, async (req, res) => {
    try {
        const user = await User.findById(req.session.user.id);
        const listing = await Listing.findById(req.params.listingId);
        
        if (!listing) {
            return res.status(404).json({ error: 'Listing not found' });
        }
        
        // Add to favorites if not already there
        if (!user.favorites || !user.favorites.includes(listing._id)) {
            if (!user.favorites) user.favorites = [];
            user.favorites.push(listing._id);
            await user.save();
            
            // Increment favorites count
            listing.stats.favorites += 1;
            await listing.save();
        }
        
        res.json({ success: true });
    } catch (error) {
        console.error('Add favorite error:', error);
        res.status(500).json({ error: 'Failed to add favorite' });
    }
});

// Remove from favorites
router.delete('/favorites/:listingId', isAuthenticated, async (req, res) => {
    try {
        const user = await User.findById(req.session.user.id);
        const listing = await Listing.findById(req.params.listingId);
        
        if (!listing) {
            return res.status(404).json({ error: 'Listing not found' });
        }
        
        // Remove from favorites
        if (user.favorites) {
            user.favorites = user.favorites.filter(f => f.toString() !== listing._id.toString());
            await user.save();
            
            // Decrement favorites count
            if (listing.stats.favorites > 0) {
                listing.stats.favorites -= 1;
                await listing.save();
            }
        }
        
        res.json({ success: true });
    } catch (error) {
        console.error('Remove favorite error:', error);
        res.status(500).json({ error: 'Failed to remove favorite' });
    }
});

module.exports = router;