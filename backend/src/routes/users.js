"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const express_validator_1 = require("express-validator");
const auth_1 = require("../middleware/auth");
const User_1 = __importDefault(require("../models/User"));
const router = express_1.default.Router();
// @route   GET /api/users/profile
// @desc    Get user profile
// @access  Private
router.get('/profile', auth_1.authMiddleware, async (req, res) => {
    try {
        const user = await User_1.default.findById(req.user?.userId).select('-password');
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }
        res.json({
            success: true,
            data: { user }
        });
    }
    catch (error) {
        console.error('Get profile error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
});
// @route   PUT /api/users/profile
// @desc    Update user profile
// @access  Private
router.put('/profile', auth_1.authMiddleware, [
    (0, express_validator_1.body)('name').optional().trim().isLength({ min: 2 }).withMessage('Name must be at least 2 characters'),
    (0, express_validator_1.body)('phone').optional().isMobilePhone('any').withMessage('Please provide a valid phone number'),
    (0, express_validator_1.body)('city').optional().trim().isLength({ min: 2 }).withMessage('City must be at least 2 characters'),
    (0, express_validator_1.body)('state').optional().trim().isLength({ min: 2 }).withMessage('State must be at least 2 characters')
], async (req, res) => {
    try {
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                message: 'Validation errors',
                errors: errors.array()
            });
        }
        const { name, phone, city, state, gender, dateOfBirth, preferences } = req.body;
        const user = await User_1.default.findById(req.user?.userId);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }
        // Update fields
        if (name)
            user.name = name;
        if (phone)
            user.phone = phone;
        if (city)
            user.city = city;
        if (state)
            user.state = state;
        if (gender)
            user.gender = gender;
        if (dateOfBirth)
            user.dateOfBirth = new Date(dateOfBirth);
        if (preferences)
            user.preferences = { ...user.preferences, ...preferences };
        await user.save();
        res.json({
            success: true,
            message: 'Profile updated successfully',
            data: { user }
        });
    }
    catch (error) {
        console.error('Update profile error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
});
exports.default = router;
//# sourceMappingURL=users.js.map