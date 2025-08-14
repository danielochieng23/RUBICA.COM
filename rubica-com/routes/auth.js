const express = require('express');
const router = express.Router();
const User = require('../models/User');

// Login page
router.get('/login', (req, res) => {
    if (req.session.user) {
        return res.redirect('/user/dashboard');
    }
    res.render('pages/login', {
        title: 'Login - RUBICA',
        error: req.query.error
    });
});

// Login handler
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        // Find user
        const user = await User.findOne({ email });
        if (!user) {
            return res.redirect('/auth/login?error=Invalid credentials');
        }

        // Check password
        const isValidPassword = await user.comparePassword(password);
        if (!isValidPassword) {
            return res.redirect('/auth/login?error=Invalid credentials');
        }

        // Check if user is active
        if (!user.isActive) {
            return res.redirect('/auth/login?error=Account is inactive');
        }

        // Update last login
        await user.updateLastLogin();

        // Set session
        req.session.user = {
            id: user._id,
            username: user.username,
            email: user.email,
            role: user.role
        };

        res.redirect('/user/dashboard');
    } catch (error) {
        console.error('Login error:', error);
        res.redirect('/auth/login?error=Login failed');
    }
});

// Register page
router.get('/register', (req, res) => {
    if (req.session.user) {
        return res.redirect('/user/dashboard');
    }
    res.render('pages/register', {
        title: 'Register - RUBICA',
        error: req.query.error
    });
});

// Register handler
router.post('/register', async (req, res) => {
    try {
        const { username, email, password, confirmPassword, phone, city, role } = req.body;

        // Validate passwords match
        if (password !== confirmPassword) {
            return res.redirect('/auth/register?error=Passwords do not match');
        }

        // Check if user exists
        const existingUser = await User.findOne({
            $or: [{ email }, { username }]
        });

        if (existingUser) {
            return res.redirect('/auth/register?error=User already exists');
        }

        // Create new user
        const user = new User({
            username,
            email,
            password,
            phone,
            role: role || 'user',
            location: {
                city: city || 'Mumbai'
            }
        });

        await user.save();

        // Auto-login after registration
        req.session.user = {
            id: user._id,
            username: user.username,
            email: user.email,
            role: user.role
        };

        res.redirect('/user/dashboard');
    } catch (error) {
        console.error('Registration error:', error);
        res.redirect('/auth/register?error=Registration failed');
    }
});

// Logout
router.get('/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            console.error('Logout error:', err);
        }
        res.redirect('/');
    });
});

// Forgot password page
router.get('/forgot-password', (req, res) => {
    res.render('pages/forgot-password', {
        title: 'Forgot Password - RUBICA',
        message: req.query.message
    });
});

// Forgot password handler
router.post('/forgot-password', async (req, res) => {
    try {
        const { email } = req.body;

        const user = await User.findOne({ email });
        if (!user) {
            return res.redirect('/auth/forgot-password?message=If email exists, reset link sent');
        }

        // In a real app, you would send an email here
        // For now, just show a success message
        res.redirect('/auth/forgot-password?message=Password reset link sent to email');
    } catch (error) {
        console.error('Forgot password error:', error);
        res.redirect('/auth/forgot-password?message=Error processing request');
    }
});

module.exports = router;