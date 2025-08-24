const { ethers } = require('ethers');
const { v4: uuidv4 } = require('uuid');
const EncryptionManager = require('../crypto/encryption');
const ZKProofManager = require('../crypto/zkProof');
const IPFSManager = require('../utils/ipfs');
const IdentityRegistryABI = require('../../build/contracts/IdentityRegistry.json');
const ZKVerifierABI = require('../../build/contracts/ZKVerifier.json');

class IdentityManager {
  constructor(config) {
    this.provider = new ethers.providers.JsonRpcProvider(config.rpcUrl);
    this.encryption = new EncryptionManager();
    this.zkProof = new ZKProofManager();
    this.ipfs = new IPFSManager(config.ipfs);
    
    // Contract instances will be initialized when addresses are set
    this.identityRegistry = null;
    this.zkVerifier = null;
    
    this.config = config;
  }

  /**
   * Initialize contract instances
   * @param {string} identityRegistryAddress - Address of identity registry contract
   * @param {string} zkVerifierAddress - Address of ZK verifier contract
   */
  async initialize(identityRegistryAddress, zkVerifierAddress) {
    this.identityRegistry = new ethers.Contract(
      identityRegistryAddress,
      IdentityRegistryABI.abi,
      this.provider
    );
    
    this.zkVerifier = new ethers.Contract(
      zkVerifierAddress,
      ZKVerifierABI.abi,
      this.provider
    );
  }

  /**
   * Create a new decentralized identity
   * @param {Object} identityData - Identity information
   * @param {string} password - User's password for encryption
   * @param {Object} signer - Ethereum signer
   * @returns {Object} Created identity with DID
   */
  async createIdentity(identityData, password, signer) {
    try {
      // Generate DID
      const did = this.generateDID(await signer.getAddress());
      
      // Generate encryption key
      const masterKey = this.encryption.generateKey();
      
      // Encrypt identity data
      const encryptedData = this.encryption.encrypt(identityData, masterKey);
      
      // Store encrypted data on IPFS
      const ipfsHash = await this.ipfs.uploadData(encryptedData);
      
      // Encrypt master key with password
      const encryptedKey = this.encryption.encryptWithPassword(masterKey, password);
      
      // Create identity on blockchain
      const contract = this.identityRegistry.connect(signer);
      const tx = await contract.createIdentity(
        ethers.utils.formatBytes32String(did),
        ipfsHash
      );
      await tx.wait();
      
      return {
        did,
        ipfsHash,
        encryptedKey,
        address: await signer.getAddress(),
        createdAt: new Date().toISOString()
      };
    } catch (error) {
      throw new Error(`Failed to create identity: ${error.message}`);
    }
  }

  /**
   * Update identity data
   * @param {string} did - Decentralized identifier
   * @param {Object} newData - New identity data
   * @param {string} masterKey - Decryption key
   * @param {Object} signer - Ethereum signer
   * @returns {Object} Update result
   */
  async updateIdentity(did, newData, masterKey, signer) {
    try {
      // Encrypt new data
      const encryptedData = this.encryption.encrypt(newData, masterKey);
      
      // Upload to IPFS
      const ipfsHash = await this.ipfs.uploadData(encryptedData);
      
      // Update on blockchain
      const contract = this.identityRegistry.connect(signer);
      const tx = await contract.updateIdentity(
        ethers.utils.formatBytes32String(did),
        ipfsHash
      );
      await tx.wait();
      
      return {
        did,
        ipfsHash,
        updatedAt: new Date().toISOString()
      };
    } catch (error) {
      throw new Error(`Failed to update identity: ${error.message}`);
    }
  }

  /**
   * Issue a verifiable credential
   * @param {Object} credential - Credential data
   * @param {string} holderDID - DID of credential holder
   * @param {Object} issuerSigner - Issuer's signer
   * @returns {Object} Issued credential
   */
  async issueCredential(credential, holderDID, issuerSigner) {
    try {
      // Add metadata
      const fullCredential = {
        '@context': ['https://www.w3.org/2018/credentials/v1'],
        type: ['VerifiableCredential', credential.type],
        issuer: await issuerSigner.getAddress(),
        issuanceDate: new Date().toISOString(),
        expirationDate: credential.expirationDate || this._getDefaultExpiration(),
        credentialSubject: {
          id: holderDID,
          ...credential.subject
        }
      };
      
      // Generate credential hash
      const credentialHash = this.encryption.hash(fullCredential);
      
      // Encrypt credential
      const encryptedCredential = this.encryption.encrypt(
        fullCredential,
        this.encryption.generateKey()
      );
      
      // Store on IPFS
      const ipfsHash = await this.ipfs.uploadData(encryptedCredential);
      
      // Issue on blockchain
      const contract = this.identityRegistry.connect(issuerSigner);
      const tx = await contract.issueCredential(
        ethers.utils.formatBytes32String(holderDID),
        ethers.utils.formatBytes32String(credentialHash),
        Math.floor(new Date(fullCredential.expirationDate).getTime() / 1000),
        ipfsHash
      );
      await tx.wait();
      
      return {
        credential: fullCredential,
        credentialHash,
        ipfsHash,
        issuedAt: fullCredential.issuanceDate
      };
    } catch (error) {
      throw new Error(`Failed to issue credential: ${error.message}`);
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
      const result = await this.identityRegistry.verifyCredential(
        ethers.utils.formatBytes32String(did),
        ethers.utils.formatBytes32String(credentialHash)
      );
      
      return {
        isValid: result.isValid,
        issuer: result.issuer,
        expiresAt: new Date(result.expiresAt.toNumber() * 1000).toISOString()
      };
    } catch (error) {
      throw new Error(`Failed to verify credential: ${error.message}`);
    }
  }

