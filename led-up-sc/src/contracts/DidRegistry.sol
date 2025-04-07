// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

/**
 * @title DidRegistry
 * @notice Main contract for the DID registry with optimized gas usage
 */
contract DidRegistry {
    /*================ ERRORS =================*/
    error DidRegistry__Unauthorized();
    error DidRegistry__InvalidDID();
    error DidRegistry__DeactivatedDID();
    error DidRegistry__DIDAlreadyRegistered();

    /*================ STATE VARIABLES =================*/

    struct DIDDocument {
        address subject; // The controller/subject address
        uint40 lastUpdated; // Timestamp of last update
        bool active; // Active status flag
        string publicKey; // Public key string
        string document; // Document string
    }

    string private didMethod;

    // Primary storage - single mapping for all DID data
    mapping(bytes32 => DIDDocument) internal didData;
    mapping(address => bytes32) internal addressToDidHash;
    mapping(string => bytes32) internal didToHash;
    mapping(bytes32 => string) internal hashToDid;

    /*================ EVENTS =================*/
    event DIDRegistered(string did, address indexed controller);
    event DIDUpdated(string did, uint256 indexed timestamp);
    event DIDDeactivated(string did, uint256 indexed timestamp);

    /**
     * @notice registers a DID
     * @dev Most validation should be done off-chain before calling this function
     * @dev The DID format and address verification should be handled by the client
     * @param did The DID to register (should follow format did:method:network:address)
     * @param document The document to register
     * @param publicKey The public key for the DID
     */
    function registerDid(
        // address _address,
        // string calldata method,
        // string calldata network,
        string calldata did,
        string calldata document,
        string calldata publicKey
    ) public {
        // construct the did
        // bytes memory didBytes = abi.encodePacked("did:", method, ":", network, ":", _address);

        // Hash the DID for more efficient storage and comparison
        bytes32 didHash = keccak256(bytes(did));

        // Check if DID already exists - this must remain on-chain
        if (_exists(didHash)) {
            revert DidRegistry__DIDAlreadyRegistered();
        }

        // Check if sender already has a DID - this must remain on-chain
        bytes32 existingDidHash = addressToDidHash[msg.sender];

        if (existingDidHash != bytes32(0)) {
            // If sender already has a DID, it must match the one being registered

            if (existingDidHash != didHash) {
                revert DidRegistry__Unauthorized();
            }
        }

        // Store the DID data in a single storage slot
        didData[didHash] = DIDDocument({
            subject: msg.sender,
            lastUpdated: uint40(block.timestamp),
            active: true,
            publicKey: publicKey,
            document: document
        });

        // Set up reverse lookups
        addressToDidHash[msg.sender] = didHash;
        didToHash[did] = didHash;
        hashToDid[didHash] = did;

        emit DIDRegistered(did, msg.sender);
    }

    /**
     * @notice updates the document of a DID. Only the controller can update the document.
     * @param did The DID to update
     * @param newDocument The new document to update
     */
    function updateDidDocument(string calldata did, string calldata newDocument) public {
        bytes32 didHash = _getDidHash(did);

        // Check authorization and existence
        if (!_isController(didHash)) {
            revert DidRegistry__Unauthorized();
        }
        if (!_isActive(didHash)) {
            revert DidRegistry__DeactivatedDID();
        }

        // Update only the document field and timestamp
        DIDDocument storage data = didData[didHash];
        data.document = newDocument;
        data.lastUpdated = uint40(block.timestamp);

        emit DIDUpdated(did, block.timestamp);
    }

    /**
     * @notice updates the public key of a DID. Only the controller can update the public key.
     * @param did The DID to update
     * @param newPublicKey The new public key to update
     */
    function updateDidPublicKey(string calldata did, string calldata newPublicKey) public {
        bytes32 didHash = _getDidHash(did);

        // Check authorization and existence
        if (!_isController(didHash)) {
            revert DidRegistry__Unauthorized();
        }
        if (!_isActive(didHash)) {
            revert DidRegistry__DeactivatedDID();
        }

        // Update only the public key field and timestamp
        DIDDocument storage data = didData[didHash];
        data.publicKey = newPublicKey;
        data.lastUpdated = uint40(block.timestamp);

        emit DIDUpdated(did, block.timestamp);
    }

    /**
     * @notice deactivates a DID. Only the controller can deactivate the DID
     * @param did The DID to deactivate
     */
    function deactivateDid(string calldata did) public {
        bytes32 didHash = _getDidHash(did);

        // Check authorization and existence
        if (!_isController(didHash)) {
            revert DidRegistry__Unauthorized();
        }

        if (!_isActive(didHash)) {
            revert DidRegistry__DeactivatedDID();
        }

        // Update only the active status and timestamp
        DIDDocument storage data = didData[didHash];
        data.active = false;
        data.lastUpdated = uint40(block.timestamp);

        emit DIDDeactivated(did, block.timestamp);
    }

    /**
     * @notice reactivates a previously deactivated DID. Only the controller can reactivate the DID
     * @param did The DID to reactivate
     */
    function reactivateDid(string calldata did) public {
        bytes32 didHash = _getDidHash(did);

        // Check authorization and existence
        if (!_isController(didHash)) {
            revert DidRegistry__Unauthorized();
        }

        // Only proceed if DID is currently inactive
        if (_isActive(didHash)) {
            revert DidRegistry__Unauthorized();
        }

        // Update only the active status and timestamp
        DIDDocument storage data = didData[didHash];
        data.active = true;
        data.lastUpdated = uint40(block.timestamp);

        // Use a more appropriate event for reactivation
        emit DIDUpdated(did, block.timestamp);
    }

    /**
     * @notice Get the public key for a DID
     * @param did The DID to get the public key for
     * @return The public key
     */
    function getPublicKeyForDid(string calldata did) public view returns (string memory) {
        bytes32 didHash = _getDidHash(did);
        return _getPublicKey(didHash);
    }

    /**
     * @notice Get the subject for a DID
     * @param did The DID to get the subject for
     * @return The subject address
     */
    function getSubjectForDid(string calldata did) public view returns (address) {
        bytes32 didHash = _getDidHash(did);

        return _getSubject(didHash);
    }

    /**
     * @notice Get the document for a DID
     * @param did The DID to get the document for
     * @return The document
     */
    function getDocumentForDid(string calldata did) public view returns (string memory) {
        bytes32 didHash = _getDidHash(did);
        return _getDocument(didHash);
    }

    /**
     * @notice Check if a DID is active
     * @param did The DID to check
     * @return True if active, false otherwise
     */
    function isActiveForDid(string calldata did) public view returns (bool) {
        bytes32 didHash = _getDidHash(did);

        return _isActive(didHash);
    }

    /**
     * @notice Get the last updated timestamp for a DID
     * @param did The DID to get the last updated timestamp for
     * @return The last updated timestamp
     */
    function getLastUpdatedForDid(string calldata did) public view returns (uint256) {
        bytes32 didHash = _getDidHash(did);

        return _getLastUpdated(didHash);
    }

    /**
     * @notice resolves a DID
     * @param did The DID to resolve
     * @return The DID document (for backward compatibility)
     */
    function resolveDid(string calldata did) public view returns (DIDDocument memory) {
        bytes32 didHash = _getDidHash(did);

        DIDDocument memory data = didData[didHash];

        return DIDDocument({
            publicKey: data.publicKey,
            subject: data.subject,
            document: data.document,
            active: data.active,
            lastUpdated: data.lastUpdated
        });
    }

    /**
     * @notice converts an address to a DID
     * @param addr The address to convert
     * @return The DID associated with this address or empty string if none exists
     */
    function addressToDID(address addr) public view returns (string memory) {
        bytes32 didHash = addressToDidHash[addr];

        // If no DID hash is found for this address, return empty string
        if (didHash == bytes32(0)) {
            return "";
        }

        // Use the reverse mapping to get the DID string
        return hashToDid[didHash];
    }

    /**
     * @notice checks if a DID is active
     * @param did The DID to check
     * @return True if the DID is active, false otherwise
     */
    function isActive(string calldata did) public view returns (bool) {
        return isActiveForDid(did);
    }

    /**
     * @notice gets the last updated timestamp of a DID
     * @param did The DID to get the last updated timestamp
     * @return The last updated timestamp
     */
    function getLastUpdated(string calldata did) public view returns (uint256) {
        return getLastUpdatedForDid(did);
    }

    /**
     * @notice gets the controller of a DID
     * @param did The DID to get the controller
     * @return The controller of the DID
     */
    function getController(string calldata did) public view returns (address) {
        return getSubjectForDid(did);
    }

    /**
     * @notice gets the document of a DID
     * @param did The DID to get the document
     * @return The document of the DID
     */
    function getDocument(string calldata did) public view returns (string memory) {
        return getDocumentForDid(did);
    }

    /**
     * @notice gets the public key of a DID
     * @param did The DID to get the public key
     * @return The public key of the DID
     */
    function getPublicKey(string calldata did) public view returns (string memory) {
        return getPublicKeyForDid(did);
    }

    /**
     * @notice gets the subject of a DID
     * @param did The DID to get the subject
     * @return The subject of the DID
     */
    function getSubject(string calldata did) public view returns (address) {
        return getSubjectForDid(did);
    }

    /*================ INTERNAL FUNCTIONS =================*/
    /**
     * @notice Helper function to get the DID hash from a DID string
     * @param did The DID string
     * @return The DID hash
     */
    function _getDidHash(string calldata did) internal view returns (bytes32) {
        bytes32 didHash = didToHash[did];

        if (didData[didHash].subject == address(0)) {
            revert DidRegistry__InvalidDID();
        }
        return didHash;
    }

    /**
     * @notice Helper function to get the public key for a DID hash
     * @param didHash The DID hash
     * @return The public key
     */
    function _getPublicKey(bytes32 didHash) internal view returns (string memory) {
        return didData[didHash].publicKey;
    }

    /**
     * @notice Helper function to get the document for a DID hash
     * @param didHash The DID hash
     * @return The document
     */
    function _getDocument(bytes32 didHash) internal view returns (string memory) {
        return didData[didHash].document;
    }

    /**
     * @notice Helper function to get the subject for a DID hash
     * @param didHash The DID hash
     * @return The subject address
     */
    function _getSubject(bytes32 didHash) internal view returns (address) {
        return didData[didHash].subject;
    }

    /**
     * @notice Helper function to check if a DID hash is active
     * @param didHash The DID hash
     * @return True if active, false otherwise
     */
    function _isActive(bytes32 didHash) internal view returns (bool) {
        return didData[didHash].active;
    }

    /**
     * @notice Helper function to get the last updated timestamp for a DID hash
     * @param didHash The DID hash
     * @return The last updated timestamp
     */
    function _getLastUpdated(bytes32 didHash) internal view returns (uint256) {
        return uint256(didData[didHash].lastUpdated);
    }

    /**
     * @notice Helper function to check if the caller is the controller of a DID
     * @param didHash The DID hash
     * @return True if the caller is the controller, false otherwise
     */
    function _isController(bytes32 didHash) internal view returns (bool) {
        return addressToDidHash[msg.sender] == didHash;
    }

    /**
     * @notice Helper function to check if a DID exists
     * @param didHash The DID hash
     * @return True if the DID exists, false otherwise
     */
    function _exists(bytes32 didHash) internal view returns (bool) {
        return didData[didHash].subject != address(0);
    }
}
