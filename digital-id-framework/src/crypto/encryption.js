const crypto = require('crypto');
const CryptoJS = require('crypto-js');

class EncryptionManager {
  constructor() {
    this.algorithm = 'aes-256-gcm';
    this.keyLength = 32; // 256 bits
    this.ivLength = 16; // 128 bits
    this.saltLength = 32; // 256 bits
    this.tagLength = 16; // 128 bits
    this.pbkdf2Iterations = 100000;
  }

  /**
   * Generate a random encryption key
   * @returns {string} Hex-encoded encryption key
   */
  generateKey() {
    return crypto.randomBytes(this.keyLength).toString('hex');
  }

  /**
   * Derive a key from a password using PBKDF2
   * @param {string} password - User password
   * @param {string} salt - Salt for key derivation
   * @returns {Buffer} Derived key
   */
  deriveKey(password, salt) {
    return crypto.pbkdf2Sync(
      password,
      salt,
      this.pbkdf2Iterations,
      this.keyLength,
      'sha256'
    );
  }

  /**
   * Encrypt data using AES-256-GCM
   * @param {Object|string} data - Data to encrypt
   * @param {string} key - Encryption key
   * @returns {Object} Encrypted data with metadata
   */
  encrypt(data, key) {
    try {
      // Convert data to string if object
      const plaintext = typeof data === 'object' ? JSON.stringify(data) : data;
      
      // Generate random IV
      const iv = crypto.randomBytes(this.ivLength);
      
      // Create cipher
      const cipher = crypto.createCipheriv(
        this.algorithm,
        Buffer.from(key, 'hex'),
        iv
      );
      
      // Encrypt data
      const encrypted = Buffer.concat([
        cipher.update(plaintext, 'utf8'),
        cipher.final()
      ]);
      
      // Get authentication tag
      const tag = cipher.getAuthTag();
      
      // Combine all components
      return {
        encrypted: encrypted.toString('base64'),
        iv: iv.toString('base64'),
        tag: tag.toString('base64'),
        algorithm: this.algorithm
      };
    } catch (error) {
      throw new Error(`Encryption failed: ${error.message}`);
    }
  }

  /**
   * Decrypt data using AES-256-GCM
   * @param {Object} encryptedData - Encrypted data object
   * @param {string} key - Decryption key
   * @returns {Object|string} Decrypted data
   */
  decrypt(encryptedData, key) {
    try {
      const { encrypted, iv, tag, algorithm } = encryptedData;
      
      // Create decipher
      const decipher = crypto.createDecipheriv(
        algorithm || this.algorithm,
        Buffer.from(key, 'hex'),
        Buffer.from(iv, 'base64')
      );
      
      // Set authentication tag
      decipher.setAuthTag(Buffer.from(tag, 'base64'));
      
      // Decrypt data
      const decrypted = Buffer.concat([
        decipher.update(Buffer.from(encrypted, 'base64')),
        decipher.final()
      ]);
      
      const plaintext = decrypted.toString('utf8');
      
      // Try to parse as JSON
      try {
        return JSON.parse(plaintext);
      } catch {
        return plaintext;
      }
    } catch (error) {
      throw new Error(`Decryption failed: ${error.message}`);
    }
  }

  /**
   * Encrypt data with password
   * @param {Object|string} data - Data to encrypt
   * @param {string} password - User password
   * @returns {Object} Encrypted data with salt
   */
  encryptWithPassword(data, password) {
    try {
      // Generate random salt
      const salt = crypto.randomBytes(this.saltLength);
      
      // Derive key from password
      const key = this.deriveKey(password, salt);
      
      // Encrypt data
      const encryptedData = this.encrypt(data, key.toString('hex'));
      
      return {
        ...encryptedData,
        salt: salt.toString('base64')
      };
    } catch (error) {
      throw new Error(`Password encryption failed: ${error.message}`);
    }
  }

