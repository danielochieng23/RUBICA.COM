const KeyManager = require('../crypto/keyManager');
const ZKProofSystem = require('../privacy/zkProofSystem');
const { v4: uuidv4 } = require('uuid');
const crypto = require('crypto');

/**
 * Privacy-Preserving Identity Manager
 */
class IdentityManager {
    constructor() {
        this.keyManager = new KeyManager();
        this.zkProofSystem = new ZKProofSystem();
        this.identities = new Map(); // In-memory storage (use database in production)
        this.credentials = new Map();
        this.revocationLists = new Map();
    }

    /**
     * Initialize the identity manager
     */
    async initialize() {
        try {
            await this.zkProofSystem.initialize();
            console.log('Identity Manager initialized successfully');
        } catch (error) {
            console.error('Failed to initialize Identity Manager:', error);
            throw error;
        }
    }

    /**
     * Create a new privacy-preserving digital identity
     * @param {Object} personalData Personal data (encrypted)
     * @param {string} password User password for key derivation
     * @returns {Object} Identity object with commitment and keys
     */
    async createIdentity(personalData, password) {
        try {
            // Generate identity ID
            const identityId = uuidv4();
            
            // Generate key pair for the identity
            const keyPair = this.keyManager.generateKeyPair();
            
            // Generate salt and derive encryption key from password
            const salt = this.keyManager.generateSalt();
            const encryptionKey = this.keyManager.deriveKey(password, salt);
            
            // Encrypt personal data
            const encryptedData = this.keyManager.encryptData(
                JSON.stringify(personalData),
                encryptionKey
            );
            
            // Generate randomness for commitment
            const randomness = this.keyManager.generateSalt();
            
            // Create identity commitment (doesn't reveal actual data)
            const identityCommitment = this.keyManager.generateIdentityCommitment(
                personalData,
                randomness
            );
            
            // Initialize empty credentials array
            const credentials = [];
            const credentialHashes = [];
            const merkleRoot = this.keyManager.generateMerkleRoot(credentialHashes);
            
            // Create identity object
            const identity = {
                id: identityId,
                address: keyPair.address,
                publicKey: keyPair.publicKey,
                identityCommitment,
                merkleRoot,
                encryptedData,
                salt,
                randomness,
                credentials: [],
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                isActive: true,
                isRevoked: false
            };
            
            // Store identity (in production, use secure database)
            this.identities.set(identityId, {
                ...identity,
                privateKey: keyPair.privateKey, // Store securely in production
                encryptionKey
            });
            
            // Return public identity information
            return {
                identityId,
                address: keyPair.address,
                publicKey: keyPair.publicKey,
                identityCommitment,
                merkleRoot
            };
        } catch (error) {
            console.error('Error creating identity:', error);
            throw error;
        }
    }

    /**
     * Authenticate user and return identity information
     * @param {string} identityId Identity ID
     * @param {string} password User password
     * @returns {Object} Identity information if authenticated
     */
    async authenticateIdentity(identityId, password) {
        try {
            const identity = this.identities.get(identityId);
            if (!identity) {
                throw new Error('Identity not found');
            }
            
            if (!identity.isActive || identity.isRevoked) {
                throw new Error('Identity is not active');
            }
            
            // Verify password by attempting to derive the same encryption key
            const derivedKey = this.keyManager.deriveKey(password, identity.salt);
            
            if (derivedKey !== identity.encryptionKey) {
                throw new Error('Invalid password');
            }
            
            // Return identity information (without private keys)
            return {
                id: identity.id,
                address: identity.address,
                publicKey: identity.publicKey,
                identityCommitment: identity.identityCommitment,
                merkleRoot: identity.merkleRoot,
                credentials: identity.credentials,
                createdAt: identity.createdAt,
                isActive: identity.isActive
            };
        } catch (error) {
            console.error('Error authenticating identity:', error);
            throw error;
        }
    }

    /**
     * Add a credential to an identity
     * @param {string} identityId Identity ID
     * @param {Object} credentialData Credential data
     * @param {string} issuerAddress Issuer's address
     * @returns {Object} Credential object
     */
    async addCredential(identityId, credentialData, issuerAddress) {
        try {
            const identity = this.identities.get(identityId);
            if (!identity) {
                throw new Error('Identity not found');
            }
            
            // Generate credential ID and hash
            const credentialId = uuidv4();
            const credentialHash = this.keyManager.hash(JSON.stringify({
                ...credentialData,
                id: credentialId,
                identityId,
                issuer: issuerAddress
            }));
            
            // Create credential object
            const credential = {
                id: credentialId,
                identityId,
                type: credentialData.type,
                issuer: issuerAddress,
                issuedAt: new Date().toISOString(),
                expiresAt: credentialData.expiresAt,
                data: credentialData,
                hash: credentialHash,
                isRevoked: false
            };
            
            // Add credential to identity
            identity.credentials.push(credential);
            
            // Update Merkle root with new credential
            const credentialHashes = identity.credentials.map(c => c.hash);
            identity.merkleRoot = this.keyManager.generateMerkleRoot(credentialHashes);
            identity.updatedAt = new Date().toISOString();
            
            // Store credential separately for quick lookup
            this.credentials.set(credentialId, credential);
            
            return credential;
        } catch (error) {
            console.error('Error adding credential:', error);
            throw error;
        }
    }

