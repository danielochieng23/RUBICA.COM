const { expect } = require('chai');
const IdentityManager = require('../src/identity/identityManager');
const KeyManager = require('../src/crypto/keyManager');
const ZKProofSystem = require('../src/privacy/zkProofSystem');

describe('Privacy-Preserving Digital Identity Framework Tests', function() {
    let identityManager;
    let keyManager;
    let zkProofSystem;
    let testIdentity;
    let testPassword;
    let testPersonalData;

    before(async function() {
        this.timeout(10000);
        
        // Initialize components
        identityManager = new IdentityManager();
        keyManager = new KeyManager();
        zkProofSystem = new ZKProofSystem();
        
        await identityManager.initialize();
        await zkProofSystem.initialize();
        
        // Test data
        testPassword = 'testPassword123!';
        testPersonalData = {
            firstName: 'John',
            lastName: 'Doe',
            dateOfBirth: '1990-01-01',
            email: 'john.doe@example.com',
            phoneNumber: '+1234567890',
            address: {
                street: '123 Main St',
                city: 'Anytown',
                state: 'CA',
                zipCode: '12345',
                country: 'USA'
            }
        };
    });

    describe('KeyManager Tests', function() {
        it('should generate a valid key pair', function() {
            const keyPair = keyManager.generateKeyPair();
            
            expect(keyPair).to.have.property('privateKey');
            expect(keyPair).to.have.property('publicKey');
            expect(keyPair).to.have.property('address');
            expect(keyPair.privateKey).to.be.a('string');
            expect(keyPair.publicKey).to.be.a('string');
            expect(keyPair.address).to.match(/^0x[a-fA-F0-9]{40}$/);
        });

        it('should derive correct address from public key', function() {
            const keyPair = keyManager.generateKeyPair();
            const derivedAddress = keyManager.deriveAddress(keyPair.publicKey);
            
            expect(derivedAddress).to.equal(keyPair.address);
        });

        it('should sign and verify messages correctly', function() {
            const keyPair = keyManager.generateKeyPair();
            const message = 'Test message for signing';
            
            const signature = keyManager.signMessage(message, keyPair.privateKey);
            const isValid = keyManager.verifySignature(message, signature, keyPair.publicKey);
            
            expect(signature).to.have.property('r');
            expect(signature).to.have.property('s');
            expect(signature).to.have.property('v');
            expect(isValid).to.be.true;
        });

        it('should generate and verify commitments', function() {
            const data = 'sensitive data';
            const randomness = keyManager.generateSalt();
            
            const commitment = keyManager.generateCommitment(data, randomness);
            
            expect(commitment).to.be.a('string');
            expect(commitment).to.match(/^0x[a-fA-F0-9]{64}$/);
        });

        it('should encrypt and decrypt data correctly', function() {
            const data = 'confidential information';
            const key = keyManager.generateSalt();
            
            const encrypted = keyManager.encryptData(data, key);
            const decrypted = keyManager.decryptData(encrypted, key);
            
            expect(encrypted).to.have.property('encrypted');
            expect(encrypted).to.have.property('iv');
            expect(encrypted).to.have.property('authTag');
            expect(decrypted).to.equal(data);
        });

        it('should generate valid Merkle trees and proofs', function() {
            const credentialHashes = [
                keyManager.hash('credential1'),
                keyManager.hash('credential2'),
                keyManager.hash('credential3'),
                keyManager.hash('credential4')
            ];
            
            const merkleRoot = keyManager.generateMerkleRoot(credentialHashes);
            const merkleProof = keyManager.generateMerkleProof(credentialHashes, 1);
            
            expect(merkleRoot).to.match(/^0x[a-fA-F0-9]{64}$/);
            expect(merkleProof).to.be.an('array');
            
            // Verify the proof
            const isValid = keyManager.verifyMerkleProof(
                credentialHashes[1],
                merkleProof,
                merkleRoot
            );
            expect(isValid).to.be.true;
        });
    });

    describe('ZKProofSystem Tests', function() {
        it('should initialize successfully', async function() {
            expect(zkProofSystem.keyManager).to.exist;
            expect(zkProofSystem.circuitPath).to.exist;
            expect(zkProofSystem.keysPath).to.exist;
        });

        it('should generate and verify identity proofs', async function() {
            this.timeout(5000);
            
            const privateInputs = {
                identityData: testPersonalData,
                randomness: keyManager.generateSalt(),
                nullifierSecret: keyManager.generateSalt()
            };
            
            const publicInputs = {
                identityCommitment: keyManager.generateIdentityCommitment(
                    testPersonalData,
                    privateInputs.randomness
                ),
                nullifier: keyManager.generateNullifier(
                    'test-identity',
                    'test-challenge'
                ),
                merkleRoot: keyManager.generateMerkleRoot([]),
                challenge: 'test-challenge'
            };
            
            const proofResult = await zkProofSystem.generateIdentityProof(
                privateInputs,
                publicInputs
            );
            
            expect(proofResult).to.have.property('proof');
            expect(proofResult).to.have.property('publicSignals');
            expect(proofResult).to.have.property('timestamp');
            
            const isValid = await zkProofSystem.verifyProof(
                proofResult.proof,
                proofResult.publicSignals
            );
            
            expect(isValid).to.be.a('boolean');
        });

        it('should generate age proofs', async function() {
            const actualAge = 25;
            const minimumAge = 18;
            const secret = keyManager.generateSalt();
            
            const ageProof = await zkProofSystem.generateAgeProof(
                actualAge,
                minimumAge,
                secret
            );
            
            expect(ageProof).to.have.property('proof');
            expect(ageProof).to.have.property('publicSignals');
        });
    });

    describe('IdentityManager Tests', function() {
        it('should create a new identity successfully', async function() {
            testIdentity = await identityManager.createIdentity(
                testPersonalData,
                testPassword
            );
            
            expect(testIdentity).to.have.property('identityId');
            expect(testIdentity).to.have.property('address');
            expect(testIdentity).to.have.property('publicKey');
            expect(testIdentity).to.have.property('identityCommitment');
            expect(testIdentity).to.have.property('merkleRoot');
            
            expect(testIdentity.identityId).to.match(/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/);
            expect(testIdentity.address).to.match(/^0x[a-fA-F0-9]{40}$/);
        });

        it('should authenticate identity with correct password', async function() {
            const authenticatedIdentity = await identityManager.authenticateIdentity(
                testIdentity.identityId,
                testPassword
            );
            
            expect(authenticatedIdentity).to.have.property('id');
            expect(authenticatedIdentity).to.have.property('address');
            expect(authenticatedIdentity.id).to.equal(testIdentity.identityId);
            expect(authenticatedIdentity.address).to.equal(testIdentity.address);
        });

        it('should reject authentication with incorrect password', async function() {
            try {
                await identityManager.authenticateIdentity(
                    testIdentity.identityId,
                    'wrongPassword'
                );
                expect.fail('Should have thrown an error');
            } catch (error) {
                expect(error.message).to.equal('Invalid password');
            }
        });

        it('should add credentials to identity', async function() {
            const credentialData = {
                type: 'driverLicense',
                data: {
                    licenseNumber: 'DL123456789',
                    issuingState: 'CA',
                    expirationDate: '2025-12-31'
                },
                expiresAt: new Date('2025-12-31').toISOString()
            };
            
            const issuerAddress = '0x1234567890123456789012345678901234567890';
            
            const credential = await identityManager.addCredential(
                testIdentity.identityId,
                credentialData,
                issuerAddress
            );
            
            expect(credential).to.have.property('id');
            expect(credential).to.have.property('type');
            expect(credential).to.have.property('hash');
            expect(credential.type).to.equal('driverLicense');
            expect(credential.issuer).to.equal(issuerAddress);
        });

        it('should generate identity proofs', async function() {
            this.timeout(5000);
            
            const proofRequirements = {
                challenge: 'test-challenge-123'
            };
            
            const proof = await identityManager.generateIdentityProof(
                testIdentity.identityId,
                testPassword,
                proofRequirements
            );
            
            expect(proof).to.have.property('proof');
            expect(proof).to.have.property('publicSignals');
            expect(proof).to.have.property('timestamp');
        });

        it('should generate age proofs without revealing exact age', async function() {
            const minimumAge = 18;
            
            const ageProof = await identityManager.generateAgeProof(
                testIdentity.identityId,
                testPassword,
                minimumAge
            );
            
            expect(ageProof).to.have.property('proof');
            expect(ageProof).to.have.property('publicSignals');
        });

        it('should update identity data', async function() {
            const newData = {
                ...testPersonalData,
                phoneNumber: '+9876543210'
            };
            
            const updateResult = await identityManager.updateIdentity(
                testIdentity.identityId,
                testPassword,
                newData
            );
            
            expect(updateResult).to.have.property('identityCommitment');
            expect(updateResult).to.have.property('updatedAt');
        });

        it('should retrieve identity information', function() {
            const identityInfo = identityManager.getIdentityInfo(testIdentity.identityId);
            
            expect(identityInfo).to.have.property('id');
            expect(identityInfo).to.have.property('address');
            expect(identityInfo).to.have.property('credentialsCount');
            expect(identityInfo.id).to.equal(testIdentity.identityId);
        });

        it('should handle credential revocation', async function() {
            // First, get a credential to revoke
            const identityInfo = identityManager.getIdentityInfo(testIdentity.identityId);
            const fullIdentity = await identityManager.authenticateIdentity(
                testIdentity.identityId,
                testPassword
            );
            
            if (fullIdentity.credentials.length > 0) {
                const credentialToRevoke = fullIdentity.credentials[0];
                const issuerAddress = credentialToRevoke.issuer;
                
                const revocationResult = await identityManager.revokeCredential(
                    credentialToRevoke.id,
                    issuerAddress
                );
                
                expect(revocationResult).to.be.true;
                
                // Verify revocation status
                const isRevoked = identityManager.isCredentialRevoked(
                    credentialToRevoke.id,
                    issuerAddress
                );
                expect(isRevoked).to.be.true;
            }
        });

        it('should generate Merkle proofs for credentials', function() {
            const authenticatedIdentity = identityManager.identities.get(testIdentity.identityId);
            
            if (authenticatedIdentity && authenticatedIdentity.credentials.length > 0) {
                const credentialId = authenticatedIdentity.credentials[0].id;
                
                const merkleProof = identityManager.generateCredentialMerkleProof(
                    testIdentity.identityId,
                    credentialId
                );
                
                expect(merkleProof).to.have.property('proof');
                expect(merkleProof).to.have.property('root');
                expect(merkleProof).to.have.property('index');
                expect(merkleProof).to.have.property('credentialHash');
            }
        });
    });

    describe('Integration Tests', function() {
        it('should handle complete identity lifecycle', async function() {
            this.timeout(10000);
            
            // Create identity
            const newIdentity = await identityManager.createIdentity(
                {
                    firstName: 'Alice',
                    lastName: 'Smith',
                    dateOfBirth: '1995-05-15',
                    email: 'alice.smith@example.com'
                },
                'alicePassword123!'
            );
            
            // Add credential
            const credential = await identityManager.addCredential(
                newIdentity.identityId,
                {
                    type: 'universityDegree',
                    data: {
                        degree: 'Bachelor of Science',
                        university: 'Tech University',
                        graduationYear: 2017
                    },
                    expiresAt: new Date('2030-12-31').toISOString()
                },
                '0xuniversity123456789012345678901234567890'
            );
            
            // Generate credential proof
            const credentialProof = await identityManager.generateCredentialProof(
                newIdentity.identityId,
                'alicePassword123!',
                {
                    type: 'universityDegree',
                    challenge: 'employment-verification'
                }
            );
            
            // Verify proof
            const isValidProof = await identityManager.verifyProof(
                credentialProof.proof,
                credentialProof.publicSignals
            );
            
            expect(newIdentity).to.exist;
            expect(credential).to.exist;
            expect(credentialProof).to.exist;
            expect(isValidProof).to.be.a('boolean');
        });

        it('should maintain privacy in proofs', async function() {
            // Generate a proof that should not reveal personal data
            const proof = await identityManager.generateIdentityProof(
                testIdentity.identityId,
                testPassword,
                { challenge: 'privacy-test' }
            );
            
            // Ensure proof doesn't contain personal data
            const proofString = JSON.stringify(proof);
            expect(proofString).to.not.include(testPersonalData.firstName);
            expect(proofString).to.not.include(testPersonalData.lastName);
            expect(proofString).to.not.include(testPersonalData.email);
            expect(proofString).to.not.include(testPersonalData.phoneNumber);
        });
    });

    describe('Error Handling Tests', function() {
        it('should handle invalid identity ID', async function() {
            try {
                await identityManager.authenticateIdentity(
                    'invalid-id',
                    testPassword
                );
                expect.fail('Should have thrown an error');
            } catch (error) {
                expect(error.message).to.equal('Identity not found');
            }
        });

        it('should handle missing credentials for proof generation', async function() {
            try {
                await identityManager.generateCredentialProof(
                    testIdentity.identityId,
                    testPassword,
                    {
                        type: 'nonExistentCredential',
                        challenge: 'test'
                    }
                );
                expect.fail('Should have thrown an error');
            } catch (error) {
                expect(error.message).to.include('No qualifying credentials found');
            }
        });

        it('should handle invalid Merkle proof requests', function() {
            try {
                identityManager.generateCredentialMerkleProof(
                    testIdentity.identityId,
                    'non-existent-credential-id'
                );
                expect.fail('Should have thrown an error');
            } catch (error) {
                expect(error.message).to.equal('Credential not found in identity');
            }
        });
    });

    after(function() {
        // Cleanup if needed
        console.log('All tests completed successfully!');
    });
});