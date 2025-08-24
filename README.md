# Privacy-Preserving Digital Identity Framework

A comprehensive blockchain-based digital identity management system with zero-knowledge proofs, ensuring user privacy while enabling secure credential verification.

## 🌟 Features

### Core Features
- **Privacy-Preserving Identity Management**: Create and manage digital identities without revealing personal information
- **Zero-Knowledge Proofs**: Prove identity or credential possession without exposing sensitive data
- **Blockchain Integration**: Immutable storage and verification on Ethereum-compatible networks
- **Credential Management**: Issue, store, and verify digital credentials securely
- **Age Verification**: Prove age requirements without revealing exact age
- **Merkle Tree Verification**: Efficient proof of credential inclusion
- **Revocation Support**: Secure credential revocation mechanisms

### Security & Privacy
- **End-to-End Encryption**: All personal data encrypted with user-controlled keys
- **Commitment Schemes**: Cryptographic commitments hide data while enabling verification
- **Nullifier Protection**: Prevent double-spending and replay attacks
- **Perfect Forward Secrecy**: Key rotation and secure key management
- **No PII Storage**: Personal information never stored in plain text

### Technical Stack
- **Backend**: Node.js, Express.js, Web3.js, Ethers.js
- **Frontend**: React, Material-UI, React Router
- **Blockchain**: Solidity smart contracts, Truffle framework
- **Cryptography**: Elliptic curve cryptography, AES-256-GCM encryption
- **Zero-Knowledge**: Groth16 proof system, Circom circuits
- **Storage**: IPFS integration, MongoDB support

## 🚀 Quick Start

### Prerequisites
- Node.js v16 or higher
- npm or yarn
- Git
- Ethereum development environment (Ganache recommended)

### Installation

1. **Clone the repository**
```bash
git clone <repository-url>
cd privacy-preserving-digital-id
```

2. **Install dependencies**
```bash
npm install
cd frontend && npm install && cd ..
```

3. **Configure environment**
```bash
cp .env.example .env
# Edit .env with your configuration
```

4. **Start blockchain network (Ganache)**
```bash
npx ganache-cli
```

5. **Deploy smart contracts**
```bash
npm run build:contracts
npm run deploy:contracts
```

6. **Start the backend server**
```bash
npm start
```

7. **Start the frontend (in a new terminal)**
```bash
npm run frontend:dev
```

8. **Access the application**
- Frontend: http://localhost:3001
- API: http://localhost:3000
- API Documentation: http://localhost:3000/api/docs

## 📖 API Documentation

### Identity Management

#### Create Identity
```http
POST /api/identity/create
```

**Request Body:**
```json
{
  "personalData": {
    "firstName": "John",
    "lastName": "Doe",
    "dateOfBirth": "1990-01-01",
    "email": "john.doe@example.com",
    "phoneNumber": "+1234567890",
    "address": {
      "street": "123 Main St",
      "city": "Anytown",
      "state": "CA",
      "zipCode": "12345",
      "country": "USA"
    }
  },
  "password": "securePassword123!"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Identity created successfully",
  "data": {
    "identityId": "550e8400-e29b-41d4-a716-446655440000",
    "address": "0x742d35Cc6834C0532925a3b8D0Bb1e0d3c456E72",
    "publicKey": "0x04...",
    "identityCommitment": "0x8f4a..."
  }
}
```

#### Authenticate
```http
POST /api/identity/authenticate
```

**Request Body:**
```json
{
  "identityId": "550e8400-e29b-41d4-a716-446655440000",
  "password": "securePassword123!"
}
```

#### Generate Identity Proof
```http
POST /api/identity/proof/generate
```

**Request Body:**
```json
{
  "identityId": "550e8400-e29b-41d4-a716-446655440000",
  "password": "securePassword123!",
  "proofRequirements": {
    "challenge": "employment-verification"
  }
}
```

#### Generate Age Proof
```http
POST /api/identity/proof/age
```

