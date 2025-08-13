"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.optionalAuthMiddleware = exports.moderatorMiddleware = exports.adminMiddleware = exports.authMiddleware = void 0;
const express_1 = require("express");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const User_1 = __importDefault(require("../models/User"));
// Basic authentication middleware
const authMiddleware = async (req, res, next) => {
    try {
        const token = req.header('Authorization')?.replace('Bearer ', '');
        if (!token) {
            return res.status(401).json({
                success: false,
                message: 'Access denied. No token provided.'
            });
        }
        const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET || 'rubica-secret');
        const user = await User_1.default.findById(decoded.userId).select('-password');
        if (!user || !user.isActive) {
            return res.status(401).json({
                success: false,
                message: 'Invalid token or user not active.'
            });
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
exports.authMiddleware = authMiddleware;
// Admin role middleware
const adminMiddleware = (req, res, next) => {
    if (!req.user) {
        return res.status(401).json({
            success: false,
            message: 'Access denied. Authentication required.'
        });
    }
    if (req.user.role !== 'admin') {
        return res.status(403).json({
            success: false,
            message: 'Access denied. Admin role required.'
        });
    }
    next();
};
exports.adminMiddleware = adminMiddleware;
// Moderator or Admin role middleware
const moderatorMiddleware = (req, res, next) => {
    if (!req.user) {
        return res.status(401).json({
            success: false,
            message: 'Access denied. Authentication required.'
        });
    }
    if (!['admin', 'moderator'].includes(req.user.role)) {
        return res.status(403).json({
            success: false,
            message: 'Access denied. Moderator or admin role required.'
        });
    }
    next();
};
exports.moderatorMiddleware = moderatorMiddleware;
// Optional authentication middleware (doesn't fail if no token)
const optionalAuthMiddleware = async (req, res, next) => {
    try {
        const token = req.header('Authorization')?.replace('Bearer ', '');
        if (token) {
            const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET || 'rubica-secret');
            const user = await User_1.default.findById(decoded.userId).select('-password');
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
        // Continue without authentication for optional auth
        next();
    }
};
exports.optionalAuthMiddleware = optionalAuthMiddleware;
//# sourceMappingURL=auth.js.map