  /**
   * Decrypt data with password
   * @param {Object} encryptedData - Encrypted data with salt
   * @param {string} password - User password
   * @returns {Object|string} Decrypted data
   */
  decryptWithPassword(encryptedData, password) {
    try {
      const { salt, ...encrypted } = encryptedData;
      
      // Derive key from password
      const key = this.deriveKey(password, Buffer.from(salt, 'base64'));
      
      // Decrypt data
      return this.decrypt(encrypted, key.toString('hex'));
    } catch (error) {
      throw new Error(`Password decryption failed: ${error.message}`);
    }
  }

  /**
   * Create a hash of data
   * @param {Object|string} data - Data to hash
   * @returns {string} SHA256 hash
   */
  hash(data) {
    const input = typeof data === 'object' ? JSON.stringify(data) : data;
    return crypto.createHash('sha256').update(input).digest('hex');
  }

  /**
   * Generate a random salt
   * @returns {string} Base64-encoded salt
   */
  generateSalt() {
    return crypto.randomBytes(this.saltLength).toString('base64');
  }

  /**
   * Create HMAC signature
   * @param {Object|string} data - Data to sign
   * @param {string} secret - HMAC secret
   * @returns {string} HMAC signature
   */
  createHMAC(data, secret) {
    const input = typeof data === 'object' ? JSON.stringify(data) : data;
    return crypto.createHmac('sha256', secret).update(input).digest('hex');
  }

  /**
   * Verify HMAC signature
   * @param {Object|string} data - Data to verify
   * @param {string} signature - HMAC signature
   * @param {string} secret - HMAC secret
   * @returns {boolean} Verification result
   */
  verifyHMAC(data, signature, secret) {
    const expectedSignature = this.createHMAC(data, secret);
    return crypto.timingSafeEqual(
      Buffer.from(signature, 'hex'),
      Buffer.from(expectedSignature, 'hex')
    );
  }

  /**
   * Encrypt field-level data for selective disclosure
   * @param {Object} fields - Object with field values
   * @param {string} masterKey - Master encryption key
   * @returns {Object} Object with encrypted fields
   */
  encryptFields(fields, masterKey) {
    const encryptedFields = {};
    
    for (const [key, value] of Object.entries(fields)) {
      // Derive field-specific key
      const fieldKey = this.deriveFieldKey(masterKey, key);
      
      // Encrypt field value
      encryptedFields[key] = this.encrypt(value, fieldKey);
    }
    
    return encryptedFields;
  }

  /**
   * Decrypt specific fields
   * @param {Object} encryptedFields - Object with encrypted fields
   * @param {Array} fieldNames - Fields to decrypt
   * @param {string} masterKey - Master decryption key
   * @returns {Object} Object with decrypted fields
   */
  decryptFields(encryptedFields, fieldNames, masterKey) {
    const decryptedFields = {};
    
    for (const fieldName of fieldNames) {
      if (encryptedFields[fieldName]) {
        // Derive field-specific key
        const fieldKey = this.deriveFieldKey(masterKey, fieldName);
        
        // Decrypt field value
        decryptedFields[fieldName] = this.decrypt(
          encryptedFields[fieldName],
          fieldKey
        );
      }
    }
    
    return decryptedFields;
  }

  /**
   * Derive a field-specific key from master key
   * @param {string} masterKey - Master key
   * @param {string} fieldName - Field name
   * @returns {string} Field-specific key
   */
  deriveFieldKey(masterKey, fieldName) {
    const hmac = crypto.createHmac('sha256', masterKey);
    hmac.update(fieldName);
    return hmac.digest('hex');
  }

  /**
   * Generate a secure random string
   * @param {number} length - Length of the string
   * @returns {string} Random string
   */
  generateRandomString(length = 32) {
    return crypto.randomBytes(length).toString('base64url');
  }

  /**
   * Create a deterministic encryption key from seed
   * @param {string} seed - Seed value
   * @param {string} context - Context for key derivation
   * @returns {string} Derived key
   */
  deriveKeyFromSeed(seed, context) {
    const salt = crypto.createHash('sha256').update(context).digest();
    return crypto.pbkdf2Sync(seed, salt, 10000, this.keyLength, 'sha256').toString('hex');
  }
}

module.exports = EncryptionManager;