**Request Body:**
```json
{
  "identityId": "550e8400-e29b-41d4-a716-446655440000",
  "password": "securePassword123!",
  "minimumAge": 18
}
```

### Credential Management

#### Add Credential
```http
POST /api/identity/credentials/add
```

**Request Body:**
```json
{
  "identityId": "550e8400-e29b-41d4-a716-446655440000",
  "credentialData": {
    "type": "driverLicense",
    "data": {
      "licenseNumber": "DL123456789",
      "issuingState": "CA",
      "expirationDate": "2025-12-31"
    },
    "expiresAt": "2025-12-31T23:59:59.999Z"
  },
  "issuerAddress": "0x1234567890123456789012345678901234567890"
}
```

#### Generate Credential Proof
```http
POST /api/identity/proof/credential
```

**Request Body:**
```json
{
  "identityId": "550e8400-e29b-41d4-a716-446655440000",
  "password": "securePassword123!",
  "requirements": {
    "type": "driverLicense",
    "challenge": "age-verification"
  }
}
```

## 🏗️ Architecture

### System Overview
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Backend API   │    │   Blockchain    │
│   (React)       │◄──►│   (Node.js)     │◄──►│   (Ethereum)    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
        │                       │                       │
        │                       │                       │
        ▼                       ▼                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   User Auth     │    │   Identity      │    │   Smart         │
│   & UI          │    │   Manager       │    │   Contracts     │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                               │
                               ▼
                    ┌─────────────────┐
                    │   ZK Proof      │
                    │   System        │
                    └─────────────────┘
```

### Core Components

#### 1. Identity Manager (`src/identity/identityManager.js`)
- Manages digital identity lifecycle
- Handles authentication and authorization
- Coordinates with cryptographic and proof systems
- Provides high-level API for identity operations

#### 2. Key Manager (`src/crypto/keyManager.js`)
- Cryptographic key generation and management
- Message signing and verification
- Data encryption and decryption
- Merkle tree operations
- Commitment scheme implementation

#### 3. ZK Proof System (`src/privacy/zkProofSystem.js`)
- Zero-knowledge proof generation and verification
- Circuit management for different proof types
- Nullifier handling for replay protection
- Privacy-preserving verification mechanisms

#### 4. Blockchain Service (`src/blockchain/blockchainService.js`)
- Smart contract interaction
- Transaction management
- Event listening and processing
- Blockchain state synchronization

#### 5. Smart Contracts (`contracts/DigitalIdentity.sol`)
- Identity commitment storage
- Credential registry
- Zero-knowledge proof verification
- Revocation list management

## 🔐 Privacy & Security

### Privacy Features

1. **Data Minimization**: Only necessary data is collected and processed
2. **Selective Disclosure**: Users control what information to reveal
3. **Unlinkability**: Different interactions cannot be correlated
4. **Forward Privacy**: Past interactions remain private even if keys are compromised

### Security Measures

1. **End-to-End Encryption**: All sensitive data encrypted with user keys
2. **Secure Key Storage**: Keys derived from user passwords with PBKDF2
3. **Replay Protection**: Nullifiers prevent double-spending attacks
4. **Input Validation**: Comprehensive validation of all user inputs
5. **Rate Limiting**: API rate limiting to prevent abuse

### Zero-Knowledge Proofs

The system uses Groth16 zero-knowledge proofs to enable:
- **Identity Verification**: Prove identity without revealing personal data
- **Age Verification**: Prove age > N without revealing exact age
- **Credential Verification**: Prove credential possession without revealing credential data
- **Membership Proofs**: Prove membership in a set without revealing which member

## 🧪 Testing

### Running Tests
```bash
# Run all tests
npm test

# Run tests with coverage
npm run test:coverage

