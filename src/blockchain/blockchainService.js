const Web3 = require('web3');
const { ethers } = require('ethers');
const fs = require('fs').promises;
const path = require('path');

/**
 * Blockchain Service for Digital Identity Smart Contract Interaction
 */
class BlockchainService {
    constructor() {
        this.web3 = null;
        this.provider = null;
        this.contract = null;
        this.account = null;
        this.contractAddress = process.env.CONTRACT_ADDRESS;
        this.rpcUrl = process.env.ETHEREUM_RPC_URL || 'http://localhost:8545';
        this.privateKey = process.env.PRIVATE_KEY;
    }

    /**
     * Initialize blockchain connection and contract
     */
    async initialize() {
        try {
            // Initialize Web3 provider
            this.web3 = new Web3(this.rpcUrl);
            this.provider = new ethers.JsonRpcProvider(this.rpcUrl);
            
            // Set up account from private key
            if (this.privateKey) {
                this.account = this.web3.eth.accounts.privateKeyToAccount(this.privateKey);
                this.web3.eth.accounts.wallet.add(this.account);
                this.web3.eth.defaultAccount = this.account.address;
                
                // Ethers signer
                this.signer = new ethers.Wallet(this.privateKey, this.provider);
            }
            
            // Load and initialize contract
            await this.loadContract();
            
            console.log('Blockchain Service initialized successfully');
            console.log('Account address:', this.account?.address);
            console.log('Contract address:', this.contractAddress);
        } catch (error) {
            console.error('Failed to initialize Blockchain Service:', error);
            throw error;
        }
    }

    /**
     * Load smart contract ABI and initialize contract instance
     */
    async loadContract() {
        try {
            // Load contract ABI from build directory
            const abiPath = path.join(__dirname, '../../build/contracts/DigitalIdentity.json');
            
            let contractData;
            try {
                const abiFile = await fs.readFile(abiPath, 'utf8');
                contractData = JSON.parse(abiFile);
            } catch {
                // Fallback to simplified ABI if build file doesn't exist
                contractData = {
                    abi: this.getSimplifiedABI()
                };
            }
            
            // Initialize contract instance
            if (this.contractAddress && this.contractAddress !== 'deployed_contract_address') {
                this.contract = new this.web3.eth.Contract(contractData.abi, this.contractAddress);
                this.ethersContract = new ethers.Contract(
                    this.contractAddress,
                    contractData.abi,
                    this.signer
                );
            } else {
                console.warn('Contract address not set. Contract deployment required.');
            }
        } catch (error) {
            console.error('Error loading contract:', error);
            throw error;
        }
    }

    /**
     * Deploy the DigitalIdentity contract
     */
    async deployContract() {
        try {
            if (!this.account) {
                throw new Error('Account not initialized');
            }

            const abi = this.getSimplifiedABI();
            const bytecode = this.getSimplifiedBytecode();
            
            const contract = new this.web3.eth.Contract(abi);
            
            const deploy = contract.deploy({
                data: bytecode,
                arguments: []
            });
            
            const gas = await deploy.estimateGas({ from: this.account.address });
            
            const deployedContract = await deploy.send({
                from: this.account.address,
                gas: Math.floor(gas * 1.2), // Add 20% buffer
                gasPrice: await this.web3.eth.getGasPrice()
            });
            
            this.contractAddress = deployedContract.options.address;
            this.contract = deployedContract;
            
            console.log('Contract deployed at:', this.contractAddress);
            return this.contractAddress;
        } catch (error) {
            console.error('Error deploying contract:', error);
            throw error;
        }
    }

    /**
     * Create identity on blockchain
     * @param {string} identityCommitment Identity commitment hash
     * @param {string} merkleRoot Merkle root of credentials
     * @returns {Object} Transaction receipt
     */
    async createIdentity(identityCommitment, merkleRoot) {
        try {
            if (!this.contract) {
                throw new Error('Contract not initialized');
            }

            const tx = await this.contract.methods
                .createIdentity(identityCommitment, merkleRoot)
                .send({
                    from: this.account.address,
                    gas: 300000
                });

            return {
                transactionHash: tx.transactionHash,
                blockNumber: tx.blockNumber,
                gasUsed: tx.gasUsed
            };
        } catch (error) {
            console.error('Error creating identity on blockchain:', error);
            throw error;
        }
    }

