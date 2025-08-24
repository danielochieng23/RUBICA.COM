/**
 * Digital ID Framework - Main Entry Point
 */

require('dotenv').config();
const { startServer } = require('./api/server');

// Start the server
startServer().catch(error => {
  console.error('Failed to start server:', error);
  process.exit(1);
});