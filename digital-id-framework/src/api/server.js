const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');
const { ethers } = require('ethers');
require('dotenv').config();

const IdentityManager = require('../identity/identityManager');
const DIDResolver = require('../identity/didResolver');
const { validateCredential, getCredentialTypes } = require('../identity/credentialSchemas');
const authMiddleware = require('./middleware/auth');
const errorHandler = require('./middleware/errorHandler');

const app = express();
const PORT = process.env.API_PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Initialize services
const config = {
  rpcUrl: process.env.BLOCKCHAIN_RPC_URL,
  network: process.env.NETWORK || 'development',
  ipfs: {
    host: process.env.IPFS_HOST,
    port: process.env.IPFS_PORT,
    protocol: process.env.IPFS_PROTOCOL
  },
  didRegistryAddress: process.env.DID_REGISTRY_ADDRESS
};

const identityManager = new IdentityManager(config);
const didResolver = new DIDResolver(config);

// Initialize contracts when server starts
async function initializeContracts() {
  if (process.env.CONTRACT_ADDRESS && process.env.ZK_VERIFIER_ADDRESS) {
    await identityManager.initialize(
      process.env.CONTRACT_ADDRESS,
      process.env.ZK_VERIFIER_ADDRESS
    );
  }
}

// Routes

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    version: '1.0.0',
    timestamp: new Date().toISOString()
  });
});

// Create new identity
app.post('/identity/create', async (req, res, next) => {
  try {
    const { identityData, password, privateKey } = req.body;
    
    if (!identityData || !password || !privateKey) {
      return res.status(400).json({ 
        error: 'Missing required fields: identityData, password, privateKey' 
      });
    }

    // Create signer from private key
    const signer = new ethers.Wallet(privateKey, identityManager.provider);
    
    // Create identity
    const result = await identityManager.createIdentity(
      identityData,
      password,
      signer
    );

    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    next(error);
  }
});

// Resolve DID
app.get('/identity/resolve/:did', async (req, res, next) => {
  try {
    const { did } = req.params;
    
    const identity = await identityManager.resolveDID(did);
    
    res.json({
      success: true,
      data: identity
    });
  } catch (error) {
    next(error);
  }
});

// Issue credential
app.post('/credential/issue', authMiddleware, async (req, res, next) => {
  try {
    const { credential, holderDID, issuerPrivateKey } = req.body;
    
    if (!credential || !holderDID || !issuerPrivateKey) {
      return res.status(400).json({ 
        error: 'Missing required fields: credential, holderDID, issuerPrivateKey' 
      });
    }

    // Validate credential schema
    const validation = validateCredential(credential.type, credential.subject);
    if (!validation.valid) {
      return res.status(400).json({
        error: 'Invalid credential data',
        details: validation.errors
      });
    }

    // Create issuer signer
    const issuerSigner = new ethers.Wallet(issuerPrivateKey, identityManager.provider);
    
    // Issue credential
    const result = await identityManager.issueCredential(
      credential,
      holderDID,
      issuerSigner
    );

    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    next(error);
  }
});

// Verify credential
app.post('/credential/verify', async (req, res, next) => {
  try {
    const { did, credentialHash } = req.body;
    
    if (!did || !credentialHash) {
      return res.status(400).json({ 
        error: 'Missing required fields: did, credentialHash' 
      });
    }

    const result = await identityManager.verifyCredential(did, credentialHash);
    
    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    next(error);
  }
});

// Create verifiable presentation
app.post('/presentation/create', authMiddleware, async (req, res, next) => {
  try {
    const { credentials, disclosedFields, holderSecret } = req.body;
    
    if (!credentials || !disclosedFields || !holderSecret) {
      return res.status(400).json({ 
        error: 'Missing required fields: credentials, disclosedFields, holderSecret' 
      });
    }

    const presentation = await identityManager.createPresentation(
      credentials,
      disclosedFields,
      holderSecret
    );

    res.json({
      success: true,
      data: presentation
    });
  } catch (error) {
    next(error);
  }
});

// Verify presentation
app.post('/presentation/verify', async (req, res, next) => {
  try {
    const { presentation } = req.body;
    
    if (!presentation) {
      return res.status(400).json({ 
        error: 'Missing required field: presentation' 
      });
    }

    const result = await identityManager.verifyPresentation(presentation);
    
    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    next(error);
  }
});

// Generate age proof
app.post('/proof/age/generate', authMiddleware, async (req, res, next) => {
  try {
    const { age, minAge } = req.body;
    
    if (age === undefined || minAge === undefined) {
      return res.status(400).json({ 
        error: 'Missing required fields: age, minAge' 
      });
    }

    const proof = await identityManager.generateAgeProof(age, minAge);
    
    res.json({
      success: true,
      data: proof
    });
  } catch (error) {
    next(error);
  }
});

// Verify age proof
app.post('/proof/age/verify', async (req, res, next) => {
  try {
    const { proof, minAge, verifierPrivateKey } = req.body;
    
    if (!proof || minAge === undefined || !verifierPrivateKey) {
      return res.status(400).json({ 
        error: 'Missing required fields: proof, minAge, verifierPrivateKey' 
      });
    }

    const signer = new ethers.Wallet(verifierPrivateKey, identityManager.provider);
    const result = await identityManager.verifyAgeProof(proof, minAge, signer);
    
    res.json({
      success: true,
      verified: result
    });
  } catch (error) {
    next(error);
  }
});

// DID operations
app.get('/did/resolve/:did', async (req, res, next) => {
  try {
    const { did } = req.params;
    
    const document = await didResolver.resolve(did);
    
    res.json({
      success: true,
      data: document
    });
  } catch (error) {
    next(error);
  }
});

app.post('/did/generate', async (req, res, next) => {
  try {
    const { method = 'ethr', network } = req.body;
    
    const result = await didResolver.generateDID(method, { network });
    
    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    next(error);
  }
});

// Get available credential types
app.get('/credential/types', (req, res) => {
  res.json({
    success: true,
    data: getCredentialTypes()
  });
});

// Add controller to identity
app.post('/identity/controller/add', authMiddleware, async (req, res, next) => {
  try {
    const { did, controllerAddress, ownerPrivateKey } = req.body;
    
    if (!did || !controllerAddress || !ownerPrivateKey) {
      return res.status(400).json({ 
        error: 'Missing required fields: did, controllerAddress, ownerPrivateKey' 
      });
    }

    const ownerSigner = new ethers.Wallet(ownerPrivateKey, identityManager.provider);
    const result = await identityManager.addController(did, controllerAddress, ownerSigner);
    
    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    next(error);
  }
});

// Revoke identity
app.post('/identity/revoke', authMiddleware, async (req, res, next) => {
  try {
    const { did, ownerPrivateKey } = req.body;
    
    if (!did || !ownerPrivateKey) {
      return res.status(400).json({ 
        error: 'Missing required fields: did, ownerPrivateKey' 
      });
    }

    const ownerSigner = new ethers.Wallet(ownerPrivateKey, identityManager.provider);
    const result = await identityManager.revokeIdentity(did, ownerSigner);
    
    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    next(error);
  }
});

// Error handling middleware
app.use(errorHandler);

// Start server
async function startServer() {
  try {
    await initializeContracts();
    
    app.listen(PORT, () => {
      console.log(`Digital ID API server running on port ${PORT}`);
      console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

// Export for testing
module.exports = { app, startServer };

// Start server if running directly
if (require.main === module) {
  startServer();
}