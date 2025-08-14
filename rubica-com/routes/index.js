const express = require('express');
const router = express.Router();
const Listing = require('../models/Listing');

// Homepage
router.get('/', async (req, res) => {
    try {
        // Get featured listings
        const featuredListings = await Listing.find({
            status: 'active',
            'features.isFeatured': true
        })
        .populate('author', 'username')
        .limit(8)
        .sort('-createdAt');

        // Get recent listings by category
        const categories = [
            { slug: 'call-girls', name: 'Call Girls', icon: 'fa-female' },
            { slug: 'massages', name: 'Massages', icon: 'fa-spa' },
            { slug: 'male-escorts', name: 'Male Escorts', icon: 'fa-male' },
            { slug: 'transsexual', name: 'Transsexual', icon: 'fa-transgender' },
            { slug: 'adult-meetings', name: 'Adult Meetings', icon: 'fa-users' }
        ];

        // Get popular cities
        const popularCities = [
            'Mumbai', 'Delhi', 'Bangalore', 'Kolkata', 'Chennai', 
            'Hyderabad', 'Pune', 'Ahmedabad', 'Jaipur', 'Goa'
        ];

        res.render('pages/home', {
            title: 'RUBICA - Adult Classifieds India',
            featuredListings,
            categories,
            popularCities
        });
    } catch (error) {
        console.error('Homepage error:', error);
        res.status(500).render('pages/error', {
            title: 'Error',
            message: 'Error loading homepage'
        });
    }
});

// Search page
router.get('/search', async (req, res) => {
    try {
        const { q, city, category, page = 1 } = req.query;
        const perPage = 20;
        const skip = (page - 1) * perPage;

        let query = { status: 'active' };

        if (q) {
            query.$text = { $search: q };
        }
        if (city) {
            query['location.city'] = new RegExp(city, 'i');
        }
        if (category) {
            query.category = category;
        }

        const listings = await Listing.find(query)
            .populate('author', 'username')
            .skip(skip)
            .limit(perPage)
            .sort('-createdAt');

        const totalListings = await Listing.countDocuments(query);
        const totalPages = Math.ceil(totalListings / perPage);

        res.render('pages/search', {
            title: 'Search Results - RUBICA',
            listings,
            searchQuery: q,
            selectedCity: city,
            selectedCategory: category,
            currentPage: page,
            totalPages,
            totalListings
        });
    } catch (error) {
        console.error('Search error:', error);
        res.status(500).render('pages/error', {
            title: 'Error',
            message: 'Error performing search'
        });
    }
});

// About page
router.get('/about', (req, res) => {
    res.render('pages/about', {
        title: 'About RUBICA'
    });
});

// Terms page
router.get('/terms', (req, res) => {
    res.render('pages/terms', {
        title: 'Terms of Service - RUBICA'
    });
});

// Privacy page
router.get('/privacy', (req, res) => {
    res.render('pages/privacy', {
        title: 'Privacy Policy - RUBICA'
    });
});

// Contact page
router.get('/contact', (req, res) => {
    res.render('pages/contact', {
        title: 'Contact Us - RUBICA'
    });
});

module.exports = router;