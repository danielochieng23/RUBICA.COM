"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_1 = require("../middleware/auth");
const router = express_1.default.Router();
// Apply auth and admin middleware to all routes
router.use(auth_1.authMiddleware);
router.use(auth_1.adminMiddleware);
// @route   GET /api/admin/dashboard
// @desc    Get admin dashboard stats
// @access  Admin
router.get('/dashboard', async (req, res) => {
    try {
        res.json({
            success: true,
            message: 'Admin dashboard - To be implemented',
            data: {}
        });
    }
    catch (error) {
        console.error('Admin dashboard error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
});
exports.default = router;
//# sourceMappingURL=admin.js.map