const crypto = require('crypto');
const elliptic = require('elliptic');
const { keccak256 } = require('js-sha3');
const EC = elliptic.ec;

/**
 * Cryptographic Key Manager for Privacy-Preserving Digital Identity
 */
class KeyManager {
    constructor() {
        this.ec = new EC('secp256k1');
        this.algorithm = 'aes-256-gcm';
    }

    /**
     * Generate a new key pair
     * @returns {Object} Key pair with private and public keys
     */
    generateKeyPair() {
        const keyPair = this.ec.genKeyPair();
        return {
            privateKey: keyPair.getPrivate('hex'),
            publicKey: keyPair.getPublic('hex'),
            address: this.deriveAddress(keyPair.getPublic('hex'))
        };
    }

    /**
     * Derive Ethereum-style address from public key
     * @param {string} publicKey Public key in hex format
     * @returns {string} Ethereum address
     */
    deriveAddress(publicKey) {
        const pubKey = publicKey.startsWith('04') ? publicKey.slice(2) : publicKey;
        const hash = keccak256(Buffer.from(pubKey, 'hex'));
        return '0x' + hash.slice(-40);
    }

    /**
     * Sign a message with private key
     * @param {string} message Message to sign
     * @param {string} privateKey Private key in hex format
     * @returns {Object} Signature object
     */
    signMessage(message, privateKey) {
        const keyPair = this.ec.keyFromPrivate(privateKey, 'hex');
        const msgHash = keccak256(message);
        const signature = keyPair.sign(msgHash);
        
        return {
            r: signature.r.toString('hex'),
            s: signature.s.toString('hex'),
            v: signature.recoveryParam
        };
    }

    /**
     * Verify a signature
     * @param {string} message Original message
     * @param {Object} signature Signature object
     * @param {string} publicKey Public key in hex format
     * @returns {boolean} Verification result
     */
    verifySignature(message, signature, publicKey) {
        try {
            const keyPair = this.ec.keyFromPublic(publicKey, 'hex');
            const msgHash = keccak256(message);
            return keyPair.verify(msgHash, signature);
        } catch (error) {
            return false;
        }
    }

    /**
     * Generate a commitment to data using Pedersen commitment scheme
     * @param {string} data Data to commit to
     * @param {string} randomness Random value for commitment
     * @returns {string} Commitment hash
     */
    generateCommitment(data, randomness) {
        const commitment = keccak256(data + randomness);
        return '0x' + commitment;
    }

    /**
     * Generate a nullifier for zero-knowledge proofs
     * @param {string} secret Secret value
     * @param {string} identifier Unique identifier
     * @returns {string} Nullifier hash
     */
    generateNullifier(secret, identifier) {
        const nullifier = keccak256(secret + identifier);
        return '0x' + nullifier;
    }

    /**
     * Encrypt data using AES-256-GCM
     * @param {string} data Data to encrypt
     * @param {string} key Encryption key
     * @returns {Object} Encrypted data with IV and auth tag
     */
    encryptData(data, key) {
        const iv = crypto.randomBytes(16);
        const cipher = crypto.createCipher(this.algorithm, key);
        cipher.setAAD(Buffer.from('identity-data'));
        
        let encrypted = cipher.update(data, 'utf8', 'hex');
        encrypted += cipher.final('hex');
        
        const authTag = cipher.getAuthTag();
        
        return {
            encrypted,
            iv: iv.toString('hex'),
            authTag: authTag.toString('hex')
        };
    }

    /**
     * Decrypt data using AES-256-GCM
     * @param {Object} encryptedData Encrypted data object
     * @param {string} key Decryption key
     * @returns {string} Decrypted data
     */
    decryptData(encryptedData, key) {
        try {
            const decipher = crypto.createDecipher(this.algorithm, key);
            decipher.setAAD(Buffer.from('identity-data'));
            decipher.setAuthTag(Buffer.from(encryptedData.authTag, 'hex'));
            
            let decrypted = decipher.update(encryptedData.encrypted, 'hex', 'utf8');
            decrypted += decipher.final('utf8');
            
            return decrypted;
        } catch (error) {
            throw new Error('Decryption failed: ' + error.message);
        }
    }

