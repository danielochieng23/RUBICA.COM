import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User';

// Extend Express Request interface
declare global {
  namespace Express {
    interface Request {
      user?: {
        userId: string;
        email: string;
        role: string;
      };
    }
  }
}

interface JwtPayload {
  userId: string;
}

// Basic authentication middleware
export const authMiddleware = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
      res.status(401).json({
        success: false,
        message: 'Access denied. No token provided.'
      });
      return;
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'rubica-secret') as JwtPayload;
    const user = await User.findById(decoded.userId).select('-password');

    if (!user || !user.isActive) {
      res.status(401).json({
        success: false,
        message: 'Invalid token or user not active.'
      });
      return;
    }

    req.user = {
      userId: (user._id as any).toString(),
      email: user.email,
      role: user.role
    };

    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(401).json({
      success: false,
      message: 'Invalid token.'
    });
  }
};

// Admin role middleware
export const adminMiddleware = (req: Request, res: Response, next: NextFunction): void => {
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

// Moderator or Admin role middleware
export const moderatorMiddleware = (req: Request, res: Response, next: NextFunction): void => {
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

// Optional authentication middleware (doesn't fail if no token)
export const optionalAuthMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (token) {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'rubica-secret') as JwtPayload;
      const user = await User.findById(decoded.userId).select('-password');

      if (user && user.isActive) {
        req.user = {
          userId: (user._id as any).toString(),
          email: user.email,
          role: user.role
        };
      }
    }

    next();
  } catch (error) {
    // Continue without authentication for optional auth
    next();
  }
};