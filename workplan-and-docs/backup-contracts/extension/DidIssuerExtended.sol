// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import {DidIssuerCore} from "../core/DidIssuerCore.sol";
import {ValidationLib} from "../libraries/ValidationLib.sol";
import {SecurityLib} from "../libraries/SecurityLib.sol";
import {IDidRegistry} from "../interfaces/IDidRegistry.sol";

/**
 * @title DidIssuerExtended
 * @dev Extended implementation of the DID Issuer contract with additional features
 * @notice This contract extends the core DID Issuer contract with additional functionality
 */
contract DidIssuerExtended is DidIssuerCore {
    /*===================== ERRORS ======================*/
    error DidIssuerExtended__InvalidSignature();
    error DidIssuerExtended__InvalidTimestamp();
    error DidIssuerExtended__InvalidNonce();
    error DidIssuerExtended__InvalidTemplate();
    error DidIssuerExtended__TemplateAlreadyExists();
    error DidIssuerExtended__TemplateNotFound();

    /*===================== STRUCTS ======================*/
    /**
     * @dev Credential template structure
     */
    struct CredentialTemplate {
        string templateId;
        string credentialType;
        string name;
        string description;
        string[] requiredFields;
        uint256 createdAt;
        bool active;
    }

    /*===================== VARIABLES ======================*/
    // Credential templates
    mapping(string => CredentialTemplate) private credentialTemplates;
    string[] private templateIds;

    // Used nonces for replay protection
    mapping(bytes32 => bool) private usedNonces;

    // DID registry interface
    IDidRegistry private didRegistryInterface;

    /*===================== EVENTS ======================*/
    event CredentialTemplateCreated(string indexed templateId, string credentialType, uint256 timestamp);
    event CredentialTemplateUpdated(string indexed templateId, uint256 timestamp);
    event CredentialTemplateDeactivated(string indexed templateId, uint256 timestamp);
    event CredentialIssuedWithSignature(
        string indexed did, string credentialType, bytes32 indexed credentialId, uint256 timestamp
    );

    /*===================== CONSTRUCTOR ======================*/
    /**
     * @dev Constructor
     * @param _didRegistry The address of the DID registry
     */
    constructor(address _didRegistry) DidIssuerCore(_didRegistry) {
        didRegistryInterface = IDidRegistry(_didRegistry);
    }

    /*===================== EXTERNAL FUNCTIONS ======================*/
    /**
     * @dev Issues a credential with a signature
     * @param did The DID to issue the credential to
     * @param credentialType The type of credential
     * @param credentialData The credential data
     * @param expirationDate The expiration date of the credential
     * @param nonce A unique nonce
     * @param timestamp The timestamp of the issuance
     * @param signature The signature of the issuance data
     * @return credentialId The ID of the issued credential
     */
    function issueCredentialWithSignature(
        string calldata did,
        string calldata credentialType,
        bytes calldata credentialData,
        uint256 expirationDate,
        bytes32 nonce,
        uint256 timestamp,
        bytes calldata signature
    ) external whenNotPausedWithCustomError didExists(did) returns (bytes32 credentialId) {
        // Check if nonce has been used
        if (usedNonces[nonce]) revert DidIssuerExtended__InvalidNonce();
        usedNonces[nonce] = true;

        // Check if timestamp is valid (within 5 minutes)
        if (!SecurityLib.validateTimestamp(timestamp, 5 minutes)) {
            revert DidIssuerExtended__InvalidTimestamp();
        }

        // Create message hash
        bytes32 messageHash =
            keccak256(abi.encodePacked(did, credentialType, credentialData, expirationDate, nonce, timestamp));

        // Get the controller address
        address controller = didRegistryInterface.getAddressByDid(did);

        // Verify signature
        if (!SecurityLib.validateSignature(messageHash, signature, controller)) {
            revert DidIssuerExtended__InvalidSignature();
        }

        // Issue credential
        credentialId = issueCredential(did, credentialType, credentialData, expirationDate);

        emit CredentialIssuedWithSignature(did, credentialType, credentialId, block.timestamp);

        return credentialId;
    }

    /**
     * @dev Creates a credential template
     * @param templateId The ID of the template
     * @param credentialType The type of credential
     * @param name The name of the template
     * @param description The description of the template
     * @param requiredFields The required fields for the template
     */
    function createCredentialTemplate(
        string calldata templateId,
        string calldata credentialType,
        string calldata name,
        string calldata description,
        string[] calldata requiredFields
    ) external onlyOwner {
        if (bytes(templateId).length == 0) revert DidIssuerExtended__InvalidTemplate();
        if (bytes(credentialTemplates[templateId].templateId).length > 0) {
            revert DidIssuerExtended__TemplateAlreadyExists();
        }

        credentialTemplates[templateId] = CredentialTemplate({
            templateId: templateId,
            credentialType: credentialType,
            name: name,
            description: description,
            requiredFields: requiredFields,
            createdAt: block.timestamp,
            active: true
        });

        templateIds.push(templateId);

        // Add credential type if it doesn't exist
        addCredentialType(credentialType);

        emit CredentialTemplateCreated(templateId, credentialType, block.timestamp);
    }

    /**
     * @dev Updates a credential template
     * @param templateId The ID of the template
     * @param name The updated name
     * @param description The updated description
     * @param requiredFields The updated required fields
     */
    function updateCredentialTemplate(
        string calldata templateId,
        string calldata name,
        string calldata description,
        string[] calldata requiredFields
    ) external onlyOwner {
        if (bytes(credentialTemplates[templateId].templateId).length == 0) {
            revert DidIssuerExtended__TemplateNotFound();
        }

        CredentialTemplate storage template = credentialTemplates[templateId];
        template.name = name;
        template.description = description;
        template.requiredFields = requiredFields;

        emit CredentialTemplateUpdated(templateId, block.timestamp);
    }

    /**
     * @dev Deactivates a credential template
     * @param templateId The ID of the template
     */
    function deactivateCredentialTemplate(string calldata templateId) external onlyOwner {
        if (bytes(credentialTemplates[templateId].templateId).length == 0) {
            revert DidIssuerExtended__TemplateNotFound();
        }

        credentialTemplates[templateId].active = false;

        emit CredentialTemplateDeactivated(templateId, block.timestamp);
    }

    /**
     * @dev Activates a credential template
     * @param templateId The ID of the template
     */
    function activateCredentialTemplate(string calldata templateId) external onlyOwner {
        if (bytes(credentialTemplates[templateId].templateId).length == 0) {
            revert DidIssuerExtended__TemplateNotFound();
        }

        credentialTemplates[templateId].active = true;
    }

    /*===================== VIEW FUNCTIONS ======================*/
    /**
     * @dev Gets a credential template
     * @param templateId The ID of the template
     * @return credentialType The type of credential
     * @return name The name of the template
     * @return description The description of the template
     * @return requiredFields The required fields for the template
     * @return createdAt The timestamp of creation
     * @return active Whether the template is active
     */
    function getCredentialTemplate(string calldata templateId)
        external
        view
        returns (
            string memory credentialType,
            string memory name,
            string memory description,
            string[] memory requiredFields,
            uint256 createdAt,
            bool active
        )
    {
        if (bytes(credentialTemplates[templateId].templateId).length == 0) {
            revert DidIssuerExtended__TemplateNotFound();
        }

        CredentialTemplate memory template = credentialTemplates[templateId];

        return (
            template.credentialType,
            template.name,
            template.description,
            template.requiredFields,
            template.createdAt,
            template.active
        );
    }

    /**
     * @dev Gets all template IDs
     * @return The list of template IDs
     */
    function getTemplateIds() external view returns (string[] memory) {
        return templateIds;
    }

    /**
     * @dev Checks if a template is active
     * @param templateId The ID of the template
     * @return True if the template is active, false otherwise
     */
    function isTemplateActive(string calldata templateId) external view returns (bool) {
        return credentialTemplates[templateId].active;
    }

    /*===================== INTERNAL FUNCTIONS ======================*/
    /**
     * @dev Gets the issuer DID
     * @return The DID of the issuer
     */
    function _getIssuerDid() internal view override returns (string memory) {
        try didRegistryInterface.getDidByAddress(owner()) returns (string memory did) {
            return did;
        } catch {
            return "";
        }
    }
}