    /**
     * Update identity on blockchain
     * @param {string} newCommitment New identity commitment
     * @param {string} newMerkleRoot New merkle root
     * @returns {Object} Transaction receipt
     */
    async updateIdentity(newCommitment, newMerkleRoot) {
        try {
            if (!this.contract) {
                throw new Error('Contract not initialized');
            }

            const tx = await this.contract.methods
                .updateIdentity(newCommitment, newMerkleRoot)
                .send({
                    from: this.account.address,
                    gas: 200000
                });

            return {
                transactionHash: tx.transactionHash,
                blockNumber: tx.blockNumber,
                gasUsed: tx.gasUsed
            };
        } catch (error) {
            console.error('Error updating identity on blockchain:', error);
            throw error;
        }
    }

    /**
     * Issue credential on blockchain
     * @param {string} recipient Recipient address
     * @param {string} credentialHash Credential hash
     * @param {number} credentialType Type of credential
     * @param {number} expirationTime Expiration timestamp
     * @returns {Object} Transaction receipt
     */
    async issueCredential(recipient, credentialHash, credentialType, expirationTime) {
        try {
            if (!this.contract) {
                throw new Error('Contract not initialized');
            }

            const tx = await this.contract.methods
                .issueCredential(recipient, credentialHash, credentialType, expirationTime)
                .send({
                    from: this.account.address,
                    gas: 250000
                });

            return {
                transactionHash: tx.transactionHash,
                blockNumber: tx.blockNumber,
                gasUsed: tx.gasUsed
            };
        } catch (error) {
            console.error('Error issuing credential on blockchain:', error);
            throw error;
        }
    }

    /**
     * Verify zero-knowledge proof on blockchain
     * @param {Object} proof ZK proof object
     * @param {Array} publicInputs Public inputs array
     * @param {string} nullifier Nullifier hash
     * @returns {boolean} Verification result
     */
    async verifyProof(proof, publicInputs, nullifier) {
        try {
            if (!this.contract) {
                throw new Error('Contract not initialized');
            }

            // Convert proof to contract format
            const contractProof = {
                a: [proof.pi_a[0], proof.pi_a[1]],
                b: [
                    [proof.pi_b[0][0], proof.pi_b[0][1]],
                    [proof.pi_b[1][0], proof.pi_b[1][1]]
                ],
                c: [proof.pi_c[0], proof.pi_c[1]]
            };

            const result = await this.contract.methods
                .verifyProof(contractProof, publicInputs, nullifier)
                .call();

            return result;
        } catch (error) {
            console.error('Error verifying proof on blockchain:', error);
            return false;
        }
    }

    /**
     * Verify credential inclusion using Merkle proof
     * @param {string} credentialHash Credential hash
     * @param {Array} merkleProof Merkle proof array
     * @param {string} merkleRoot Merkle root
     * @returns {boolean} Verification result
     */
    async verifyCredentialInclusion(credentialHash, merkleProof, merkleRoot) {
        try {
            if (!this.contract) {
                throw new Error('Contract not initialized');
            }

            const result = await this.contract.methods
                .verifyCredentialInclusion(credentialHash, merkleProof, merkleRoot)
                .call();

            return result;
        } catch (error) {
            console.error('Error verifying credential inclusion:', error);
            return false;
        }
    }

    /**
     * Get identity information from blockchain
     * @param {string} address Identity address
     * @returns {Object} Identity information
     */
    async getIdentity(address) {
        try {
            if (!this.contract) {
                throw new Error('Contract not initialized');
            }

            const identity = await this.contract.methods
                .getIdentity(address)
                .call();

            return {
                identityCommitment: identity.identityCommitment,
                merkleRoot: identity.merkleRoot,
                timestamp: identity.timestamp,
                isActive: identity.isActive,
                isRevoked: identity.isRevoked
            };
        } catch (error) {
            console.error('Error getting identity from blockchain:', error);
            throw error;
        }
    }

    /**
     * Get credential information from blockchain
     * @param {string} credentialHash Credential hash
     * @returns {Object} Credential information
     */
    async getCredential(credentialHash) {
        try {
            if (!this.contract) {
                throw new Error('Contract not initialized');
            }

            const credential = await this.contract.methods
                .getCredential(credentialHash)
                .call();

            return {
                credentialHash: credential.credentialHash,
                issuerCommitment: credential.issuerCommitment,
                expirationTime: credential.expirationTime,
                isRevoked: credential.isRevoked,
                credentialType: credential.credentialType
            };
        } catch (error) {
            console.error('Error getting credential from blockchain:', error);
            throw error;
        }
    }