  /**
   * Create a verifiable presentation with selective disclosure
   * @param {Array} credentials - Credentials to include
   * @param {Array} disclosedFields - Fields to disclose per credential
   * @param {string} holderSecret - Holder's secret key
   * @returns {Object} Verifiable presentation
   */
  async createPresentation(credentials, disclosedFields, holderSecret) {
    try {
      const presentation = {
        '@context': ['https://www.w3.org/2018/credentials/v1'],
        type: 'VerifiablePresentation',
        verifiableCredential: [],
        proof: []
      };
      
      for (let i = 0; i < credentials.length; i++) {
        const credential = credentials[i];
        const fieldsToDisclose = disclosedFields[i];
        
        // Generate selective disclosure proof
        const sdProof = await this.zkProof.generateSelectiveDisclosureProof(
          credential.credentialSubject,
          fieldsToDisclose,
          holderSecret
        );
        
        // Add to presentation
        presentation.verifiableCredential.push({
          credentialHash: this.encryption.hash(credential),
          disclosedAttributes: sdProof.disclosedAttributes,
          commitment: sdProof.commitment
        });
        
        presentation.proof.push(sdProof.proof);
      }
      
      return presentation;
    } catch (error) {
      throw new Error(`Failed to create presentation: ${error.message}`);
    }
  }

  /**
   * Verify a verifiable presentation
   * @param {Object} presentation - Presentation to verify
   * @returns {Object} Verification result
   */
  async verifyPresentation(presentation) {
    try {
      const results = [];
      
      for (let i = 0; i < presentation.verifiableCredential.length; i++) {
        const vc = presentation.verifiableCredential[i];
        const proof = presentation.proof[i];
        
        // Verify ZK proof
        const proofValid = await this.zkProof.verifyProof(
          proof,
          [...vc.disclosedAttributes, vc.commitment],
          'selectiveDisclosure'
        );
        
        results.push({
          credentialHash: vc.credentialHash,
          proofValid,
          disclosedAttributes: vc.disclosedAttributes
        });
      }
      
      return {
        valid: results.every(r => r.proofValid),
        results
      };
    } catch (error) {
      throw new Error(`Failed to verify presentation: ${error.message}`);
    }
  }

  /**
   * Generate age proof without revealing actual age
   * @param {number} age - User's age
   * @param {number} minAge - Minimum age requirement
   * @returns {Object} Age proof
   */
  async generateAgeProof(age, minAge) {
    return await this.zkProof.generateAgeProof(age, minAge);
  }

  /**
   * Verify age proof
   * @param {Object} proof - Age proof
   * @param {number} minAge - Minimum age requirement
   * @param {Object} signer - Signer for blockchain interaction
   * @returns {boolean} Verification result
   */
  async verifyAgeProof(proof, minAge, signer) {
    try {
      const contract = this.zkVerifier.connect(signer);
      const tx = await contract.verifyAgeProof(
        proof.pi_a,
        proof.pi_b,
        proof.pi_c,
        minAge
      );
      const receipt = await tx.wait();
      
      // Check event for verification result
      const event = receipt.events.find(e => e.event === 'ProofVerified');
      return !!event;
    } catch (error) {
      throw new Error(`Failed to verify age proof: ${error.message}`);
    }
  }

  /**
   * Add a controller to an identity
   * @param {string} did - DID
   * @param {string} controllerAddress - Controller's address
   * @param {Object} ownerSigner - Owner's signer
   * @returns {Object} Transaction result
   */
  async addController(did, controllerAddress, ownerSigner) {
    try {
      const contract = this.identityRegistry.connect(ownerSigner);
      const tx = await contract.addController(
        ethers.utils.formatBytes32String(did),
        controllerAddress
      );
      await tx.wait();
      
      return {
        did,
        controller: controllerAddress,
        addedAt: new Date().toISOString()
      };
    } catch (error) {
      throw new Error(`Failed to add controller: ${error.message}`);
    }
  }

  /**
   * Revoke an identity
   * @param {string} did - DID to revoke
   * @param {Object} ownerSigner - Owner's signer
   * @returns {Object} Revocation result
   */
  async revokeIdentity(did, ownerSigner) {
    try {
      const contract = this.identityRegistry.connect(ownerSigner);
      const tx = await contract.revokeIdentity(
        ethers.utils.formatBytes32String(did)
      );
      await tx.wait();
      
      return {
        did,
        revokedAt: new Date().toISOString()
      };
    } catch (error) {
      throw new Error(`Failed to revoke identity: ${error.message}`);
    }
  }

  /**
   * Generate a DID
   * @param {string} address - Ethereum address
   * @returns {string} Generated DID
   */
  generateDID(address) {
    const method = 'ethr';
    const network = this.config.network || 'mainnet';
    return `did:${method}:${network}:${address}`;
  }

  /**
   * Resolve a DID to get identity information
   * @param {string} did - DID to resolve
   * @returns {Object} Identity information
   */
  async resolveDID(did) {
    try {
      const didBytes32 = ethers.utils.formatBytes32String(did);
      const identity = await this.identityRegistry.getIdentity(didBytes32);
      
      return {
        did,
        owner: identity.owner,
        active: identity.active,
        createdAt: new Date(identity.createdAt.toNumber() * 1000).toISOString(),
        updatedAt: new Date(identity.updatedAt.toNumber() * 1000).toISOString(),
        ipfsHash: identity.ipfsHash
      };
    } catch (error) {
      throw new Error(`Failed to resolve DID: ${error.message}`);
    }
  }

  /**
   * Get default credential expiration (1 year from now)
   * @returns {string} ISO date string
   */
  _getDefaultExpiration() {
    const date = new Date();
    date.setFullYear(date.getFullYear() + 1);
    return date.toISOString();
  }
}

module.exports = IdentityManager;