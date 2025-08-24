# Blockchain & Privacy-Preserving Digital ID Framework

A comprehensive decentralized identity solution built on blockchain technology with zero-knowledge proofs for privacy preservation.

## 🌟 Features

- **Decentralized Identity (DID)**: Self-sovereign identity management on blockchain
- **Zero-Knowledge Proofs**: Privacy-preserving credential verification
- **Verifiable Credentials**: Issue and verify credentials without revealing sensitive data
- **Selective Disclosure**: Share only necessary information
- **IPFS Integration**: Decentralized storage for encrypted identity data
- **Multi-signature Support**: Enhanced security with controller management
- **Standards Compliant**: W3C DID and Verifiable Credentials compatible

## 🏗️ Architecture

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│   React Client  │────▶│    REST API     │────▶│  Smart Contracts│
└─────────────────┘     └─────────────────┘     └─────────────────┘
         │                       │                        │
         │                       │                        │
         ▼                       ▼                        ▼
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│   Web3 Wallet   │     │      IPFS       │     │   Blockchain    │
└─────────────────┘     └─────────────────┘     └─────────────────┘
```

## 🚀 Quick Start

### Prerequisites

- Node.js v16+
- Docker (for local blockchain and IPFS)
- MetaMask or compatible Web3 wallet

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/digital-id-framework.git
cd digital-id-framework
```

2. Install dependencies:
```bash
npm install
cd client && npm install
cd ..
```

3. Set up environment variables:
```bash
cp .env.example .env
# Edit .env with your configuration
```

4. Start local blockchain (Ganache):
```bash
npx ganache-cli --deterministic
```

5. Deploy smart contracts:
```bash
npm run compile
npm run migrate
```

6. Start IPFS node:
```bash
docker run -d --name ipfs-node \
  -p 4001:4001 -p 5001:5001 -p 8080:8080 \
  ipfs/go-ipfs:latest
```

7. Start the API server:
```bash
npm start
```

8. Start the client application:
```bash
cd client
npm start
```

## 📖 Usage

### Creating a Digital Identity

```javascript
const DigitalIDSDK = require('./src/sdk');

const sdk = new DigitalIDSDK({
  apiUrl: 'http://localhost:3000',
  rpcUrl: 'http://localhost:8545'
});

// Generate new wallet
const wallet = sdk.generateWallet();

// Create identity
const identity = await sdk.createIdentity(
  {
    givenName: 'John',
    familyName: 'Doe',
    email: 'john@example.com',
    dateOfBirth: '1990-01-01'
  },
  'secure-password',
  wallet.privateKey
);

console.log('DID:', identity.did);
```

### Issuing a Credential

```javascript
// Issue educational credential
const credential = await sdk.issueCredential(
  {
    type: 'EducationalCredential',
    subject: {
      degree: 'Bachelor of Science',
      field: 'Computer Science',
      institution: 'Tech University',
      dateAwarded: '2023-06-15'
    }
  },
  holderDID,
  issuerPrivateKey
);
```

### Zero-Knowledge Age Verification

```javascript
// Generate age proof without revealing actual age
const ageProof = await sdk.generateAgeProof(25, 18);

// Verify age is over 18
const isOver18 = await sdk.verifyAgeProof(
  ageProof,
  18,
  verifierPrivateKey
);
```

### Selective Disclosure

```javascript
// Create presentation revealing only specific fields
const presentation = await sdk.createPresentation(
  [credential],
  [[0, 2]], // Only reveal degree and institution
  holderSecret
);

// Verify presentation
const result = await sdk.verifyPresentation(presentation);
```

## 🔒 Privacy Features

### Zero-Knowledge Proofs
- Age verification without revealing date of birth
- Credential ownership without exposing credential details
- Range proofs (e.g., salary > X without revealing exact amount)
- Set membership without revealing which member

### Encryption
- AES-256-GCM encryption for data at rest
- Field-level encryption for selective disclosure
- Password-based key derivation (PBKDF2)
- End-to-end encryption for credential exchange

## 📱 Client Application

The React-based client application provides:

- **Dashboard**: Overview of identity and credentials
- **Identity Creation**: Step-by-step identity setup
- **Credential Management**: Issue, view, and share credentials
- **Verification Portal**: Verify credentials and presentations
- **Privacy Controls**: Manage what information to share

## 🛠️ API Reference

### Identity Endpoints

- `POST /identity/create` - Create new identity
- `GET /identity/resolve/:did` - Resolve DID
- `POST /identity/revoke` - Revoke identity
- `POST /identity/controller/add` - Add controller

### Credential Endpoints

- `POST /credential/issue` - Issue credential
- `POST /credential/verify` - Verify credential
- `GET /credential/types` - Get available types

### Proof Endpoints

- `POST /proof/age/generate` - Generate age proof
- `POST /proof/age/verify` - Verify age proof

### Presentation Endpoints

- `POST /presentation/create` - Create presentation
- `POST /presentation/verify` - Verify presentation

## 🔧 Configuration

### Smart Contract Addresses

Update `.env` with deployed contract addresses:

```env
CONTRACT_ADDRESS=0x...
ZK_VERIFIER_ADDRESS=0x...
DID_REGISTRY_ADDRESS=0x...
```

### IPFS Configuration

```env
IPFS_HOST=localhost
IPFS_PORT=5001
IPFS_PROTOCOL=http
```

### Blockchain Network

```env
BLOCKCHAIN_RPC_URL=http://localhost:8545
NETWORK=development
```

## 🧪 Testing

Run tests:
```bash
# Contract tests
npm run test:contracts

# API tests
npm run test:api

# Client tests
cd client && npm test
```

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- W3C DID Working Group for DID specifications
- Ethereum Foundation for blockchain infrastructure
- IPFS team for decentralized storage
- ZK-SNARK community for privacy tools

## 📞 Support

- Documentation: [docs.digitalid.dev](https://docs.digitalid.dev)
- Issues: [GitHub Issues](https://github.com/yourusername/digital-id-framework/issues)
- Discord: [Join our community](https://discord.gg/digitalid)

## 🛡️ Security

For security concerns, please email security@digitalid.dev

## 🚦 Status

- ✅ Core Identity Management
- ✅ Smart Contracts
- ✅ Zero-Knowledge Proofs
- ✅ API Server
- ✅ React Client
- 🚧 Advanced Privacy Features
- 🚧 Mobile SDK
- 📅 Audit (Planned)