    /**
     * Check if credential is valid on blockchain
     * @param {string} credentialHash Credential hash
     * @returns {boolean} Validity status
     */
    async isCredentialValid(credentialHash) {
        try {
            if (!this.contract) {
                throw new Error('Contract not initialized');
            }

            const isValid = await this.contract.methods
                .isCredentialValid(credentialHash)
                .call();

            return isValid;
        } catch (error) {
            console.error('Error checking credential validity:', error);
            return false;
        }
    }

    /**
     * Revoke credential on blockchain
     * @param {string} credentialHash Credential hash
     * @returns {Object} Transaction receipt
     */
    async revokeCredential(credentialHash) {
        try {
            if (!this.contract) {
                throw new Error('Contract not initialized');
            }

            const tx = await this.contract.methods
                .revokeCredential(credentialHash)
                .send({
                    from: this.account.address,
                    gas: 150000
                });

            return {
                transactionHash: tx.transactionHash,
                blockNumber: tx.blockNumber,
                gasUsed: tx.gasUsed
            };
        } catch (error) {
            console.error('Error revoking credential on blockchain:', error);
            throw error;
        }
    }

    /**
     * Listen to contract events
     * @param {string} eventName Event name
     * @param {Function} callback Callback function
     */
    async listenToEvents(eventName, callback) {
        try {
            if (!this.contract) {
                throw new Error('Contract not initialized');
            }

            this.contract.events[eventName]()
                .on('data', callback)
                .on('error', console.error);
        } catch (error) {
            console.error('Error setting up event listener:', error);
            throw error;
        }
    }

    /**
     * Get transaction receipt
     * @param {string} txHash Transaction hash
     * @returns {Object} Transaction receipt
     */
    async getTransactionReceipt(txHash) {
        try {
            return await this.web3.eth.getTransactionReceipt(txHash);
        } catch (error) {
            console.error('Error getting transaction receipt:', error);
            throw error;
        }
    }

    /**
     * Get current block number
     * @returns {number} Block number
     */
    async getCurrentBlock() {
        try {
            return await this.web3.eth.getBlockNumber();
        } catch (error) {
            console.error('Error getting current block:', error);
            throw error;
        }
    }

    /**
     * Get simplified ABI for testing/deployment
     */
    getSimplifiedABI() {
        return [
            {
                "inputs": [],
                "stateMutability": "nonpayable",
                "type": "constructor"
            },
            {
                "inputs": [
                    {"internalType": "bytes32", "name": "_identityCommitment", "type": "bytes32"},
                    {"internalType": "bytes32", "name": "_merkleRoot", "type": "bytes32"}
                ],
                "name": "createIdentity",
                "outputs": [],
                "stateMutability": "nonpayable",
                "type": "function"
            },
            {
                "inputs": [
                    {"internalType": "bytes32", "name": "_newCommitment", "type": "bytes32"},
                    {"internalType": "bytes32", "name": "_newMerkleRoot", "type": "bytes32"}
                ],
                "name": "updateIdentity",
                "outputs": [],
                "stateMutability": "nonpayable",
                "type": "function"
            },
            {
                "inputs": [
                    {"internalType": "address", "name": "_owner", "type": "address"}
                ],
                "name": "getIdentity",
                "outputs": [
                    {
                        "components": [
                            {"internalType": "bytes32", "name": "identityCommitment", "type": "bytes32"},
                            {"internalType": "bytes32", "name": "merkleRoot", "type": "bytes32"},
                            {"internalType": "uint256", "name": "timestamp", "type": "uint256"},
                            {"internalType": "bool", "name": "isActive", "type": "bool"},
                            {"internalType": "bool", "name": "isRevoked", "type": "bool"}
                        ],
                        "internalType": "struct DigitalIdentity.Identity",
                        "name": "",
                        "type": "tuple"
                    }
                ],
                "stateMutability": "view",
                "type": "function"
            }
        ];
    }

    /**
     * Get simplified bytecode for testing/deployment
     */
    getSimplifiedBytecode() {
        // This is a placeholder - in production, use actual compiled bytecode
        return "0x608060405234801561001057600080fd5b50600080546001600160a01b031916331790556110a7806100326000396000f3fe";
    }
}

module.exports = BlockchainService;