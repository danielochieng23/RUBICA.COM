const axios = require('axios');
const { ethers } = require('ethers');
const IdentityManager = require('../identity/identityManager');
const DIDResolver = require('../identity/didResolver');
const EncryptionManager = require('../crypto/encryption');
const ZKProofManager = require('../crypto/zkProof');

/**
 * Digital ID Framework SDK
 * Provides easy-to-use methods for interacting with the digital identity system
 */
class DigitalIDSDK {
  constructor(config = {}) {
    this.apiUrl = config.apiUrl || 'http://localhost:3000';
    this.rpcUrl = config.rpcUrl || 'http://localhost:8545';
    this.network = config.network || 'development';
    
    // Initialize components
    this.provider = new ethers.providers.JsonRpcProvider(this.rpcUrl);
    this.encryption = new EncryptionManager();
    this.zkProof = new ZKProofManager();
    
    // API client configuration
    this.apiClient = axios.create({
      baseURL: this.apiUrl,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json'
      }
    });

    // Add auth token if provided
    if (config.authToken) {
      this.setAuthToken(config.authToken);
    }
  }

  /**
   * Set authentication token for API calls
   * @param {string} token - JWT token
   */
  setAuthToken(token) {
    this.apiClient.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  }

  /**
   * Generate a new wallet
   * @returns {Object} Wallet with address and private key
   */
  generateWallet() {
    const wallet = ethers.Wallet.createRandom();
    return {
      address: wallet.address,
      privateKey: wallet.privateKey,
      publicKey: wallet.publicKey,
      mnemonic: wallet.mnemonic?.phrase
    };
  }

  /**
   * Create a new digital identity
   * @param {Object} identityData - Identity information
   * @param {string} password - Password for encryption
   * @param {string} privateKey - Ethereum private key
   * @returns {Object} Created identity details
   */
  async createIdentity(identityData, password, privateKey) {
    try {
      const response = await this.apiClient.post('/identity/create', {
        identityData,
        password,
        privateKey
      });
      
      return response.data.data;
    } catch (error) {
      throw this._handleError(error);
    }
  }

  /**
   * Resolve a DID
   * @param {string} did - DID to resolve
   * @returns {Object} Identity information
   */
  async resolveDID(did) {
    try {
      const response = await this.apiClient.get(`/identity/resolve/${did}`);
      return response.data.data;
    } catch (error) {
      throw this._handleError(error);
    }
  }

  /**
   * Issue a verifiable credential
   * @param {Object} credential - Credential data
   * @param {string} holderDID - DID of credential holder
   * @param {string} issuerPrivateKey - Issuer's private key
   * @returns {Object} Issued credential
   */
  async issueCredential(credential, holderDID, issuerPrivateKey) {
    try {
      const response = await this.apiClient.post('/credential/issue', {
        credential,
        holderDID,
        issuerPrivateKey
      });
      
      return response.data.data;
    } catch (error) {
      throw this._handleError(error);
    }
  }

  /**
   * Verify a credential
   * @param {string} did - DID that owns the credential
   * @param {string} credentialHash - Hash of the credential
   * @returns {Object} Verification result
   */
  async verifyCredential(did, credentialHash) {
    try {
      const response = await this.apiClient.post('/credential/verify', {
        did,
        credentialHash
      });
      
      return response.data.data;
    } catch (error) {
      throw this._handleError(error);
    }
  }

  /**
   * Create a verifiable presentation with selective disclosure
   * @param {Array} credentials - Credentials to include
   * @param {Array} disclosedFields - Fields to disclose per credential
   * @param {string} holderSecret - Holder's secret
   * @returns {Object} Verifiable presentation
   */
  async createPresentation(credentials, disclosedFields, holderSecret) {
    try {
      const response = await this.apiClient.post('/presentation/create', {
        credentials,
        disclosedFields,
        holderSecret
      });
      
      return response.data.data;
    } catch (error) {
      throw this._handleError(error);
    }
  }

  /**
   * Verify a presentation
   * @param {Object} presentation - Presentation to verify
   * @returns {Object} Verification result
   */
  async verifyPresentation(presentation) {
    try {
      const response = await this.apiClient.post('/presentation/verify', {
        presentation
      });
      
      return response.data.data;
    } catch (error) {
      throw this._handleError(error);
    }
  }

  /**
   * Generate an age proof
   * @param {number} age - Actual age
   * @param {number} minAge - Minimum age requirement
   * @returns {Object} Age proof
   */
  async generateAgeProof(age, minAge) {
    try {
      const response = await this.apiClient.post('/proof/age/generate', {
        age,
        minAge
      });
      
      return response.data.data;
    } catch (error) {
      throw this._handleError(error);
    }
  }

  /**
   * Verify an age proof
   * @param {Object} proof - Age proof
   * @param {number} minAge - Minimum age requirement
   * @param {string} verifierPrivateKey - Verifier's private key
   * @returns {boolean} Verification result
   */
  async verifyAgeProof(proof, minAge, verifierPrivateKey) {
    try {
      const response = await this.apiClient.post('/proof/age/verify', {
        proof,
        minAge,
        verifierPrivateKey
      });
      
      return response.data.verified;
    } catch (error) {
      throw this._handleError(error);
    }
  }

  /**
   * Generate a new DID
   * @param {string} method - DID method (default: 'ethr')
   * @returns {Object} Generated DID and keys
   */
  async generateDID(method = 'ethr') {
    try {
      const response = await this.apiClient.post('/did/generate', {
        method,
        network: this.network
      });
      
      return response.data.data;
    } catch (error) {
      throw this._handleError(error);
    }
  }

  /**
   * Get available credential types
   * @returns {Array} List of credential types
   */
  async getCredentialTypes() {
    try {
      const response = await this.apiClient.get('/credential/types');
      return response.data.data;
    } catch (error) {
      throw this._handleError(error);
    }
  }

  /**
   * Add a controller to an identity
   * @param {string} did - DID
   * @param {string} controllerAddress - Controller's address
   * @param {string} ownerPrivateKey - Owner's private key
   * @returns {Object} Result
   */
  async addController(did, controllerAddress, ownerPrivateKey) {
    try {
      const response = await this.apiClient.post('/identity/controller/add', {
        did,
        controllerAddress,
        ownerPrivateKey
      });
      
      return response.data.data;
    } catch (error) {
      throw this._handleError(error);
    }
  }

  /**
   * Revoke an identity
   * @param {string} did - DID to revoke
   * @param {string} ownerPrivateKey - Owner's private key
   * @returns {Object} Revocation result
   */
  async revokeIdentity(did, ownerPrivateKey) {
    try {
      const response = await this.apiClient.post('/identity/revoke', {
        did,
        ownerPrivateKey
      });
      
      return response.data.data;
    } catch (error) {
      throw this._handleError(error);
    }
  }

  /**
   * Encrypt data locally
   * @param {Object} data - Data to encrypt
   * @param {string} password - Password for encryption
   * @returns {Object} Encrypted data
   */
  encryptData(data, password) {
    return this.encryption.encryptWithPassword(data, password);
  }

  /**
   * Decrypt data locally
   * @param {Object} encryptedData - Encrypted data
   * @param {string} password - Password for decryption
   * @returns {Object} Decrypted data
   */
  decryptData(encryptedData, password) {
    return this.encryption.decryptWithPassword(encryptedData, password);
  }

  /**
   * Generate a selective disclosure proof locally
   * @param {Object} attributes - All attributes
   * @param {Array} disclosedIndices - Indices to disclose
   * @param {string} salt - Random salt
   * @returns {Object} Selective disclosure proof
   */
  async generateSelectiveDisclosureProof(attributes, disclosedIndices, salt) {
    return await this.zkProof.generateSelectiveDisclosureProof(
      attributes,
      disclosedIndices,
      salt
    );
  }

  /**
   * Verify a proof locally
   * @param {Object} proof - Proof to verify
   * @param {Array} publicSignals - Public signals
   * @param {string} circuitType - Circuit type
   * @returns {boolean} Verification result
   */
  async verifyProofLocally(proof, publicSignals, circuitType) {
    return await this.zkProof.verifyProof(proof, publicSignals, circuitType);
  }

  /**
   * Sign a message with private key
   * @param {string} message - Message to sign
   * @param {string} privateKey - Private key
   * @returns {string} Signature
   */
  signMessage(message, privateKey) {
    const wallet = new ethers.Wallet(privateKey);
    return wallet.signMessage(message);
  }

  /**
   * Verify a message signature
   * @param {string} message - Original message
   * @param {string} signature - Signature to verify
   * @param {string} expectedAddress - Expected signer address
   * @returns {boolean} Verification result
   */
  verifySignature(message, signature, expectedAddress) {
    const recoveredAddress = ethers.utils.verifyMessage(message, signature);
    return recoveredAddress.toLowerCase() === expectedAddress.toLowerCase();
  }

  /**
   * Get provider instance
   * @returns {Object} Ethers provider
   */
  getProvider() {
    return this.provider;
  }

  /**
   * Create a signer from private key
   * @param {string} privateKey - Private key
   * @returns {Object} Ethers signer
   */
  getSigner(privateKey) {
    return new ethers.Wallet(privateKey, this.provider);
  }

  /**
   * Handle API errors
   * @param {Error} error - Error object
   * @returns {Error} Formatted error
   */
  _handleError(error) {
    if (error.response) {
      const message = error.response.data.error || error.response.data.message || 'API Error';
      const err = new Error(message);
      err.status = error.response.status;
      err.details = error.response.data.details;
      return err;
    }
    
    if (error.request) {
      return new Error('Network error: Unable to reach API');
    }
    
    return error;
  }
}

module.exports = DigitalIDSDK;