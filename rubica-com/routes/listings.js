const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const Listing = require('../models/Listing');
const { isAuthenticated } = require('../middleware/auth');

// Configure multer for image uploads
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'public/uploads/')
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({ 
    storage: storage,
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB limit
    },
    fileFilter: function (req, file, cb) {
        const allowedTypes = /jpeg|jpg|png|gif/;
        const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = allowedTypes.test(file.mimetype);

        if (mimetype && extname) {
            return cb(null, true);
        } else {
            cb(new Error('Only image files are allowed'));
        }
    }
});

// View all listings by category
router.get('/category/:category', async (req, res) => {
    try {
        const { category } = req.params;
        const { city, page = 1, sort = 'recent' } = req.query;
        const perPage = 20;
        const skip = (page - 1) * perPage;

        let query = { 
            status: 'active',
            category: category
        };

        if (city) {
            query['location.city'] = new RegExp(city, 'i');
        }

        let sortOption = {};
        switch (sort) {
            case 'premium':
                sortOption = { 'features.isPremium': -1, createdAt: -1 };
                break;
            case 'views':
                sortOption = { 'stats.views': -1 };
                break;
            case 'price-low':
                sortOption = { 'pricing.amount': 1 };
                break;
            case 'price-high':
                sortOption = { 'pricing.amount': -1 };
                break;
            default:
                sortOption = { createdAt: -1 };
        }

        const listings = await Listing.find(query)
            .populate('author', 'username')
            .skip(skip)
            .limit(perPage)
            .sort(sortOption);

        const totalListings = await Listing.countDocuments(query);
        const totalPages = Math.ceil(totalListings / perPage);

        // Get category display name
        const categoryNames = {
            'call-girls': 'Call Girls',
            'massages': 'Massages',
            'male-escorts': 'Male Escorts',
            'transsexual': 'Transsexual',
            'adult-meetings': 'Adult Meetings'
        };

        res.render('pages/category', {
            title: `${categoryNames[category] || category} - RUBICA`,
            category,
            categoryName: categoryNames[category] || category,
            listings,
            selectedCity: city,
            selectedSort: sort,
            currentPage: parseInt(page),
            totalPages,
            totalListings
        });
    } catch (error) {
        console.error('Category error:', error);
        res.status(500).render('pages/error', {
            title: 'Error',
            message: 'Error loading category'
        });
    }
});

// View single listing
router.get('/:id', async (req, res) => {
    try {
        const listing = await Listing.findById(req.params.id)
            .populate('author', 'username email phone');

        if (!listing || listing.status !== 'active') {
            return res.status(404).render('pages/404', {
                title: 'Listing Not Found',
                message: 'The listing you are looking for does not exist.'
            });
        }

        // Increment views
        await listing.incrementViews();

        // Get related listings
        const relatedListings = await Listing.find({
            _id: { $ne: listing._id },
            category: listing.category,
            'location.city': listing.location.city,
            status: 'active'
        })
        .limit(6)
        .sort('-createdAt');

        res.render('pages/listing-detail', {
            title: `${listing.title} - RUBICA`,
            listing,
            relatedListings
        });
    } catch (error) {
        console.error('Listing view error:', error);
        res.status(500).render('pages/error', {
            title: 'Error',
            message: 'Error loading listing'
        });
    }
});

// Create listing page
router.get('/new/create', isAuthenticated, (req, res) => {
    res.render('pages/create-listing', {
        title: 'Post New Ad - RUBICA',
        error: req.query.error
    });
});

