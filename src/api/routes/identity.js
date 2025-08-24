const express = require('express');
const Joi = require('joi');
const router = express.Router();

/**
 * Identity Routes for Privacy-Preserving Digital Identity API
 */

// Validation schemas
const createIdentitySchema = Joi.object({
    personalData: Joi.object({
        firstName: Joi.string().required(),
        lastName: Joi.string().required(),
        dateOfBirth: Joi.date().required(),
        email: Joi.string().email().required(),
        phoneNumber: Joi.string().optional(),
        address: Joi.object({
            street: Joi.string().required(),
            city: Joi.string().required(),
            state: Joi.string().required(),
            zipCode: Joi.string().required(),
            country: Joi.string().required()
        }).optional()
    }).required(),
    password: Joi.string().min(8).required()
});

const authenticateSchema = Joi.object({
    identityId: Joi.string().uuid().required(),
    password: Joi.string().required()
});

const addCredentialSchema = Joi.object({
    identityId: Joi.string().uuid().required(),
    credentialData: Joi.object({
        type: Joi.string().required(),
        data: Joi.object().required(),
        expiresAt: Joi.date().required()
    }).required(),
    issuerAddress: Joi.string().required()
});

const generateProofSchema = Joi.object({
    identityId: Joi.string().uuid().required(),
    password: Joi.string().required(),
    proofRequirements: Joi.object({
        challenge: Joi.string().optional(),
        type: Joi.string().optional()
    }).optional()
});

const verifyProofSchema = Joi.object({
    proof: Joi.object().required(),
    publicSignals: Joi.object().required()
});

/**
 * @route POST /api/identity/create
 * @desc Create a new privacy-preserving digital identity
 * @access Public
 */
router.post('/create', async (req, res) => {
    try {
        // Validate request body
        const { error, value } = createIdentitySchema.validate(req.body);
        if (error) {
            return res.status(400).json({
                success: false,
                error: 'Validation error',
                details: error.details[0].message
            });
        }

        const { personalData, password } = value;

        // Create identity using the identity manager
        const identity = await req.app.locals.identityManager.createIdentity(
            personalData,
            password
        );

        // Store on blockchain if available
        if (req.app.locals.blockchainService) {
            try {
                await req.app.locals.blockchainService.createIdentity(
                    identity.identityCommitment,
                    identity.merkleRoot
                );
            } catch (blockchainError) {
                console.warn('Blockchain storage failed:', blockchainError.message);
                // Continue without blockchain - identity is still created locally
            }
        }

        res.status(201).json({
            success: true,
            message: 'Identity created successfully',
            data: {
                identityId: identity.identityId,
                address: identity.address,
                publicKey: identity.publicKey,
                identityCommitment: identity.identityCommitment
            }
        });
    } catch (error) {
        console.error('Error creating identity:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to create identity',
            details: error.message
        });
    }
});

/**
 * @route POST /api/identity/authenticate
 * @desc Authenticate a user and return identity information
 * @access Public
 */
router.post('/authenticate', async (req, res) => {
    try {
        // Validate request body
        const { error, value } = authenticateSchema.validate(req.body);
        if (error) {
            return res.status(400).json({
                success: false,
                error: 'Validation error',
                details: error.details[0].message
            });
        }

        const { identityId, password } = value;

        // Authenticate user
        const identity = await req.app.locals.identityManager.authenticateIdentity(
            identityId,
            password
        );

        res.json({
            success: true,
            message: 'Authentication successful',
            data: identity
        });
    } catch (error) {
        console.error('Error authenticating identity:', error);
        res.status(401).json({
            success: false,
            error: 'Authentication failed',
            details: error.message
        });
    }
});

/**
 * @route GET /api/identity/:identityId
 * @desc Get public identity information
 * @access Public
 */
