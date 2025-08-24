import axios from 'axios';
import { ethers } from 'ethers';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000';

class DigitalIdService {
  constructor() {
    this.api = axios.create({
      baseURL: API_URL,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json'
      }
    });

    // Add auth interceptor
    this.api.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('authToken');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Add response interceptor
    this.api.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          // Handle unauthorized
          localStorage.removeItem('authToken');
          window.location.href = '/';
        }
        return Promise.reject(error);
      }
    );
  }

  // Identity operations
  async createIdentity(identityData, password, privateKey) {
    const response = await this.api.post('/identity/create', {
      identityData,
      password,
      privateKey
    });
    return response.data.data;
  }

  async resolveIdentity(did) {
    const response = await this.api.get(`/identity/resolve/${did}`);
    return response.data.data;
  }

  async revokeIdentity(did, ownerPrivateKey) {
    const response = await this.api.post('/identity/revoke', {
      did,
      ownerPrivateKey
    });
    return response.data.data;
  }

  // Credential operations
  async issueCredential(credential, holderDID, issuerPrivateKey) {
    const response = await this.api.post('/credential/issue', {
      credential,
      holderDID,
      issuerPrivateKey
    });
    return response.data.data;
  }

  async verifyCredential(did, credentialHash) {
    const response = await this.api.post('/credential/verify', {
      did,
      credentialHash
    });
    return response.data.data;
  }

  async getCredentialTypes() {
    const response = await this.api.get('/credential/types');
    return response.data.data;
  }

  // Presentation operations
  async createPresentation(credentials, disclosedFields, holderSecret) {
    const response = await this.api.post('/presentation/create', {
      credentials,
      disclosedFields,
      holderSecret
    });
    return response.data.data;
  }

  async verifyPresentation(presentation) {
    const response = await this.api.post('/presentation/verify', {
      presentation
    });
    return response.data.data;
  }

  // Proof operations
  async generateAgeProof(age, minAge) {
    const response = await this.api.post('/proof/age/generate', {
      age,
      minAge
    });
    return response.data.data;
  }

  async verifyAgeProof(proof, minAge, verifierPrivateKey) {
    const response = await this.api.post('/proof/age/verify', {
      proof,
      minAge,
      verifierPrivateKey
    });
    return response.data.verified;
  }

  // DID operations
  async generateDID(method = 'ethr', network = 'development') {
    const response = await this.api.post('/did/generate', {
      method,
      network
    });
    return response.data.data;
  }

  async resolveDID(did) {
    const response = await this.api.get(`/did/resolve/${did}`);
    return response.data.data;
  }

  // Controller operations
  async addController(did, controllerAddress, ownerPrivateKey) {
    const response = await this.api.post('/identity/controller/add', {
      did,
      controllerAddress,
      ownerPrivateKey
    });
    return response.data.data;
  }

  // Utility functions
  generateWallet() {
    const wallet = ethers.Wallet.createRandom();
    return {
      address: wallet.address,
      privateKey: wallet.privateKey,
      publicKey: wallet.publicKey,
      mnemonic: wallet.mnemonic?.phrase
    };
  }

  async signMessage(message, privateKey) {
    const wallet = new ethers.Wallet(privateKey);
    return await wallet.signMessage(message);
  }

  verifySignature(message, signature, expectedAddress) {
    const recoveredAddress = ethers.utils.verifyMessage(message, signature);
    return recoveredAddress.toLowerCase() === expectedAddress.toLowerCase();
  }

  formatAddress(address) {
    if (!address) return '';
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  }

  // Local storage operations
  saveCredential(credential) {
    const credentials = this.getStoredCredentials();
    credentials.push(credential);
    localStorage.setItem('credentials', JSON.stringify(credentials));
  }

  getStoredCredentials() {
    const stored = localStorage.getItem('credentials');
    return stored ? JSON.parse(stored) : [];
  }

  savePresentation(presentation) {
    const presentations = this.getStoredPresentations();
    presentations.push(presentation);
    localStorage.setItem('presentations', JSON.stringify(presentations));
  }

  getStoredPresentations() {
    const stored = localStorage.getItem('presentations');
    return stored ? JSON.parse(stored) : [];
  }
}

export default new DigitalIdService();