import jwt from 'jsonwebtoken';
import User from '../models/User';
export const authMiddleware = async (req, res, next) => {
    try {
        const token = req.header('Authorization')?.replace('Bearer ', '');
        if (!token) {
            res.status(401).json({
                success: false,
                message: 'Access denied. No token provided.'
            });
            return;
        }
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'rubica-secret');
        const user = await User.findById(decoded.userId).select('-password');
        if (!user || !user.isActive) {
            res.status(401).json({
                success: false,
                message: 'Invalid token or user not active.'
            });
            return;
        }
        req.user = {
            userId: user._id.toString(),
            email: user.email,
            role: user.role
        };
        next();
    }
    catch (error) {
        console.error('Auth middleware error:', error);
        res.status(401).json({
            success: false,
            message: 'Invalid token.'
        });
    }
};
export const adminMiddleware = (req, res, next) => {
    if (!req.user) {
        res.status(401).json({
            success: false,
            message: 'Access denied. Authentication required.'
        });
        return;
    }
    if (req.user.role !== 'admin') {
        res.status(403).json({
            success: false,
            message: 'Access denied. Admin role required.'
        });
        return;
    }
    next();
};
export const moderatorMiddleware = (req, res, next) => {
    if (!req.user) {
        res.status(401).json({
            success: false,
            message: 'Access denied. Authentication required.'
        });
        return;
    }
    if (!['admin', 'moderator'].includes(req.user.role)) {
        res.status(403).json({
            success: false,
            message: 'Access denied. Moderator or admin role required.'
        });
        return;
    }
    next();
};
export const optionalAuthMiddleware = async (req, res, next) => {
    try {
        const token = req.header('Authorization')?.replace('Bearer ', '');
        if (token) {
            const decoded = jwt.verify(token, process.env.JWT_SECRET || 'rubica-secret');
            const user = await User.findById(decoded.userId).select('-password');
            if (user && user.isActive) {
                req.user = {
                    userId: user._id.toString(),
                    email: user.email,
                    role: user.role
                };
            }
        }
        next();
    }
    catch (error) {
        next();
    }
};
//# sourceMappingURL=auth.js.map