router.get('/:identityId', async (req, res) => {
    try {
        const { identityId } = req.params;

        if (!identityId) {
            return res.status(400).json({
                success: false,
                error: 'Identity ID is required'
            });
        }

        const identity = req.app.locals.identityManager.getIdentityInfo(identityId);

        if (!identity) {
            return res.status(404).json({
                success: false,
                error: 'Identity not found'
            });
        }

        res.json({
            success: true,
            data: identity
        });
    } catch (error) {
        console.error('Error retrieving identity:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to retrieve identity',
            details: error.message
        });
    }
});

/**
 * @route POST /api/identity/credentials/add
 * @desc Add a credential to an identity
 * @access Public
 */
router.post('/credentials/add', async (req, res) => {
    try {
        // Validate request body
        const { error, value } = addCredentialSchema.validate(req.body);
        if (error) {
            return res.status(400).json({
                success: false,
                error: 'Validation error',
                details: error.details[0].message
            });
        }

        const { identityId, credentialData, issuerAddress } = value;

        // Add credential
        const credential = await req.app.locals.identityManager.addCredential(
            identityId,
            credentialData,
            issuerAddress
        );

        // Issue credential on blockchain if available
        if (req.app.locals.blockchainService) {
            try {
                const expirationTime = Math.floor(new Date(credentialData.expiresAt).getTime() / 1000);
                await req.app.locals.blockchainService.issueCredential(
                    issuerAddress, // recipient will be different in real scenario
                    credential.hash,
                    1, // credential type
                    expirationTime
                );
            } catch (blockchainError) {
                console.warn('Blockchain credential issuance failed:', blockchainError.message);
            }
        }

        res.status(201).json({
            success: true,
            message: 'Credential added successfully',
            data: {
                id: credential.id,
                type: credential.type,
                issuer: credential.issuer,
                issuedAt: credential.issuedAt,
                hash: credential.hash
            }
        });
    } catch (error) {
        console.error('Error adding credential:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to add credential',
            details: error.message
        });
    }
});

/**
 * @route POST /api/identity/proof/generate
 * @desc Generate a zero-knowledge proof for identity verification
 * @access Public
 */
router.post('/proof/generate', async (req, res) => {
    try {
        // Validate request body
        const { error, value } = generateProofSchema.validate(req.body);
        if (error) {
            return res.status(400).json({
                success: false,
                error: 'Validation error',
                details: error.details[0].message
            });
        }

        const { identityId, password, proofRequirements = {} } = value;

        // Generate proof
        const proof = await req.app.locals.identityManager.generateIdentityProof(
            identityId,
            password,
            proofRequirements
        );

        res.json({
            success: true,
            message: 'Proof generated successfully',
            data: proof
        });
    } catch (error) {
        console.error('Error generating proof:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to generate proof',
            details: error.message
        });
    }
});

/**
 * @route POST /api/identity/proof/verify
 * @desc Verify a zero-knowledge proof
 * @access Public
 */
router.post('/proof/verify', async (req, res) => {
    try {
        // Validate request body
        const { error, value } = verifyProofSchema.validate(req.body);
        if (error) {
            return res.status(400).json({
                success: false,
                error: 'Validation error',
                details: error.details[0].message
            });
        }

        const { proof, publicSignals } = value;

        // Verify proof
        const isValid = await req.app.locals.identityManager.verifyProof(
            proof,
            publicSignals
        );

        res.json({
            success: true,
            message: 'Proof verification completed',
            data: {
                isValid,
                verifiedAt: new Date().toISOString()
            }
        });
    } catch (error) {
        console.error('Error verifying proof:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to verify proof',
            details: error.message
        });
    }
});

/**
 * @route POST /api/identity/proof/credential
 * @desc Generate a credential proof without revealing the credential
 * @access Public
 */
router.post('/proof/credential', async (req, res) => {
    try {
        const { identityId, password, requirements } = req.body;

        if (!identityId || !password || !requirements) {
            return res.status(400).json({
                success: false,
                error: 'Missing required fields'
            });
        }

        // Generate credential proof
        const proof = await req.app.locals.identityManager.generateCredentialProof(
            identityId,
            password,
            requirements
        );

        res.json({
            success: true,
            message: 'Credential proof generated successfully',
            data: proof
        });
    } catch (error) {
        console.error('Error generating credential proof:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to generate credential proof',
            details: error.message
        });
    }
});

