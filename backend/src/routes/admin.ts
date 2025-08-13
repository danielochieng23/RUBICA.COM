import express from 'express';
import { authMiddleware, adminMiddleware } from '../middleware/auth';

const router = express.Router();

// Apply auth and admin middleware to all routes
router.use(authMiddleware);
router.use(adminMiddleware);

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
  } catch (error) {
    console.error('Admin dashboard error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

export default router;