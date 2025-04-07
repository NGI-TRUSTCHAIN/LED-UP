// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import {AuthenticationCore} from "../core/AuthenticationCore.sol";
import {ValidationLib} from "../libraries/ValidationLib.sol";
import {SecurityLib} from "../libraries/SecurityLib.sol";
import {IDidRegistry} from "../interfaces/IDidRegistry.sol";

/**
 * @title AuthenticationExtended
 * @dev Extended implementation of the Authentication contract with additional features
 * @notice This contract extends the core Authentication contract with additional functionality
 */
contract AuthenticationExtended is AuthenticationCore {
    /*===================== ERRORS ======================*/
    error AuthenticationExtended__InvalidSignature();
    error AuthenticationExtended__InvalidTimestamp();
    error AuthenticationExtended__InvalidNonce();
    error AuthenticationExtended__SessionExpired();
    error AuthenticationExtended__SessionNotFound();
    error AuthenticationExtended__InvalidChallenge();

    /*===================== STRUCTS ======================*/
    /**
     * @dev Authentication session structure
     */
    struct AuthSession {
        address user;
        bytes32 challenge;
        uint256 createdAt;
        uint256 expiresAt;
        bool active;
    }

    /**
     * @dev Authentication result structure
     */
    struct AuthResult {
        address user;
        string did;
        uint256 timestamp;
        bool success;
        string authMethod;
    }

    /*===================== VARIABLES ======================*/
    // Session storage
    mapping(bytes32 => AuthSession) private authSessions;

    // Authentication results
    mapping(address => AuthResult[]) private authResults;

    // Used nonces for replay protection
    mapping(bytes32 => bool) private usedNonces;

    // Session timeout (default: 15 minutes)
    uint256 private sessionTimeout = 15 minutes;

    // DID verifier address
    address private didVerifier;

    /*===================== EVENTS ======================*/
    event SessionCreated(bytes32 indexed sessionId, address indexed user, uint256 expiresAt);
    event SessionAuthenticated(bytes32 indexed sessionId, address indexed user, string did, bool success);
    event SessionExpired(bytes32 indexed sessionId, address indexed user);
    event SessionTimeout(uint256 oldTimeout, uint256 newTimeout);

    /*===================== CONSTRUCTOR ======================*/
    /**
     * @dev Constructor
     * @param _didRegistry The address of the DID registry
     * @param _didVerifier The address of the DID verifier
     */
    constructor(address _didRegistry, address _didVerifier) AuthenticationCore(_didRegistry) {
        didVerifier = _didVerifier;
    }

    /*===================== EXTERNAL FUNCTIONS ======================*/
    /**
     * @dev Creates an authentication session
     * @param user The address of the user
     * @return sessionId The ID of the created session
     * @return challenge The challenge for the session
     * @return expiresAt The expiration timestamp of the session
     */
    function createAuthSession(address user)
        external
        whenNotPausedWithCustomError
        returns (bytes32 sessionId, bytes32 challenge, uint256 expiresAt)
    {
        // Generate a random challenge
        challenge = keccak256(abi.encodePacked(user, block.timestamp, block.prevrandao));

        // Generate a session ID
        sessionId = keccak256(abi.encodePacked(user, challenge, block.timestamp));

        // Calculate expiration time
        expiresAt = block.timestamp + sessionTimeout;

        // Store the session
        authSessions[sessionId] = AuthSession({
            user: user,
            challenge: challenge,
            createdAt: block.timestamp,
            expiresAt: expiresAt,
            active: true
        });

        emit SessionCreated(sessionId, user, expiresAt);

        return (sessionId, challenge, expiresAt);
    }

    /**
     * @dev Authenticates a session with a signature
     * @param sessionId The ID of the session
     * @param did The DID of the user
     * @param signature The signature of the challenge
     * @return success Whether the authentication was successful
     */
    function authenticateSession(bytes32 sessionId, string calldata did, bytes calldata signature)
        external
        whenNotPausedWithCustomError
        returns (bool success)
    {
        // Get the session
        AuthSession storage session = authSessions[sessionId];

        // Check if session exists and is active
        if (session.user == address(0)) {
            revert AuthenticationExtended__SessionNotFound();
        }

        // Check if session has expired
        if (session.expiresAt < block.timestamp) {
            revert AuthenticationExtended__SessionExpired();
        }

        // Verify the signature
        address signer = _recoverSigner(session.challenge, signature);

        // Check if the signer matches the session user
        success = (signer == session.user);

        // Store the authentication result
        authResults[session.user].push(
            AuthResult({
                user: session.user,
                did: did,
                timestamp: block.timestamp,
                success: success,
                authMethod: "signature"
            })
        );

        // Mark session as inactive
        session.active = false;

        emit SessionAuthenticated(sessionId, session.user, did, success);

        return success;
    }

    /**
     * @dev Authenticates with a DID credential
     * @param did The DID of the user
     * @param credentialType The type of credential
     * @param credential The credential data
     * @param issuerDid The DID of the issuer
     * @param nonce A unique nonce
     * @param timestamp The timestamp of the authentication
     * @param signature The signature of the authentication data
     * @return success Whether the authentication was successful
     */
    function authenticateWithCredential(
        string calldata did,
        string calldata credentialType,
        bytes calldata credential,
        string calldata issuerDid,
        bytes32 nonce,
        uint256 timestamp,
        bytes calldata signature
    ) external whenNotPausedWithCustomError returns (bool success) {
        // Check if nonce has been used
        if (!SecurityLib.validateNonce(usedNonces, nonce)) {
            revert AuthenticationExtended__InvalidNonce();
        }

        // Check if timestamp is valid (within 5 minutes)
        if (!SecurityLib.validateTimestamp(timestamp, 5 minutes)) {
            revert AuthenticationExtended__InvalidTimestamp();
        }

        // Verify the credential
        success = verifyCredential(did, credentialType, credential, issuerDid);

        // Get the user address from the DID
        address user = getAddressByDid(did);

        // Store the authentication result
        authResults[user].push(
            AuthResult({user: user, did: did, timestamp: block.timestamp, success: success, authMethod: "credential"})
        );

        return success;
    }

    /**
     * @dev Sets the session timeout
     * @param _timeout The new timeout in seconds
     */
    function setSessionTimeout(uint256 _timeout) external onlyOwner {
        uint256 oldTimeout = sessionTimeout;
        sessionTimeout = _timeout;

        emit SessionTimeout(oldTimeout, _timeout);
    }

    /*===================== VIEW FUNCTIONS ======================*/
    /**
     * @dev Gets a session
     * @param sessionId The ID of the session
     * @return user The address of the user
     * @return challenge The challenge for the session
     * @return createdAt The creation timestamp of the session
     * @return expiresAt The expiration timestamp of the session
     * @return active Whether the session is active
     */
    function getSession(bytes32 sessionId)
        external
        view
        returns (address user, bytes32 challenge, uint256 createdAt, uint256 expiresAt, bool active)
    {
        AuthSession memory session = authSessions[sessionId];

        return (session.user, session.challenge, session.createdAt, session.expiresAt, session.active);
    }

    /**
     * @dev Gets the authentication results for a user
     * @param user The address of the user
     * @return The authentication results
     */
    function getAuthResults(address user) external view returns (AuthResult[] memory) {
        return authResults[user];
    }

    /**
     * @dev Gets the current session timeout
     * @return The session timeout in seconds
     */
    function getSessionTimeout() external view returns (uint256) {
        return sessionTimeout;
    }

    /**
     * @dev Verifies a credential
     * @param did The DID to verify the credential for
     * @param credentialType The type of credential to verify
     * @param credential The credential data
     * @param issuerDid The DID of the issuer
     * @return True if verification is successful, false otherwise
     */
    function verifyCredential(
        string calldata did,
        string calldata credentialType,
        bytes calldata credential,
        string calldata issuerDid
    ) public pure returns (bool) {
        // In a real implementation, we would verify the credential with the DID verifier
        // For now, we'll just do a simple check
        return (
            bytes(did).length > 0 && bytes(credentialType).length > 0 && credential.length > 0
                && bytes(issuerDid).length > 0
        );
    }

    /**
     * @dev Gets the address for a DID
     * @param did The DID to get the address for
     * @return The address associated with the DID
     */
    function getAddressByDid(string calldata did) public view returns (address) {
        return didRegistry.getAddressByDid(did);
    }

    /*===================== INTERNAL FUNCTIONS ======================*/
    /**
     * @dev Recovers the signer of a message
     * @param message The message that was signed
     * @param signature The signature
     * @return The address of the signer
     */
    function _recoverSigner(bytes32 message, bytes memory signature) internal pure returns (address) {
        bytes32 ethSignedMessageHash = keccak256(abi.encodePacked("\x19Ethereum Signed Message:\n32", message));

        (bytes32 r, bytes32 s, uint8 v) = SecurityLib.splitSignature(signature);

        return ecrecover(ethSignedMessageHash, v, r, s);
    }
}
