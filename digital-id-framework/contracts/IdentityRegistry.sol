// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";

/**
 * @title IdentityRegistry
 * @dev Main contract for managing decentralized identities with privacy features
 */
contract IdentityRegistry is Ownable, Pausable {
    using ECDSA for bytes32;

    // Events
    event IdentityCreated(address indexed owner, bytes32 indexed did);
    event IdentityUpdated(address indexed owner, bytes32 indexed did);
    event IdentityRevoked(address indexed owner, bytes32 indexed did);
    event CredentialIssued(bytes32 indexed did, bytes32 indexed credentialHash, address issuer);
    event CredentialRevoked(bytes32 indexed credentialHash, address issuer);
    event ControllerAdded(bytes32 indexed did, address indexed controller);
    event ControllerRemoved(bytes32 indexed did, address indexed controller);

    // Structs
    struct Identity {
        bytes32 did;
        address owner;
        bool active;
        uint256 createdAt;
        uint256 updatedAt;
        string ipfsHash; // Encrypted identity data stored on IPFS
        mapping(address => bool) controllers;
        mapping(bytes32 => Credential) credentials;
    }

    struct Credential {
        bytes32 hash;
        address issuer;
        bool active;
        uint256 issuedAt;
        uint256 expiresAt;
        string ipfsHash; // Encrypted credential data
    }

    // State variables
    mapping(bytes32 => Identity) public identities;
    mapping(address => bytes32) public ownerToDid;
    mapping(bytes32 => bool) public didExists;
    mapping(address => bool) public trustedIssuers;
    
    uint256 public identityCount;
    uint256 public constant MIN_CONTROLLERS = 1;
    uint256 public constant MAX_CONTROLLERS = 10;

    // Modifiers
    modifier onlyIdentityOwner(bytes32 _did) {
        require(identities[_did].owner == msg.sender, "Not identity owner");
        _;
    }

    modifier onlyController(bytes32 _did) {
        require(
            identities[_did].owner == msg.sender || 
            identities[_did].controllers[msg.sender],
            "Not authorized controller"
        );
        _;
    }

    modifier identityActive(bytes32 _did) {
        require(identities[_did].active, "Identity not active");
        _;
    }

    modifier onlyTrustedIssuer() {
        require(trustedIssuers[msg.sender], "Not a trusted issuer");
        _;
    }

    constructor() {
        // Constructor logic
    }

    /**
     * @dev Create a new identity
     * @param _did Decentralized identifier
     * @param _ipfsHash IPFS hash of encrypted identity data
     */
    function createIdentity(
        bytes32 _did,
        string memory _ipfsHash
    ) external whenNotPaused {
        require(!didExists[_did], "DID already exists");
        require(ownerToDid[msg.sender] == bytes32(0), "Identity already exists for this address");

        Identity storage newIdentity = identities[_did];
        newIdentity.did = _did;
        newIdentity.owner = msg.sender;
        newIdentity.active = true;
        newIdentity.createdAt = block.timestamp;
        newIdentity.updatedAt = block.timestamp;
        newIdentity.ipfsHash = _ipfsHash;

        ownerToDid[msg.sender] = _did;
        didExists[_did] = true;
        identityCount++;

        emit IdentityCreated(msg.sender, _did);
    }

    /**
     * @dev Update identity data
     * @param _did Decentralized identifier
     * @param _newIpfsHash New IPFS hash of encrypted identity data
     */
    function updateIdentity(
        bytes32 _did,
        string memory _newIpfsHash
    ) external onlyController(_did) identityActive(_did) whenNotPaused {
        Identity storage identity = identities[_did];
        identity.ipfsHash = _newIpfsHash;
        identity.updatedAt = block.timestamp;

        emit IdentityUpdated(identity.owner, _did);
    }

    /**
     * @dev Add a controller to an identity
     * @param _did Decentralized identifier
     * @param _controller Address of the new controller
     */
    function addController(
        bytes32 _did,
        address _controller
    ) external onlyIdentityOwner(_did) identityActive(_did) {
        require(_controller != address(0), "Invalid controller address");
        require(!identities[_did].controllers[_controller], "Controller already exists");

        identities[_did].controllers[_controller] = true;

        emit ControllerAdded(_did, _controller);
    }

    /**
     * @dev Remove a controller from an identity
     * @param _did Decentralized identifier
     * @param _controller Address of the controller to remove
     */
    function removeController(
        bytes32 _did,
        address _controller
    ) external onlyIdentityOwner(_did) identityActive(_did) {
        require(identities[_did].controllers[_controller], "Controller does not exist");

        delete identities[_did].controllers[_controller];

        emit ControllerRemoved(_did, _controller);
    }

    /**
     * @dev Issue a verifiable credential
     * @param _did DID to issue credential to
     * @param _credentialHash Hash of the credential
     * @param _expiresAt Expiration timestamp
     * @param _ipfsHash IPFS hash of encrypted credential data
     */
    function issueCredential(
        bytes32 _did,
        bytes32 _credentialHash,
        uint256 _expiresAt,
        string memory _ipfsHash
    ) external onlyTrustedIssuer identityActive(_did) whenNotPaused {
        require(didExists[_did], "DID does not exist");
        require(_expiresAt > block.timestamp, "Invalid expiration");

        Credential storage credential = identities[_did].credentials[_credentialHash];
        require(!credential.active, "Credential already exists");

        credential.hash = _credentialHash;
        credential.issuer = msg.sender;
        credential.active = true;
        credential.issuedAt = block.timestamp;
        credential.expiresAt = _expiresAt;
        credential.ipfsHash = _ipfsHash;

        emit CredentialIssued(_did, _credentialHash, msg.sender);
    }

    /**
     * @dev Revoke a credential
     * @param _did DID that owns the credential
     * @param _credentialHash Hash of the credential to revoke
     */
    function revokeCredential(
        bytes32 _did,
        bytes32 _credentialHash
    ) external whenNotPaused {
        Credential storage credential = identities[_did].credentials[_credentialHash];
        require(credential.active, "Credential not active");
        require(
            credential.issuer == msg.sender || 
            identities[_did].owner == msg.sender,
            "Not authorized to revoke"
        );

        credential.active = false;

        emit CredentialRevoked(_credentialHash, msg.sender);
    }

    /**
     * @dev Revoke an identity
     * @param _did Decentralized identifier
     */
    function revokeIdentity(bytes32 _did) external onlyIdentityOwner(_did) {
        Identity storage identity = identities[_did];
        identity.active = false;
        identity.updatedAt = block.timestamp;

        delete ownerToDid[msg.sender];

        emit IdentityRevoked(msg.sender, _did);
    }

    /**
     * @dev Add a trusted issuer
     * @param _issuer Address of the issuer
     */
    function addTrustedIssuer(address _issuer) external onlyOwner {
        require(_issuer != address(0), "Invalid issuer address");
        trustedIssuers[_issuer] = true;
    }

    /**
     * @dev Remove a trusted issuer
     * @param _issuer Address of the issuer
     */
    function removeTrustedIssuer(address _issuer) external onlyOwner {
        trustedIssuers[_issuer] = false;
    }

    /**
     * @dev Verify if a credential is valid
     * @param _did DID that owns the credential
     * @param _credentialHash Hash of the credential
     */
    function verifyCredential(
        bytes32 _did,
        bytes32 _credentialHash
    ) external view returns (bool isValid, address issuer, uint256 expiresAt) {
        Credential memory credential = identities[_did].credentials[_credentialHash];
        
        isValid = credential.active && 
                  identities[_did].active && 
                  credential.expiresAt > block.timestamp;
        issuer = credential.issuer;
        expiresAt = credential.expiresAt;
    }

    /**
     * @dev Get identity information
     * @param _did Decentralized identifier
     */
    function getIdentity(bytes32 _did) external view returns (
        address owner,
        bool active,
        uint256 createdAt,
        uint256 updatedAt,
        string memory ipfsHash
    ) {
        Identity storage identity = identities[_did];
        return (
            identity.owner,
            identity.active,
            identity.createdAt,
            identity.updatedAt,
            identity.ipfsHash
        );
    }

    /**
     * @dev Check if an address is a controller for a DID
     * @param _did Decentralized identifier
     * @param _controller Address to check
     */
    function isController(bytes32 _did, address _controller) external view returns (bool) {
        return identities[_did].controllers[_controller];
    }

    /**
     * @dev Pause contract
     */
    function pause() external onlyOwner {
        _pause();
    }

    /**
     * @dev Unpause contract
     */
    function unpause() external onlyOwner {
        _unpause();
    }
}