    /**
     * Generate a zero-knowledge proof for identity verification
     * @param {string} identityId Identity ID
     * @param {string} password User password
     * @param {Object} proofRequirements Requirements for the proof
     * @returns {Object} Zero-knowledge proof
     */
    async generateIdentityProof(identityId, password, proofRequirements) {
        try {
            const identity = this.identities.get(identityId);
            if (!identity) {
                throw new Error('Identity not found');
            }
            
            // Authenticate user
            const derivedKey = this.keyManager.deriveKey(password, identity.salt);
            if (derivedKey !== identity.encryptionKey) {
                throw new Error('Invalid password');
            }
            
            // Decrypt personal data
            const decryptedData = JSON.parse(
                this.keyManager.decryptData(identity.encryptedData, identity.encryptionKey)
            );
            
            // Prepare private inputs
            const privateInputs = {
                identityData: decryptedData,
                randomness: identity.randomness,
                nullifierSecret: this.keyManager.generateSalt()
            };
            
            // Prepare public inputs
            const nullifier = this.keyManager.generateNullifier(
                identity.id,
                proofRequirements.challenge || 'default'
            );
            
            const publicInputs = {
                identityCommitment: identity.identityCommitment,
                nullifier,
                merkleRoot: identity.merkleRoot,
                challenge: proofRequirements.challenge || 'default'
            };
            
            // Generate ZK proof
            return await this.zkProofSystem.generateIdentityProof(privateInputs, publicInputs);
        } catch (error) {
            console.error('Error generating identity proof:', error);
            throw error;
        }
    }

    /**
     * Generate a credential proof without revealing the credential
     * @param {string} identityId Identity ID
     * @param {string} password User password
     * @param {Object} requirements Credential requirements
     * @returns {Object} Zero-knowledge proof
     */
    async generateCredentialProof(identityId, password, requirements) {
        try {
            const identity = this.identities.get(identityId);
            if (!identity) {
                throw new Error('Identity not found');
            }
            
            // Authenticate user
            const derivedKey = this.keyManager.deriveKey(password, identity.salt);
            if (derivedKey !== identity.encryptionKey) {
                throw new Error('Invalid password');
            }
            
            // Generate membership proof using ZK system
            return await this.zkProofSystem.generateMembershipProof(
                identity.credentials,
                requirements
            );
        } catch (error) {
            console.error('Error generating credential proof:', error);
            throw error;
        }
    }

    /**
     * Generate age proof without revealing exact age
     * @param {string} identityId Identity ID
     * @param {string} password User password
     * @param {number} minimumAge Minimum required age
     * @returns {Object} Age proof
     */
    async generateAgeProof(identityId, password, minimumAge) {
        try {
            const identity = this.identities.get(identityId);
            if (!identity) {
                throw new Error('Identity not found');
            }
            
            // Authenticate user
            const derivedKey = this.keyManager.deriveKey(password, identity.salt);
            if (derivedKey !== identity.encryptionKey) {
                throw new Error('Invalid password');
            }
            
            // Decrypt personal data to get age
            const decryptedData = JSON.parse(
                this.keyManager.decryptData(identity.encryptedData, identity.encryptionKey)
            );
            
            if (!decryptedData.dateOfBirth) {
                throw new Error('Date of birth not found in identity data');
            }
            
            // Calculate age
            const birthDate = new Date(decryptedData.dateOfBirth);
            const today = new Date();
            const age = today.getFullYear() - birthDate.getFullYear();
            
            // Generate age proof
            return await this.zkProofSystem.generateAgeProof(
                age,
                minimumAge,
                identity.randomness
            );
        } catch (error) {
            console.error('Error generating age proof:', error);
            throw error;
        }
    }

    /**
     * Verify a zero-knowledge proof
     * @param {Object} proof Proof object
     * @param {Object} publicSignals Public signals
     * @returns {boolean} Verification result
     */
    async verifyProof(proof, publicSignals) {
        try {
            return await this.zkProofSystem.verifyProof(proof, publicSignals);
        } catch (error) {
            console.error('Error verifying proof:', error);
            return false;
        }
    }

