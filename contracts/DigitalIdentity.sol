// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/cryptography/MerkleProof.sol";

/**
 * @title DigitalIdentity
 * @dev Privacy-preserving digital identity contract using zero-knowledge proofs
 */
contract DigitalIdentity is Ownable, ReentrancyGuard {
    struct Identity {
        bytes32 identityCommitment;  // Commitment to identity data
        bytes32 merkleRoot;          // Merkle root of credentials
        uint256 timestamp;           // Creation timestamp
        bool isActive;               // Identity status
        bool isRevoked;              // Revocation status
    }
    
    struct Credential {
        bytes32 credentialHash;      // Hash of credential data
        bytes32 issuerCommitment;    // Issuer's commitment
        uint256 expirationTime;      // Expiration timestamp
        bool isRevoked;              // Revocation status
        uint8 credentialType;        // Type of credential
    }
    
    struct ZKProof {
        uint256[2] a;
        uint256[2][2] b;
        uint256[2] c;
    }
    
    // Events
    event IdentityCreated(address indexed owner, bytes32 indexed identityCommitment);
    event IdentityUpdated(address indexed owner, bytes32 indexed newCommitment);
    event IdentityRevoked(address indexed owner, bytes32 indexed identityCommitment);
    event CredentialIssued(bytes32 indexed credentialHash, address indexed issuer, address indexed recipient);
    event CredentialRevoked(bytes32 indexed credentialHash, address indexed issuer);
    event ProofVerified(address indexed prover, bytes32 indexed proofHash);
    
    // State variables
    mapping(address => Identity) public identities;
    mapping(bytes32 => Credential) public credentials;
    mapping(address => bool) public authorizedIssuers;
    mapping(bytes32 => bool) public usedNullifiers;
    
    bytes32 public immutable DOMAIN_SEPARATOR;
    uint256 public constant PROOF_VALIDITY_PERIOD = 3600; // 1 hour
    
    // Verification key for ZK proofs (simplified for demo)
    uint256[2] public verificationKey;
    
    modifier onlyAuthorizedIssuer() {
        require(authorizedIssuers[msg.sender], "Not authorized issuer");
        _;
    }
    
    modifier onlyActiveIdentity() {
        require(identities[msg.sender].isActive && !identities[msg.sender].isRevoked, "Identity not active");
        _;
    }
    
    constructor() {
        DOMAIN_SEPARATOR = keccak256(
            abi.encode(
                keccak256("EIP712Domain(string name,string version,uint256 chainId,address verifyingContract)"),
                keccak256(bytes("DigitalIdentity")),
                keccak256(bytes("1")),
                block.chainid,
                address(this)
            )
        );
        
        // Initialize with owner as first authorized issuer
        authorizedIssuers[msg.sender] = true;
    }
    
    /**
     * @dev Create a new privacy-preserving identity
     * @param _identityCommitment Commitment to identity data
     * @param _merkleRoot Initial merkle root of credentials
     */
    function createIdentity(
        bytes32 _identityCommitment,
        bytes32 _merkleRoot
    ) external {
        require(_identityCommitment != bytes32(0), "Invalid commitment");
        require(!identities[msg.sender].isActive, "Identity already exists");
        
        identities[msg.sender] = Identity({
            identityCommitment: _identityCommitment,
            merkleRoot: _merkleRoot,
            timestamp: block.timestamp,
            isActive: true,
            isRevoked: false
        });
        
        emit IdentityCreated(msg.sender, _identityCommitment);
    }
    
    /**
     * @dev Update identity commitment (privacy-preserving update)
     * @param _newCommitment New commitment to identity data
     * @param _newMerkleRoot New merkle root of credentials
     */
    function updateIdentity(
        bytes32 _newCommitment,
        bytes32 _newMerkleRoot
    ) external onlyActiveIdentity {
        require(_newCommitment != bytes32(0), "Invalid commitment");
        
        identities[msg.sender].identityCommitment = _newCommitment;
        identities[msg.sender].merkleRoot = _newMerkleRoot;
        
        emit IdentityUpdated(msg.sender, _newCommitment);
    }
    
    /**
     * @dev Issue a new credential to an identity
     * @param _recipient Address of credential recipient
     * @param _credentialHash Hash of credential data
     * @param _credentialType Type of credential
     * @param _expirationTime Expiration timestamp
     */
    function issueCredential(
        address _recipient,
        bytes32 _credentialHash,
        uint8 _credentialType,
        uint256 _expirationTime
    ) external onlyAuthorizedIssuer {
        require(_recipient != address(0), "Invalid recipient");
        require(_credentialHash != bytes32(0), "Invalid credential hash");
        require(_expirationTime > block.timestamp, "Invalid expiration time");
        require(identities[_recipient].isActive, "Recipient identity not active");
        
        credentials[_credentialHash] = Credential({
            credentialHash: _credentialHash,
            issuerCommitment: keccak256(abi.encodePacked(msg.sender, block.timestamp)),
            expirationTime: _expirationTime,
            isRevoked: false,
            credentialType: _credentialType
        });
        
        emit CredentialIssued(_credentialHash, msg.sender, _recipient);
    }
    
    /**
     * @dev Revoke a credential
     * @param _credentialHash Hash of credential to revoke
     */
    function revokeCredential(bytes32 _credentialHash) external onlyAuthorizedIssuer {
        require(credentials[_credentialHash].credentialHash != bytes32(0), "Credential not found");
        require(!credentials[_credentialHash].isRevoked, "Already revoked");
        
        credentials[_credentialHash].isRevoked = true;
        
        emit CredentialRevoked(_credentialHash, msg.sender);
    }
    
    /**
     * @dev Verify a zero-knowledge proof
     * @param _proof ZK proof structure
     * @param _publicInputs Public inputs for verification
     * @param _nullifier Nullifier to prevent double-spending
     */
    function verifyProof(
        ZKProof memory _proof,
        uint256[] memory _publicInputs,
        bytes32 _nullifier
    ) external returns (bool) {
        require(!usedNullifiers[_nullifier], "Nullifier already used");
        
        // Simplified ZK proof verification (in production, use proper ZK libraries)
        bool isValid = _verifyZKProof(_proof, _publicInputs);
        
        if (isValid) {
            usedNullifiers[_nullifier] = true;
            bytes32 proofHash = keccak256(abi.encodePacked(_proof.a, _proof.b, _proof.c));
            emit ProofVerified(msg.sender, proofHash);
        }
        
        return isValid;
    }
    
    /**
     * @dev Verify credential using Merkle proof
     * @param _credentialHash Hash of credential
     * @param _merkleProof Merkle proof array
     * @param _merkleRoot Merkle root to verify against
     */
    function verifyCredentialInclusion(
        bytes32 _credentialHash,
        bytes32[] memory _merkleProof,
        bytes32 _merkleRoot
    ) external pure returns (bool) {
        return MerkleProof.verify(_merkleProof, _merkleRoot, _credentialHash);
    }
    
    /**
     * @dev Revoke identity (emergency function)
     */
    function revokeIdentity() external onlyActiveIdentity {
        identities[msg.sender].isRevoked = true;
        emit IdentityRevoked(msg.sender, identities[msg.sender].identityCommitment);
    }
    
    /**
     * @dev Add authorized issuer (only owner)
     * @param _issuer Address to authorize
     */
    function addAuthorizedIssuer(address _issuer) external onlyOwner {
        require(_issuer != address(0), "Invalid issuer address");
        authorizedIssuers[_issuer] = true;
    }
    
    /**
     * @dev Remove authorized issuer (only owner)
     * @param _issuer Address to remove authorization
     */
    function removeAuthorizedIssuer(address _issuer) external onlyOwner {
        authorizedIssuers[_issuer] = false;
    }
    
    /**
     * @dev Set verification key for ZK proofs (only owner)
     * @param _vk Verification key
     */
    function setVerificationKey(uint256[2] memory _vk) external onlyOwner {
        verificationKey = _vk;
    }
    
    /**
     * @dev Get identity information
     * @param _owner Address of identity owner
     */
    function getIdentity(address _owner) external view returns (Identity memory) {
        return identities[_owner];
    }
    
    /**
     * @dev Get credential information
     * @param _credentialHash Hash of credential
     */
    function getCredential(bytes32 _credentialHash) external view returns (Credential memory) {
        return credentials[_credentialHash];
    }
    
    /**
     * @dev Check if credential is valid (not expired and not revoked)
     * @param _credentialHash Hash of credential
     */
    function isCredentialValid(bytes32 _credentialHash) external view returns (bool) {
        Credential memory cred = credentials[_credentialHash];
        return cred.credentialHash != bytes32(0) && 
               !cred.isRevoked && 
               cred.expirationTime > block.timestamp;
    }
    
    /**
     * @dev Internal function to verify ZK proof (simplified)
     * @param _proof ZK proof structure
     * @param _publicInputs Public inputs
     */
    function _verifyZKProof(
        ZKProof memory _proof,
        uint256[] memory _publicInputs
    ) internal view returns (bool) {
        // Simplified verification - in production use proper ZK verification libraries
        // This would involve elliptic curve operations and pairing checks
        
        // Basic sanity checks
        if (_proof.a[0] == 0 && _proof.a[1] == 0) return false;
        if (_proof.c[0] == 0 && _proof.c[1] == 0) return false;
        if (_publicInputs.length == 0) return false;
        
        // Hash the proof elements and public inputs for verification
        bytes32 proofHash = keccak256(abi.encodePacked(
            _proof.a[0], _proof.a[1],
            _proof.b[0][0], _proof.b[0][1], _proof.b[1][0], _proof.b[1][1],
            _proof.c[0], _proof.c[1],
            _publicInputs
        ));
        
        // Simple verification logic (replace with actual ZK verification)
        return uint256(proofHash) % 2 == 0; // Simplified for demo
    }
}