// Create listing handler
router.post('/new/create', isAuthenticated, upload.array('images', 5), async (req, res) => {
    try {
        const {
            title, description, category, subcategory,
            city, area, state,
            phone, whatsapp, email, hidePhone,
            price, currency, duration, negotiable,
            age, services, 
            availableDays, hoursFrom, hoursTo, incall, outcall
        } = req.body;

        // Process uploaded images
        const images = req.files.map((file, index) => ({
            url: '/uploads/' + file.filename,
            isPrimary: index === 0
        }));

        // Create new listing
        const listing = new Listing({
            title,
            description,
            category,
            subcategory,
            author: req.session.user.id,
            location: {
                city,
                area,
                state,
                country: 'India'
            },
            contact: {
                phone,
                whatsapp,
                email,
                hidePhone: hidePhone === 'on'
            },
            pricing: {
                amount: price ? parseFloat(price) : null,
                currency: currency || 'INR',
                duration,
                negotiable: negotiable === 'on'
            },
            images,
            age: age ? parseInt(age) : null,
            services: services ? services.split(',').map(s => s.trim()) : [],
            availability: {
                days: availableDays || [],
                hours: {
                    from: hoursFrom,
                    to: hoursTo
                },
                incall: incall === 'on',
                outcall: outcall === 'on'
            }
        });

        await listing.save();

        res.redirect(`/listings/${listing._id}?success=true`);
    } catch (error) {
        console.error('Create listing error:', error);
        res.redirect('/listings/new/create?error=Failed to create listing');
    }
});

// Edit listing page
router.get('/:id/edit', isAuthenticated, async (req, res) => {
    try {
        const listing = await Listing.findById(req.params.id);

        if (!listing) {
            return res.status(404).render('pages/404', {
                title: 'Listing Not Found',
                message: 'The listing you are looking for does not exist.'
            });
        }

        // Check ownership
        if (listing.author.toString() !== req.session.user.id) {
            return res.status(403).render('pages/error', {
                title: 'Unauthorized',
                message: 'You are not authorized to edit this listing.'
            });
        }

        res.render('pages/edit-listing', {
            title: 'Edit Listing - RUBICA',
            listing,
            error: req.query.error
        });
    } catch (error) {
        console.error('Edit listing error:', error);
        res.status(500).render('pages/error', {
            title: 'Error',
            message: 'Error loading listing'
        });
    }
});

// Update listing handler
router.post('/:id/edit', isAuthenticated, upload.array('images', 5), async (req, res) => {
    try {
        const listing = await Listing.findById(req.params.id);

        if (!listing || listing.author.toString() !== req.session.user.id) {
            return res.status(403).json({ error: 'Unauthorized' });
        }

        // Update listing fields
        Object.assign(listing, {
            title: req.body.title,
            description: req.body.description,
            category: req.body.category,
            subcategory: req.body.subcategory,
            'location.city': req.body.city,
            'location.area': req.body.area,
            'location.state': req.body.state,
            'contact.phone': req.body.phone,
            'contact.whatsapp': req.body.whatsapp,
            'contact.email': req.body.email,
            'contact.hidePhone': req.body.hidePhone === 'on',
            'pricing.amount': req.body.price ? parseFloat(req.body.price) : null,
            'pricing.duration': req.body.duration,
            'pricing.negotiable': req.body.negotiable === 'on',
            age: req.body.age ? parseInt(req.body.age) : null,
            services: req.body.services ? req.body.services.split(',').map(s => s.trim()) : []
        });

        // Add new images if uploaded
        if (req.files && req.files.length > 0) {
            const newImages = req.files.map(file => ({
                url: '/uploads/' + file.filename,
                isPrimary: false
            }));
            listing.images.push(...newImages);
        }

        await listing.save();

        res.redirect(`/listings/${listing._id}?updated=true`);
    } catch (error) {
        console.error('Update listing error:', error);
        res.redirect(`/listings/${req.params.id}/edit?error=Failed to update listing`);
    }
});

// Delete listing
router.post('/:id/delete', isAuthenticated, async (req, res) => {
    try {
        const listing = await Listing.findById(req.params.id);

        if (!listing || listing.author.toString() !== req.session.user.id) {
            return res.status(403).json({ error: 'Unauthorized' });
        }

        listing.status = 'inactive';
        await listing.save();

        res.redirect('/user/my-listings?deleted=true');
    } catch (error) {
        console.error('Delete listing error:', error);
        res.status(500).json({ error: 'Failed to delete listing' });
    }
});

module.exports = router;