const jwt = require('jsonwebtoken');

/**
 * Authentication middleware
 * Verifies JWT tokens for protected routes
 */
function authMiddleware(req, res, next) {
  try {
    // Get token from header
    const authHeader = req.headers.authorization;
    
    if (!authHeader) {
      return res.status(401).json({
        error: 'No authorization header provided'
      });
    }

    // Check for Bearer token
    const parts = authHeader.split(' ');
    if (parts.length !== 2 || parts[0] !== 'Bearer') {
      return res.status(401).json({
        error: 'Invalid authorization header format'
      });
    }

    const token = parts[1];

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'default-secret');
    
    // Add user info to request
    req.user = decoded;
    
    // Check token expiration
    if (decoded.exp && decoded.exp * 1000 < Date.now()) {
      return res.status(401).json({
        error: 'Token has expired'
      });
    }

    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        error: 'Invalid token'
      });
    }
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        error: 'Token has expired'
      });
    }

    return res.status(500).json({
      error: 'Authentication error'
    });
  }
}

/**
 * Generate JWT token
 * @param {Object} payload - Token payload
 * @param {Object} options - Token options
 * @returns {string} JWT token
 */
function generateToken(payload, options = {}) {
  const defaultOptions = {
    expiresIn: '24h',
    issuer: 'digital-id-framework'
  };

  return jwt.sign(
    payload,
    process.env.JWT_SECRET || 'default-secret',
    { ...defaultOptions, ...options }
  );
}

/**
 * Optional authentication middleware
 * Continues even if no valid token is provided
 */
function optionalAuth(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader) {
      return next();
    }

    const parts = authHeader.split(' ');
    if (parts.length !== 2 || parts[0] !== 'Bearer') {
      return next();
    }

    const token = parts[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'default-secret');
    
    req.user = decoded;
  } catch (error) {
    // Continue without authentication
  }
  
  next();
}

module.exports = authMiddleware;
module.exports.generateToken = generateToken;
module.exports.optionalAuth = optionalAuth;