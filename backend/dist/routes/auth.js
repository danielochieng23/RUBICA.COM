import express from 'express';
import { body, validationResult } from 'express-validator';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import User from '../models/User';
import { authMiddleware } from '../middleware/auth';
import rateLimit from 'express-rate-limit';
const router = express.Router();
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 5,
    message: 'Too many authentication attempts, please try again later.'
});
const registerValidation = [
    body('email').isEmail().normalizeEmail().withMessage('Please provide a valid email'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long'),
    body('name').trim().isLength({ min: 2 }).withMessage('Name must be at least 2 characters long'),
    body('phone').optional().isMobilePhone('any').withMessage('Please provide a valid phone number')
];
const loginValidation = [
    body('email').isEmail().normalizeEmail().withMessage('Please provide a valid email'),
    body('password').notEmpty().withMessage('Password is required')
];
const generateToken = (userId) => {
    const secret = process.env.JWT_SECRET || 'rubica-secret';
    return jwt.sign({ userId }, secret, { expiresIn: '7d' });
};
router.post('/register', authLimiter, registerValidation, async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                message: 'Validation errors',
                errors: errors.array()
            });
        }
        const { email, password, name, phone, city, state } = req.body;
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: 'User with this email already exists'
            });
        }
        const verificationToken = crypto.randomBytes(32).toString('hex');
        const user = new User({
            email,
            password,
            name,
            phone,
            city,
            state,
            verificationToken
        });
        await user.save();
        const token = generateToken(user._id.toString());
        res.status(201).json({
            success: true,
            message: 'User registered successfully',
            data: {
                token,
                user: {
                    id: user._id,
                    email: user.email,
                    name: user.name,
                    isVerified: user.isVerified,
                    role: user.role
                }
            }
        });
    }
    catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error during registration'
        });
    }
});
router.post('/login', authLimiter, loginValidation, async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                message: 'Validation errors',
                errors: errors.array()
            });
        }
        const { email, password } = req.body;
        const user = await User.findOne({ email, isActive: true });
        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials'
            });
        }
        const isPasswordValid = await user.comparePassword(password);
        if (!isPasswordValid) {
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials'
            });
        }
        const token = generateToken(user._id.toString());
        res.json({
            success: true,
            message: 'Login successful',
            data: {
                token,
                user: {
                    id: user._id,
                    email: user.email,
                    name: user.name,
                    isVerified: user.isVerified,
                    role: user.role
                }
            }
        });
    }
    catch (error) {
        console.error('Login error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error during login'
        });
    }
});
router.get('/me', authMiddleware, async (req, res) => {
    try {
        const user = await User.findById(req.user?.userId).select('-password');
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }
        return res.json({
            success: true,
            data: { user }
        });
    }
    catch (error) {
        console.error('Get profile error:', error);
        return res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
});
router.post('/forgot-password', authLimiter, [
    body('email').isEmail().normalizeEmail().withMessage('Please provide a valid email')
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                message: 'Please provide a valid email',
                errors: errors.array()
            });
        }
        const { email } = req.body;
        const user = await User.findOne({ email, isActive: true });
        if (!user) {
            return res.json({
                success: true,
                message: 'If an account with this email exists, we have sent a password reset link'
            });
        }
        const resetToken = crypto.randomBytes(32).toString('hex');
        user.resetPasswordToken = resetToken;
        user.resetPasswordExpires = new Date(Date.now() + 60 * 60 * 1000);
        await user.save();
        console.log(`Password reset token for ${email}: ${resetToken}`);
        res.json({
            success: true,
            message: 'If an account with this email exists, we have sent a password reset link'
        });
    }
    catch (error) {
        console.error('Forgot password error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
});
router.post('/reset-password', authLimiter, [
    body('token').notEmpty().withMessage('Reset token is required'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long')
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                message: 'Validation errors',
                errors: errors.array()
            });
        }
        const { token, password } = req.body;
        const user = await User.findOne({
            resetPasswordToken: token,
            resetPasswordExpires: { $gt: new Date() },
            isActive: true
        });
        if (!user) {
            return res.status(400).json({
                success: false,
                message: 'Invalid or expired reset token'
            });
        }
        user.password = password;
        user.resetPasswordToken = undefined;
        user.resetPasswordExpires = undefined;
        await user.save();
        res.json({
            success: true,
            message: 'Password reset successfully'
        });
    }
    catch (error) {
        console.error('Reset password error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
});
router.post('/change-password', authMiddleware, [
    body('currentPassword').notEmpty().withMessage('Current password is required'),
    body('newPassword').isLength({ min: 6 }).withMessage('New password must be at least 6 characters long')
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                message: 'Validation errors',
                errors: errors.array()
            });
        }
        const { currentPassword, newPassword } = req.body;
        const user = await User.findById(req.user?.userId);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }
        const isCurrentPasswordValid = await user.comparePassword(currentPassword);
        if (!isCurrentPasswordValid) {
            return res.status(401).json({
                success: false,
                message: 'Current password is incorrect'
            });
        }
        user.password = newPassword;
        await user.save();
        res.json({
            success: true,
            message: 'Password changed successfully'
        });
    }
    catch (error) {
        console.error('Change password error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
});
export default router;
//# sourceMappingURL=auth.js.map