const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const winston = require('winston');
require('dotenv').config();

// Import our services and components
const IdentityManager = require('./identity/identityManager');
const BlockchainService = require('./blockchain/blockchainService');

// Import routes
const identityRoutes = require('./api/routes/identity');

/**
 * Privacy-Preserving Digital Identity Framework
 * Main Application Server
 */

// Configure logging
const logger = winston.createLogger({
    level: process.env.LOG_LEVEL || 'info',
    format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.errors({ stack: true }),
        winston.format.json()
    ),
    defaultMeta: { service: 'privacy-id-framework' },
    transports: [
        new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
        new winston.transports.File({ filename: 'logs/app.log' }),
        new winston.transports.Console({
            format: winston.format.combine(
                winston.format.colorize(),
                winston.format.simple()
            )
        })
    ]
});

class PrivacyIDFramework {
    constructor() {
        this.app = express();
        this.port = process.env.PORT || 3000;
        this.identityManager = new IdentityManager();
        this.blockchainService = new BlockchainService();
    }

    /**
     * Initialize all services
     */
    async initialize() {
        try {
            logger.info('Initializing Privacy-Preserving Digital Identity Framework...');

            // Initialize services
            await this.identityManager.initialize();
            logger.info('Identity Manager initialized');

            // Initialize blockchain service (optional)
            try {
                await this.blockchainService.initialize();
                logger.info('Blockchain Service initialized');
            } catch (blockchainError) {
                logger.warn('Blockchain Service initialization failed:', blockchainError.message);
                logger.warn('Continuing without blockchain integration');
                this.blockchainService = null;
            }

            // Configure middleware and routes
            this.configureMiddleware();
            this.configureRoutes();
            this.configureErrorHandling();

            logger.info('Framework initialization completed successfully');
        } catch (error) {
            logger.error('Framework initialization failed:', error);
            throw error;
        }
    }

    /**
     * Configure Express middleware
     */
    configureMiddleware() {
        // Security middleware
        this.app.use(helmet({
            contentSecurityPolicy: {
                directives: {
                    defaultSrc: ["'self'"],
                    styleSrc: ["'self'", "'unsafe-inline'"],
                    scriptSrc: ["'self'"],
                    imgSrc: ["'self'", "data:", "https:"],
                },
            },
        }));

        // CORS configuration
        this.app.use(cors({
            origin: process.env.CORS_ORIGIN || 'http://localhost:3001',
            credentials: true,
            methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
            allowedHeaders: ['Content-Type', 'Authorization']
        }));

        // Body parsing middleware
        this.app.use(express.json({ limit: '10mb' }));
        this.app.use(express.urlencoded({ extended: true, limit: '10mb' }));

        // Logging middleware
        this.app.use(morgan('combined', {
            stream: {
                write: (message) => logger.info(message.trim())
            }
        }));

        // Make services available to routes
        this.app.locals.identityManager = this.identityManager;
        this.app.locals.blockchainService = this.blockchainService;
        this.app.locals.logger = logger;
    }