    /**
     * Generate a secure random salt
     * @param {number} length Salt length in bytes
     * @returns {string} Random salt in hex format
     */
    generateSalt(length = 32) {
        return crypto.randomBytes(length).toString('hex');
    }

    /**
     * Derive key from password using PBKDF2
     * @param {string} password Password
     * @param {string} salt Salt value
     * @param {number} iterations Number of iterations
     * @returns {string} Derived key
     */
    deriveKey(password, salt, iterations = 100000) {
        return crypto.pbkdf2Sync(password, salt, iterations, 32, 'sha256').toString('hex');
    }

    /**
     * Generate a Merkle tree root from credential hashes
     * @param {Array} credentialHashes Array of credential hashes
     * @returns {string} Merkle root hash
     */
    generateMerkleRoot(credentialHashes) {
        if (credentialHashes.length === 0) {
            return '0x' + '0'.repeat(64);
        }

        let currentLevel = credentialHashes.map(hash => 
            hash.startsWith('0x') ? hash.slice(2) : hash
        );

        while (currentLevel.length > 1) {
            const nextLevel = [];
            for (let i = 0; i < currentLevel.length; i += 2) {
                const left = currentLevel[i];
                const right = i + 1 < currentLevel.length ? currentLevel[i + 1] : left;
                const combined = keccak256(left + right);
                nextLevel.push(combined);
            }
            currentLevel = nextLevel;
        }

        return '0x' + currentLevel[0];
    }

    /**
     * Generate Merkle proof for a credential
     * @param {Array} credentialHashes Array of all credential hashes
     * @param {number} index Index of the credential to prove
     * @returns {Array} Merkle proof array
     */
    generateMerkleProof(credentialHashes, index) {
        if (index >= credentialHashes.length) {
            throw new Error('Index out of bounds');
        }

        const proof = [];
        let currentIndex = index;
        let currentLevel = credentialHashes.map(hash => 
            hash.startsWith('0x') ? hash.slice(2) : hash
        );

        while (currentLevel.length > 1) {
            const isEven = currentIndex % 2 === 0;
            const siblingIndex = isEven ? currentIndex + 1 : currentIndex - 1;
            
            if (siblingIndex < currentLevel.length) {
                proof.push('0x' + currentLevel[siblingIndex]);
            }

            const nextLevel = [];
            for (let i = 0; i < currentLevel.length; i += 2) {
                const left = currentLevel[i];
                const right = i + 1 < currentLevel.length ? currentLevel[i + 1] : left;
                const combined = keccak256(left + right);
                nextLevel.push(combined);
            }

            currentLevel = nextLevel;
            currentIndex = Math.floor(currentIndex / 2);
        }

        return proof;
    }

    /**
     * Hash function using Keccak-256
     * @param {string} data Data to hash
     * @returns {string} Hash in hex format with 0x prefix
     */
    hash(data) {
        return '0x' + keccak256(data);
    }

    /**
     * Generate identity commitment from personal data
     * @param {Object} personalData Personal data object
     * @param {string} randomness Random value for commitment
     * @returns {string} Identity commitment hash
     */
    generateIdentityCommitment(personalData, randomness) {
        const dataString = JSON.stringify(personalData);
        return this.generateCommitment(dataString, randomness);
    }

    /**
     * Verify Merkle proof
     * @param {string} leaf Leaf hash to verify
     * @param {Array} proof Merkle proof array
     * @param {string} root Expected Merkle root
     * @returns {boolean} Verification result
     */
    verifyMerkleProof(leaf, proof, root) {
        let computedHash = leaf.startsWith('0x') ? leaf.slice(2) : leaf;
        
        for (const proofElement of proof) {
            const element = proofElement.startsWith('0x') ? proofElement.slice(2) : proofElement;
            
            // Determine order based on hash comparison
            if (computedHash <= element) {
                computedHash = keccak256(computedHash + element);
            } else {
                computedHash = keccak256(element + computedHash);
            }
        }
        
        const expectedRoot = root.startsWith('0x') ? root.slice(2) : root;
        return computedHash === expectedRoot;
    }
}

module.exports = KeyManager;