    /**
     * Update identity data (privacy-preserving)
     * @param {string} identityId Identity ID
     * @param {string} password User password
     * @param {Object} newData New personal data
     * @returns {Object} Updated identity commitment
     */
    async updateIdentity(identityId, password, newData) {
        try {
            const identity = this.identities.get(identityId);
            if (!identity) {
                throw new Error('Identity not found');
            }
            
            // Authenticate user
            const derivedKey = this.keyManager.deriveKey(password, identity.salt);
            if (derivedKey !== identity.encryptionKey) {
                throw new Error('Invalid password');
            }
            
            // Encrypt new data
            const encryptedData = this.keyManager.encryptData(
                JSON.stringify(newData),
                identity.encryptionKey
            );
            
            // Generate new randomness and commitment
            const newRandomness = this.keyManager.generateSalt();
            const newCommitment = this.keyManager.generateIdentityCommitment(
                newData,
                newRandomness
            );
            
            // Update identity
            identity.encryptedData = encryptedData;
            identity.randomness = newRandomness;
            identity.identityCommitment = newCommitment;
            identity.updatedAt = new Date().toISOString();
            
            return {
                identityCommitment: newCommitment,
                updatedAt: identity.updatedAt
            };
        } catch (error) {
            console.error('Error updating identity:', error);
            throw error;
        }
    }

    /**
     * Revoke a credential
     * @param {string} credentialId Credential ID
     * @param {string} issuerAddress Issuer's address
     * @returns {boolean} Success status
     */
    async revokeCredential(credentialId, issuerAddress) {
        try {
            const credential = this.credentials.get(credentialId);
            if (!credential) {
                throw new Error('Credential not found');
            }
            
            if (credential.issuer !== issuerAddress) {
                throw new Error('Only issuer can revoke credential');
            }
            
            // Mark credential as revoked
            credential.isRevoked = true;
            credential.revokedAt = new Date().toISOString();
            
            // Update identity's credential list
            const identity = this.identities.get(credential.identityId);
            if (identity) {
                const credIndex = identity.credentials.findIndex(c => c.id === credentialId);
                if (credIndex !== -1) {
                    identity.credentials[credIndex].isRevoked = true;
                    identity.credentials[credIndex].revokedAt = credential.revokedAt;
                }
            }
            
            // Add to revocation list
            if (!this.revocationLists.has(issuerAddress)) {
                this.revocationLists.set(issuerAddress, new Set());
            }
            this.revocationLists.get(issuerAddress).add(credentialId);
            
            return true;
        } catch (error) {
            console.error('Error revoking credential:', error);
            throw error;
        }
    }

    /**
     * Check if a credential is revoked
     * @param {string} credentialId Credential ID
     * @param {string} issuerAddress Issuer's address
     * @returns {boolean} Revocation status
     */
    isCredentialRevoked(credentialId, issuerAddress) {
        const revocationList = this.revocationLists.get(issuerAddress);
        return revocationList ? revocationList.has(credentialId) : false;
    }

    /**
     * Get identity information by ID (public data only)
     * @param {string} identityId Identity ID
     * @returns {Object} Public identity information
     */
    getIdentityInfo(identityId) {
        const identity = this.identities.get(identityId);
        if (!identity) {
            return null;
        }
        
        return {
            id: identity.id,
            address: identity.address,
            publicKey: identity.publicKey,
            identityCommitment: identity.identityCommitment,
            merkleRoot: identity.merkleRoot,
            credentialsCount: identity.credentials.length,
            createdAt: identity.createdAt,
            isActive: identity.isActive,
            isRevoked: identity.isRevoked
        };
    }

    /**
     * Get credential information by ID
     * @param {string} credentialId Credential ID
     * @returns {Object} Credential information
     */
    getCredentialInfo(credentialId) {
        const credential = this.credentials.get(credentialId);
        if (!credential) {
            return null;
        }
        
        return {
            id: credential.id,
            type: credential.type,
            issuer: credential.issuer,
            issuedAt: credential.issuedAt,
            expiresAt: credential.expiresAt,
            hash: credential.hash,
            isRevoked: credential.isRevoked,
            revokedAt: credential.revokedAt
        };
    }

    /**
     * Generate Merkle proof for a credential
     * @param {string} identityId Identity ID
     * @param {string} credentialId Credential ID
     * @returns {Object} Merkle proof
     */
    generateCredentialMerkleProof(identityId, credentialId) {
        try {
            const identity = this.identities.get(identityId);
            if (!identity) {
                throw new Error('Identity not found');
            }
            
            const credentialIndex = identity.credentials.findIndex(c => c.id === credentialId);
            if (credentialIndex === -1) {
                throw new Error('Credential not found in identity');
            }
            
            const credentialHashes = identity.credentials.map(c => c.hash);
            const proof = this.keyManager.generateMerkleProof(credentialHashes, credentialIndex);
            
            return {
                proof,
                root: identity.merkleRoot,
                index: credentialIndex,
                credentialHash: identity.credentials[credentialIndex].hash
            };
        } catch (error) {
            console.error('Error generating Merkle proof:', error);
            throw error;
        }
    }

    /**
     * Get all identities (admin function)
     * @returns {Array} Array of identity information
     */
    getAllIdentities() {
        const identities = [];
        for (const [id, identity] of this.identities) {
            identities.push(this.getIdentityInfo(id));
        }
        return identities;
    }

    /**
     * Get all credentials (admin function)
     * @returns {Array} Array of credential information
     */
    getAllCredentials() {
        const credentials = [];
        for (const [id, credential] of this.credentials) {
            credentials.push(this.getCredentialInfo(id));
        }
        return credentials;
    }
}

module.exports = IdentityManager;