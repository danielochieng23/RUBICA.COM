/**
 * Global error handling middleware
 */
function errorHandler(err, req, res, next) {
  // Log error for debugging
  console.error('Error:', {
    message: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method,
    body: req.body,
    timestamp: new Date().toISOString()
  });

  // Don't expose internal errors in production
  const isDevelopment = process.env.NODE_ENV === 'development';

  // Default error response
  let status = err.status || 500;
  let message = err.message || 'Internal server error';
  let details = null;

  // Handle specific error types
  if (err.name === 'ValidationError') {
    status = 400;
    message = 'Validation error';
    details = err.errors;
  } else if (err.name === 'CastError') {
    status = 400;
    message = 'Invalid data format';
  } else if (err.name === 'UnauthorizedError') {
    status = 401;
    message = 'Unauthorized';
  } else if (err.code === 'ECONNREFUSED') {
    status = 503;
    message = 'Service unavailable';
  } else if (err.message.includes('IPFS')) {
    status = 503;
    message = 'IPFS service error';
  } else if (err.message.includes('Contract')) {
    status = 503;
    message = 'Blockchain service error';
  }

  // Build error response
  const errorResponse = {
    error: true,
    message,
    timestamp: new Date().toISOString()
  };

  // Add details in development mode
  if (isDevelopment) {
    errorResponse.details = details || err.stack;
    errorResponse.originalError = err.message;
  }

  res.status(status).json(errorResponse);
}

module.exports = errorHandler;