/**
 * @route POST /api/identity/proof/age
 * @desc Generate an age proof without revealing exact age
 * @access Public
 */
router.post('/proof/age', async (req, res) => {
    try {
        const { identityId, password, minimumAge } = req.body;

        if (!identityId || !password || typeof minimumAge !== 'number') {
            return res.status(400).json({
                success: false,
                error: 'Missing required fields or invalid minimum age'
            });
        }

        // Generate age proof
        const proof = await req.app.locals.identityManager.generateAgeProof(
            identityId,
            password,
            minimumAge
        );

        res.json({
            success: true,
            message: 'Age proof generated successfully',
            data: proof
        });
    } catch (error) {
        console.error('Error generating age proof:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to generate age proof',
            details: error.message
        });
    }
});

/**
 * @route PUT /api/identity/:identityId
 * @desc Update identity data (privacy-preserving)
 * @access Public
 */
router.put('/:identityId', async (req, res) => {
    try {
        const { identityId } = req.params;
        const { password, newData } = req.body;

        if (!password || !newData) {
            return res.status(400).json({
                success: false,
                error: 'Password and new data are required'
            });
        }

        // Update identity
        const result = await req.app.locals.identityManager.updateIdentity(
            identityId,
            password,
            newData
        );

        // Update on blockchain if available
        if (req.app.locals.blockchainService) {
            try {
                // Note: In real implementation, you'd need the new merkle root
                await req.app.locals.blockchainService.updateIdentity(
                    result.identityCommitment,
                    '0x' + '0'.repeat(64) // placeholder merkle root
                );
            } catch (blockchainError) {
                console.warn('Blockchain update failed:', blockchainError.message);
            }
        }

        res.json({
            success: true,
            message: 'Identity updated successfully',
            data: result
        });
    } catch (error) {
        console.error('Error updating identity:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to update identity',
            details: error.message
        });
    }
});

/**
 * @route GET /api/identity/credentials/:credentialId
 * @desc Get credential information
 * @access Public
 */
router.get('/credentials/:credentialId', async (req, res) => {
    try {
        const { credentialId } = req.params;

        const credential = req.app.locals.identityManager.getCredentialInfo(credentialId);

        if (!credential) {
            return res.status(404).json({
                success: false,
                error: 'Credential not found'
            });
        }

        res.json({
            success: true,
            data: credential
        });
    } catch (error) {
        console.error('Error retrieving credential:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to retrieve credential',
            details: error.message
        });
    }
});

/**
 * @route POST /api/identity/credentials/:credentialId/revoke
 * @desc Revoke a credential
 * @access Public
 */
router.post('/credentials/:credentialId/revoke', async (req, res) => {
    try {
        const { credentialId } = req.params;
        const { issuerAddress } = req.body;

        if (!issuerAddress) {
            return res.status(400).json({
                success: false,
                error: 'Issuer address is required'
            });
        }

        // Revoke credential
        await req.app.locals.identityManager.revokeCredential(
            credentialId,
            issuerAddress
        );

        res.json({
            success: true,
            message: 'Credential revoked successfully'
        });
    } catch (error) {
        console.error('Error revoking credential:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to revoke credential',
            details: error.message
        });
    }
});

/**
 * @route GET /api/identity
 * @desc Get all identities (admin function)
 * @access Admin
 */
router.get('/', async (req, res) => {
    try {
        // In production, add proper authentication/authorization
        const identities = req.app.locals.identityManager.getAllIdentities();

        res.json({
            success: true,
            data: {
                identities,
                count: identities.length
            }
        });
    } catch (error) {
        console.error('Error retrieving identities:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to retrieve identities',
            details: error.message
        });
    }
});

module.exports = router;