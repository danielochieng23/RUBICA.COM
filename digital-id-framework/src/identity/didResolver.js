const { Resolver } = require('did-resolver');
const { getResolver: getEthrResolver } = require('ethr-did-resolver');
const { ethers } = require('ethers');

class DIDResolver {
  constructor(config) {
    this.provider = new ethers.providers.JsonRpcProvider(config.rpcUrl);
    this.registry = config.didRegistryAddress;
    
    // Configure resolver with Ethereum DID method
    const ethrResolverConfig = {
      networks: [
        {
          name: config.network || 'mainnet',
          provider: this.provider,
          registry: this.registry
        }
      ]
    };
    
    // Create resolver instance
    this.resolver = new Resolver({
      ...getEthrResolver(ethrResolverConfig),
      // Add more DID methods here as needed
    });
  }

  /**
   * Resolve a DID to its DID Document
   * @param {string} did - DID to resolve
   * @returns {Object} DID Document
   */
  async resolve(did) {
    try {
      const result = await this.resolver.resolve(did);
      
      if (result.didResolutionMetadata.error) {
        throw new Error(result.didResolutionMetadata.error);
      }
      
      return result.didDocument;
    } catch (error) {
      throw new Error(`Failed to resolve DID: ${error.message}`);
    }
  }

  /**
   * Create a DID Document
   * @param {string} did - DID identifier
   * @param {Object} options - Document options
   * @returns {Object} DID Document
   */
  createDocument(did, options = {}) {
    const { 
      publicKey, 
      authentication, 
      service,
      controller,
      alsoKnownAs
    } = options;

    const document = {
      '@context': [
        'https://www.w3.org/ns/did/v1',
        'https://w3id.org/security/suites/ed25519-2020/v1'
      ],
      id: did,
      created: new Date().toISOString(),
      updated: new Date().toISOString()
    };

    // Add controller if specified
    if (controller) {
      document.controller = controller;
    }

    // Add also known as
    if (alsoKnownAs) {
      document.alsoKnownAs = alsoKnownAs;
    }

    // Add verification methods (public keys)
    if (publicKey) {
      document.verificationMethod = publicKey.map((key, index) => ({
        id: `${did}#key-${index + 1}`,
        type: key.type || 'EcdsaSecp256k1VerificationKey2019',
        controller: did,
        publicKeyBase58: key.publicKeyBase58,
        publicKeyJwk: key.publicKeyJwk,
        publicKeyHex: key.publicKeyHex
      }));
    }

    // Add authentication methods
    if (authentication) {
      document.authentication = authentication.map(auth => 
        typeof auth === 'string' ? auth : `${did}#key-${auth}`
      );
    }

    // Add service endpoints
    if (service) {
      document.service = service.map((srv, index) => ({
        id: `${did}#service-${index + 1}`,
        type: srv.type,
        serviceEndpoint: srv.endpoint,
        description: srv.description
      }));
    }

    return document;
  }

  /**
   * Verify a DID is active and valid
   * @param {string} did - DID to verify
   * @returns {Object} Verification result
   */
  async verify(did) {
    try {
      const document = await this.resolve(did);
      
      return {
        valid: true,
        did,
        document,
        metadata: {
          created: document.created,
          updated: document.updated,
          deactivated: document.deactivated || false
        }
      };
    } catch (error) {
      return {
        valid: false,
        did,
        error: error.message
      };
    }
  }

  /**
   * Get authentication methods from DID Document
   * @param {string} did - DID to query
   * @returns {Array} Authentication methods
   */
  async getAuthenticationMethods(did) {
    try {
      const document = await this.resolve(did);
      return document.authentication || [];
    } catch (error) {
      throw new Error(`Failed to get authentication methods: ${error.message}`);
    }
  }

  /**
   * Get service endpoints from DID Document
   * @param {string} did - DID to query
   * @param {string} type - Optional service type filter
   * @returns {Array} Service endpoints
   */
  async getServices(did, type = null) {
    try {
      const document = await this.resolve(did);
      const services = document.service || [];
      
      if (type) {
        return services.filter(s => s.type === type);
      }
      
      return services;
    } catch (error) {
      throw new Error(`Failed to get services: ${error.message}`);
    }
  }

  /**
   * Get verification methods from DID Document
   * @param {string} did - DID to query
   * @returns {Array} Verification methods
   */
  async getVerificationMethods(did) {
    try {
      const document = await this.resolve(did);
      return document.verificationMethod || [];
    } catch (error) {
      throw new Error(`Failed to get verification methods: ${error.message}`);
    }
  }

  /**
   * Check if a DID controls another DID
   * @param {string} controllerDid - Controller DID
   * @param {string} subjectDid - Subject DID
   * @returns {boolean} Control status
   */
  async checkControl(controllerDid, subjectDid) {
    try {
      const document = await this.resolve(subjectDid);
      
      if (!document.controller) {
        return false;
      }
      
      const controllers = Array.isArray(document.controller) 
        ? document.controller 
        : [document.controller];
      
      return controllers.includes(controllerDid);
    } catch (error) {
      throw new Error(`Failed to check control: ${error.message}`);
    }
  }

  /**
   * Parse DID components
   * @param {string} did - DID to parse
   * @returns {Object} Parsed components
   */
  parseDID(did) {
    const regex = /^did:([^:]+):(.+)$/;
    const match = did.match(regex);
    
    if (!match) {
      throw new Error('Invalid DID format');
    }
    
    const [, method, identifier] = match;
    
    // Further parse identifier for network-specific DIDs
    const parts = identifier.split(':');
    const network = parts.length > 1 ? parts[0] : null;
    const address = parts.length > 1 ? parts[1] : parts[0];
    
    return {
      did,
      method,
      network,
      address,
      identifier
    };
  }

  /**
   * Validate DID format
   * @param {string} did - DID to validate
   * @returns {boolean} Validation result
   */
  isValidDID(did) {
    try {
      this.parseDID(did);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Generate a new DID
   * @param {string} method - DID method (e.g., 'ethr', 'key')
   * @param {Object} options - Generation options
   * @returns {Object} Generated DID and keys
   */
  async generateDID(method = 'ethr', options = {}) {
    switch (method) {
      case 'ethr': {
        const wallet = ethers.Wallet.createRandom();
        const network = options.network || 'mainnet';
        const did = `did:ethr:${network}:${wallet.address}`;
        
        return {
          did,
          address: wallet.address,
          privateKey: wallet.privateKey,
          publicKey: wallet.publicKey
        };
      }
      
      case 'key': {
        // did:key method using Ed25519
        const wallet = ethers.Wallet.createRandom();
        const publicKeyBase58 = Buffer.from(wallet.publicKey).toString('base64');
        const did = `did:key:z${publicKeyBase58}`;
        
        return {
          did,
          privateKey: wallet.privateKey,
          publicKey: wallet.publicKey,
          publicKeyBase58
        };
      }
      
      default:
        throw new Error(`Unsupported DID method: ${method}`);
    }
  }
}

module.exports = DIDResolver;