# Run specific test file
npm test -- --grep "Identity Manager"
```

### Test Categories

1. **Unit Tests**: Individual component testing
2. **Integration Tests**: Component interaction testing
3. **Security Tests**: Cryptographic and security feature testing
4. **Privacy Tests**: Verification that no sensitive data leaks
5. **End-to-End Tests**: Complete user workflow testing

### Test Coverage
- KeyManager: Cryptographic operations and key management
- IdentityManager: Identity lifecycle and management
- ZKProofSystem: Zero-knowledge proof generation and verification
- BlockchainService: Smart contract interactions
- API Endpoints: All REST API functionality

## 🚀 Deployment

### Development Deployment

1. **Local Development**
```bash
npm run dev
```

2. **Docker Deployment**
```bash
docker-compose up -d
```

### Production Deployment

1. **Environment Setup**
```bash
# Set production environment variables
export NODE_ENV=production
export DATABASE_URL=your_production_db_url
export BLOCKCHAIN_NETWORK=mainnet
```

2. **Build and Deploy**
```bash
npm run build
npm run deploy:production
```

3. **Health Checks**
```bash
curl http://your-domain.com/health
```

## 🔧 Configuration

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Server port | `3000` |
| `NODE_ENV` | Environment | `development` |
| `ETHEREUM_RPC_URL` | Blockchain RPC endpoint | `http://localhost:8545` |
| `PRIVATE_KEY` | Deployment private key | - |
| `CONTRACT_ADDRESS` | Deployed contract address | - |
| `MONGODB_URI` | Database connection string | - |
| `JWT_SECRET` | JWT signing secret | - |
| `ENCRYPTION_KEY` | Data encryption key | - |

### Network Configuration

#### Supported Networks
- **Local**: Ganache for development
- **Testnet**: Sepolia, Goerli
- **Mainnet**: Ethereum mainnet

#### Gas Configuration
```javascript
{
  "gasPrice": "20000000000", // 20 gwei
  "gasLimit": "6721975"
}
```

## 🤝 Contributing

### Development Setup

1. **Fork the repository**
2. **Create feature branch**
```bash
git checkout -b feature/amazing-feature
```

3. **Make changes and test**
```bash
npm test
npm run lint
```

4. **Commit changes**
```bash
git commit -m "Add amazing feature"
```

5. **Push and create PR**
```bash
git push origin feature/amazing-feature
```

### Code Style

- Use ESLint configuration
- Follow JavaScript Standard Style
- Write comprehensive tests
- Document all public APIs
- Use meaningful commit messages

### Security Guidelines

- Never commit private keys or sensitive data
- Use environment variables for configuration
- Validate all inputs
- Follow cryptographic best practices
- Report security issues privately

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [circom](https://github.com/iden3/circom) - Circuit compiler for zero-knowledge proofs
- [snarkjs](https://github.com/iden3/snarkjs) - JavaScript implementation of zkSNARKs
- [OpenZeppelin](https://openzeppelin.com/) - Secure smart contract library
- [Web3.js](https://web3js.readthedocs.io/) - Ethereum JavaScript API
- [Material-UI](https://mui.com/) - React component library

## 📞 Support

- **Documentation**: [Project Wiki](../../wiki)
- **Issues**: [GitHub Issues](../../issues)
- **Discussions**: [GitHub Discussions](../../discussions)
- **Email**: support@privacy-id-framework.com

## 🔮 Roadmap

### Phase 1: Core Features ✅
- ✅ Identity creation and management
- ✅ Zero-knowledge proof generation
- ✅ Credential management
- ✅ Blockchain integration
- ✅ Web interface

### Phase 2: Advanced Features 🚧
- 🔄 Mobile application
- 🔄 Advanced credential types
- 🔄 Multi-chain support
- 🔄 Decentralized storage (IPFS)
- 🔄 Improved UX/UI

### Phase 3: Enterprise Features 📋
- 📋 Enterprise dashboard
- 📋 Bulk operations
- 📋 Advanced analytics
- 📋 Compliance tools
- 📋 API rate limiting

### Phase 4: Ecosystem 🌟
- 🌟 Third-party integrations
- 🌟 Developer SDK
- 🌟 Marketplace for credentials
- 🌟 Governance token
- 🌟 Decentralized governance

---

**Built with ❤️ for privacy and security**