    /**
     * Configure API routes
     */
    configureRoutes() {
        // Health check endpoint
        this.app.get('/health', (req, res) => {
            res.json({
                status: 'ok',
                timestamp: new Date().toISOString(),
                services: {
                    identityManager: !!this.identityManager,
                    blockchainService: !!this.blockchainService
                }
            });
        });

        // API information endpoint
        this.app.get('/api', (req, res) => {
            res.json({
                name: 'Privacy-Preserving Digital Identity Framework',
                version: '1.0.0',
                description: 'Blockchain-based privacy-preserving digital identity with zero-knowledge proofs',
                endpoints: {
                    identity: '/api/identity',
                    health: '/health',
                    docs: '/api/docs'
                },
                features: [
                    'Zero-knowledge proofs',
                    'Privacy-preserving credentials',
                    'Blockchain integration',
                    'Merkle tree verification',
                    'Age proofs without revealing exact age',
                    'Credential membership proofs'
                ]
            });
        });

        // API routes
        this.app.use('/api/identity', identityRoutes);

        // API documentation endpoint
        this.app.get('/api/docs', (req, res) => {
            res.json({
                title: 'Privacy-Preserving Digital Identity API Documentation',
                version: '1.0.0',
                endpoints: {
                    'POST /api/identity/create': {
                        description: 'Create a new privacy-preserving digital identity',
                        body: {
                            personalData: 'object',
                            password: 'string'
                        }
                    },
                    'POST /api/identity/authenticate': {
                        description: 'Authenticate a user',
                        body: {
                            identityId: 'string',
                            password: 'string'
                        }
                    },
                    'GET /api/identity/:identityId': {
                        description: 'Get public identity information'
                    },
                    'POST /api/identity/credentials/add': {
                        description: 'Add a credential to an identity',
                        body: {
                            identityId: 'string',
                            credentialData: 'object',
                            issuerAddress: 'string'
                        }
                    },
                    'POST /api/identity/proof/generate': {
                        description: 'Generate a zero-knowledge proof for identity verification',
                        body: {
                            identityId: 'string',
                            password: 'string',
                            proofRequirements: 'object'
                        }
                    },
                    'POST /api/identity/proof/verify': {
                        description: 'Verify a zero-knowledge proof',
                        body: {
                            proof: 'object',
                            publicSignals: 'object'
                        }
                    },
                    'POST /api/identity/proof/credential': {
                        description: 'Generate a credential proof without revealing the credential',
                        body: {
                            identityId: 'string',
                            password: 'string',
                            requirements: 'object'
                        }
                    },
                    'POST /api/identity/proof/age': {
                        description: 'Generate an age proof without revealing exact age',
                        body: {
                            identityId: 'string',
                            password: 'string',
                            minimumAge: 'number'
                        }
                    }
                }
            });
        });

        // 404 handler for undefined routes
        this.app.use('*', (req, res) => {
            res.status(404).json({
                success: false,
                error: 'Route not found',
                message: `The requested route ${req.originalUrl} does not exist`
            });
        });
    }

    /**
     * Configure error handling middleware
     */
    configureErrorHandling() {
        // Global error handler
        this.app.use((error, req, res, next) => {
            logger.error('Unhandled error:', {
                error: error.message,
                stack: error.stack,
                url: req.url,
                method: req.method
            });

            // Don't leak error details in production
            const isDevelopment = process.env.NODE_ENV === 'development';

            res.status(error.status || 500).json({
                success: false,
                error: 'Internal server error',
                message: isDevelopment ? error.message : 'Something went wrong',
                ...(isDevelopment && { stack: error.stack })
            });
        });

        // Handle unhandled promise rejections
        process.on('unhandledRejection', (reason, promise) => {
            logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
        });

        // Handle uncaught exceptions
        process.on('uncaughtException', (error) => {
            logger.error('Uncaught Exception thrown:', error);
            process.exit(1);
        });
    }

    /**
     * Start the server
     */
    async start() {
        try {
            await this.initialize();

            this.server = this.app.listen(this.port, () => {
                logger.info(`Privacy-Preserving Digital Identity Framework started`);
                logger.info(`Server running on http://localhost:${this.port}`);
                logger.info(`API documentation available at http://localhost:${this.port}/api/docs`);
                logger.info(`Health check available at http://localhost:${this.port}/health`);
            });

            return this.server;
        } catch (error) {
            logger.error('Failed to start server:', error);
            throw error;
        }
    }

    /**
     * Stop the server gracefully
     */
    async stop() {
        return new Promise((resolve) => {
            if (this.server) {
                logger.info('Shutting down server gracefully...');
                this.server.close(() => {
                    logger.info('Server stopped');
                    resolve();
                });
            } else {
                resolve();
            }
        });
    }
}

// Start the application if this file is run directly
if (require.main === module) {
    const framework = new PrivacyIDFramework();
    
    framework.start().catch((error) => {
        console.error('Failed to start Privacy-Preserving Digital Identity Framework:', error);
        process.exit(1);
    });

    // Graceful shutdown
    process.on('SIGTERM', async () => {
        logger.info('SIGTERM received, shutting down gracefully');
        await framework.stop();
        process.exit(0);
    });

    process.on('SIGINT', async () => {
        logger.info('SIGINT received, shutting down gracefully');
        await framework.stop();
        process.exit(0);
    });
}

module.exports = PrivacyIDFramework;