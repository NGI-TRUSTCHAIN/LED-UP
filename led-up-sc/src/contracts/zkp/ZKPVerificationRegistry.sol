// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

/**
 * @title ZKPVerificationRegistry
 * @dev Registry for storing ZKP verification results
 * This contract follows an offchain-first approach where verification is performed
 * by Azure Functions and only the results are stored on-chain.
 */
contract ZKPVerificationRegistry {
    /*===================== ERRORS ======================*/
    error ZKPVerificationRegistry__Unauthorized();
    error ZKPVerificationRegistry__InvalidVerificationType();
    error ZKPVerificationRegistry__VerificationNotFound();
    error ZKPVerificationRegistry__VerificationExpired();
    error ZKPVerificationRegistry__VerificationRevoked();
    error ZKPVerificationRegistry__InvalidExpirationTime();
    error ZKPVerificationRegistry__InvalidVerifierAddress();
    error ZKPVerificationRegistry__VerifierAlreadyRegistered();
    error ZKPVerificationRegistry__VerifierNotRegistered();
    error ZKPVerificationRegistry__CallerNotAdmin();
    error ZKPVerificationRegistry__CallerNotOwner();

    /*===================== STRUCTS ======================*/

    /// @dev Verification result stored on-chain
    struct VerificationResult {
        address subject; // Address of the subject being verified
        bytes32 verificationType; // Type of verification (e.g., "age", "hash", "fhir")
        bytes32 verificationId; // Unique identifier for this verification
        uint256 timestamp; // When the verification was performed
        uint256 expirationTime; // When the verification expires (0 = never)
        bool result; // Result of the verification
        bool revoked; // Whether the verification has been revoked
        bytes metadata; // Additional metadata about the verification
    }

    /*===================== VARIABLES ======================*/

    /// @dev Mapping from verification ID to verification result
    mapping(bytes32 => VerificationResult) private verificationResults;

    /// @dev Mapping from subject address to their verification IDs
    mapping(address => bytes32[]) private subjectVerifications;

    /// @dev Mapping of authorized verifiers by verification type
    mapping(bytes32 => mapping(address => bool)) private authorizedVerifiers;

    /// @dev Mapping of administrators
    mapping(address => bool) private administrators;

    /// @dev Owner of the contract
    address private immutable owner;

    /*===================== EVENTS ======================*/

    /// @dev Emitted when a new verification result is registered
    event VerificationRegistered(
        bytes32 indexed verificationId,
        address indexed subject,
        bytes32 indexed verificationType,
        bool result,
        uint256 timestamp,
        uint256 expirationTime
    );

    /// @dev Emitted when a verification is revoked
    event VerificationRevoked(bytes32 indexed verificationId, address indexed revokedBy, uint256 timestamp);

    /// @dev Emitted when a verifier is authorized
    event VerifierAuthorized(address indexed verifier, bytes32 indexed verificationType, address indexed authorizedBy);

    /// @dev Emitted when a verifier's authorization is revoked
    event VerifierAuthorizationRevoked(
        address indexed verifier, bytes32 indexed verificationType, address indexed revokedBy
    );

    /// @dev Emitted when an administrator is added
    event AdministratorAdded(address indexed admin, address indexed addedBy);

    /// @dev Emitted when an administrator is removed
    event AdministratorRemoved(address indexed admin, address indexed removedBy);

    /*===================== MODIFIERS ======================*/

    /// @dev Ensures the caller is the owner
    modifier onlyOwner() {
        if (msg.sender != owner) revert ZKPVerificationRegistry__CallerNotOwner();
        _;
    }

    /// @dev Ensures the caller is an administrator or the owner
    modifier onlyAdmin() {
        if (!administrators[msg.sender] && msg.sender != owner) {
            revert ZKPVerificationRegistry__CallerNotAdmin();
        }
        _;
    }

    /// @dev Ensures the caller is authorized to perform verifications of the specified type
    modifier onlyAuthorizedVerifier(bytes32 verificationType) {
        if (!authorizedVerifiers[verificationType][msg.sender] && !administrators[msg.sender] && msg.sender != owner) {
            revert ZKPVerificationRegistry__Unauthorized();
        }
        _;
    }

    /*===================== CONSTRUCTOR ======================*/

    /**
     * @dev Constructor
     */
    constructor() {
        owner = msg.sender;
        administrators[msg.sender] = true;
    }

    /*===================== EXTERNAL FUNCTIONS ======================*/

    /**
     * @dev Registers a new verification result
     * @param subject Address of the subject being verified
     * @param verificationType Type of verification
     * @param verificationId Unique identifier for this verification
     * @param result Result of the verification
     * @param expirationTime When the verification expires (0 = never)
     * @param metadata Additional metadata about the verification
     */
    function registerVerification(
        address subject,
        bytes32 verificationType,
        bytes32 verificationId,
        bool result,
        uint256 expirationTime,
        bytes calldata metadata
    ) external onlyAuthorizedVerifier(verificationType) {
        if (expirationTime != 0 && expirationTime <= block.timestamp) {
            revert ZKPVerificationRegistry__InvalidExpirationTime();
        }

        VerificationResult storage verification = verificationResults[verificationId];
        verification.subject = subject;
        verification.verificationType = verificationType;
        verification.verificationId = verificationId;
        verification.timestamp = block.timestamp;
        verification.expirationTime = expirationTime;
        verification.result = result;
        verification.revoked = false;
        verification.metadata = metadata;

        subjectVerifications[subject].push(verificationId);

        emit VerificationRegistered(verificationId, subject, verificationType, result, block.timestamp, expirationTime);
    }

    /**
     * @dev Revokes a verification
     * @param verificationId ID of the verification to revoke
     */
    function revokeVerification(bytes32 verificationId) external onlyAdmin {
        VerificationResult storage verification = verificationResults[verificationId];

        if (verification.verificationId == bytes32(0)) {
            revert ZKPVerificationRegistry__VerificationNotFound();
        }

        verification.revoked = true;

        emit VerificationRevoked(verificationId, msg.sender, block.timestamp);
    }

    /**
     * @dev Authorizes a verifier for a specific verification type
     * @param verifier Address of the verifier
     * @param verificationType Type of verification
     */
    function authorizeVerifier(address verifier, bytes32 verificationType) external onlyAdmin {
        if (verifier == address(0)) revert ZKPVerificationRegistry__InvalidVerifierAddress();
        if (authorizedVerifiers[verificationType][verifier]) {
            revert ZKPVerificationRegistry__VerifierAlreadyRegistered();
        }

        authorizedVerifiers[verificationType][verifier] = true;

        emit VerifierAuthorized(verifier, verificationType, msg.sender);
    }

    /**
     * @dev Revokes a verifier's authorization for a specific verification type
     * @param verifier Address of the verifier
     * @param verificationType Type of verification
     */
    function revokeVerifierAuthorization(address verifier, bytes32 verificationType) external onlyAdmin {
        if (!authorizedVerifiers[verificationType][verifier]) {
            revert ZKPVerificationRegistry__VerifierNotRegistered();
        }

        authorizedVerifiers[verificationType][verifier] = false;

        emit VerifierAuthorizationRevoked(verifier, verificationType, msg.sender);
    }

    /**
     * @dev Adds an administrator
     * @param admin Address of the administrator to add
     */
    function addAdministrator(address admin) external onlyOwner {
        if (administrators[admin]) revert ZKPVerificationRegistry__VerifierAlreadyRegistered();

        administrators[admin] = true;

        emit AdministratorAdded(admin, msg.sender);
    }

    /**
     * @dev Removes an administrator
     * @param admin Address of the administrator to remove
     */
    function removeAdministrator(address admin) external onlyOwner {
        if (!administrators[admin]) revert ZKPVerificationRegistry__VerifierNotRegistered();
        if (admin == owner) revert ZKPVerificationRegistry__Unauthorized();

        administrators[admin] = false;

        emit AdministratorRemoved(admin, msg.sender);
    }

    /*===================== VIEW FUNCTIONS ======================*/

    /**
     * @dev Gets a verification result
     * @param verificationId ID of the verification
     * @return The verification result
     */
    function getVerification(bytes32 verificationId) external view returns (VerificationResult memory) {
        VerificationResult memory verification = verificationResults[verificationId];

        if (verification.verificationId == bytes32(0)) {
            revert ZKPVerificationRegistry__VerificationNotFound();
        }

        return verification;
    }

    /**
     * @dev Checks if a verification is valid
     * @param verificationId ID of the verification
     * @return True if the verification is valid, false otherwise
     */
    function isVerificationValid(bytes32 verificationId) external view returns (bool) {
        VerificationResult memory verification = verificationResults[verificationId];

        if (verification.verificationId == bytes32(0)) {
            return false;
        }

        if (verification.revoked) {
            return false;
        }

        if (verification.expirationTime != 0 && verification.expirationTime <= block.timestamp) {
            return false;
        }

        return verification.result;
    }

    /**
     * @dev Gets all verifications for a subject
     * @param subject Address of the subject
     * @return Array of verification IDs
     */
    function getSubjectVerifications(address subject) external view returns (bytes32[] memory) {
        return subjectVerifications[subject];
    }

    /**
     * @dev Checks if a verifier is authorized for a specific verification type
     * @param verifier Address of the verifier
     * @param verificationType Type of verification
     * @return True if the verifier is authorized, false otherwise
     */
    function isVerifierAuthorized(address verifier, bytes32 verificationType) external view returns (bool) {
        return authorizedVerifiers[verificationType][verifier] || administrators[verifier] || verifier == owner;
    }

    /**
     * @dev Checks if an address is an administrator
     * @param admin Address to check
     * @return True if the address is an administrator, false otherwise
     */
    function isAdministrator(address admin) external view returns (bool) {
        return administrators[admin] || admin == owner;
    }
}
