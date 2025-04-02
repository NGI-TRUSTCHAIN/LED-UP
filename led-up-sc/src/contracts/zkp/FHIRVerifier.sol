// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "../../interfaces/IZKPVerifier.sol";

/**
 * @title FHIRVerifier
 * @dev Contract for verifying FHIR resource-related zero-knowledge proofs
 * Supports enhanced verification with multiple resource types and verification modes
 */
contract FHIRVerifier is IZKPVerifier {
    /*===================== ERRORS ======================*/
    error FHIRVerifier__InvalidVerifierAddress();
    error FHIRVerifier__InvalidInputLength();
    error FHIRVerifier__VerificationCallFailed();
    error FHIRVerifier__InvalidResourceType();
    error FHIRVerifier__InvalidVerificationMode();

    /*===================== VARIABLES ======================*/
    /// @dev The underlying ZoKrates-generated verifier contract
    address private immutable verifierAddress;

    /// @dev FHIR Resource Types (extended)
    enum ResourceType {
        Patient, // 0
        Observation, // 1
        MedicationRequest, // 2
        Condition, // 3
        Procedure, // 4
        Encounter, // 5
        DiagnosticReport, // 6
        CarePlan, // 7
        Immunization, // 8
        AllergyIntolerance, // 9
        Device, // 10
        Organization, // 11
        Practitioner, // 12
        Location, // 13
        Medication, // 14
        Coverage // 15

    }

    /// @dev Verification Modes
    enum VerificationMode {
        Basic, // 0: Basic validation
        SelectiveDisclosure, // 1: Selective disclosure validation
        ReferenceValidation // 2: Reference validation

    }

    /// @dev Event emitted when a FHIR resource verification is performed
    event FHIRResourceVerified(
        address indexed verifier,
        ResourceType resourceType,
        uint256[2] expectedHash,
        VerificationMode verificationMode,
        bool result
    );

    /**
     * @dev Constructor
     * @param _verifierAddress Address of the ZoKrates-generated verifier contract
     */
    constructor(address _verifierAddress) {
        if (_verifierAddress == address(0)) revert FHIRVerifier__InvalidVerifierAddress();
        verifierAddress = _verifierAddress;
    }

    /*===================== FUNCTIONS ======================*/
    /**
     * @dev Verifies a zero-knowledge proof
     * @param a The 'a' part of the proof
     * @param b The 'b' part of the proof
     * @param c The 'c' part of the proof
     * @param input The public inputs to the verification
     * @return True if the proof is valid, false otherwise
     */
    function verify(uint256[2] calldata a, uint256[2][2] calldata b, uint256[2] calldata c, uint256[] calldata input)
        external
        view
        override
        returns (bool)
    {
        // Enhanced FHIR verification requires at least 4 inputs:
        // resourceType, expectedHash[2], verificationMode
        if (input.length < 4) revert FHIRVerifier__InvalidInputLength();

        // Call the ZoKrates-generated verifier
        (bool success, bytes memory data) = verifierAddress.staticcall(
            abi.encodeWithSignature("verifyProof(uint256[2],uint256[2][2],uint256[2],uint256[])", a, b, c, input)
        );

        if (!success) revert FHIRVerifier__VerificationCallFailed();
        return abi.decode(data, (bool));
    }

    /**
     * @dev Verifies a FHIR resource with basic validation
     * @param a The 'a' part of the proof
     * @param b The 'b' part of the proof
     * @param c The 'c' part of the proof
     * @param resourceType The type of FHIR resource
     * @param expectedHash The expected hash of the FHIR resource
     * @return True if the FHIR resource verification passes, false otherwise
     */
    function verifyFHIRResource(
        uint256[2] calldata a,
        uint256[2][2] calldata b,
        uint256[2] calldata c,
        ResourceType resourceType,
        uint256[2] calldata expectedHash
    ) external returns (bool) {
        // Validate resource type
        if (uint256(resourceType) > 15) revert FHIRVerifier__InvalidResourceType();

        // Create input array for basic validation (mode 1)
        uint256[] memory input = new uint256[](4);
        input[0] = uint256(resourceType) + 1; // Add 1 to match ZoKrates enum (1-based)
        input[1] = expectedHash[0];
        input[2] = expectedHash[1];
        input[3] = 1; // Basic validation mode

        bool result = this.verify(a, b, c, input);
        emit FHIRResourceVerified(msg.sender, resourceType, expectedHash, VerificationMode.Basic, result);

        return result;
    }

    /**
     * @dev Verifies a FHIR resource with selective disclosure
     * @param a The 'a' part of the proof
     * @param b The 'b' part of the proof
     * @param c The 'c' part of the proof
     * @param resourceType The type of FHIR resource
     * @param expectedHash The expected hash of the FHIR resource
     * @return True if the FHIR resource verification passes, false otherwise
     */
    function verifyFHIRResourceWithSelectiveDisclosure(
        uint256[2] calldata a,
        uint256[2][2] calldata b,
        uint256[2] calldata c,
        ResourceType resourceType,
        uint256[2] calldata expectedHash
    ) external returns (bool) {
        // Validate resource type
        if (uint256(resourceType) > 15) revert FHIRVerifier__InvalidResourceType();

        // Create input array for selective disclosure validation (mode 2)
        uint256[] memory input = new uint256[](4);
        input[0] = uint256(resourceType) + 1; // Add 1 to match ZoKrates enum (1-based)
        input[1] = expectedHash[0];
        input[2] = expectedHash[1];
        input[3] = 2; // Selective disclosure mode

        bool result = this.verify(a, b, c, input);
        emit FHIRResourceVerified(msg.sender, resourceType, expectedHash, VerificationMode.SelectiveDisclosure, result);

        return result;
    }

    /**
     * @dev Verifies a FHIR resource with reference validation
     * @param a The 'a' part of the proof
     * @param b The 'b' part of the proof
     * @param c The 'c' part of the proof
     * @param resourceType The type of FHIR resource
     * @param expectedHash The expected hash of the FHIR resource
     * @param referencedResourceType The type of the referenced resource
     * @return True if the FHIR resource verification passes, false otherwise
     */
    function verifyFHIRResourceWithReference(
        uint256[2] calldata a,
        uint256[2][2] calldata b,
        uint256[2] calldata c,
        ResourceType resourceType,
        uint256[2] calldata expectedHash,
        ResourceType referencedResourceType
    ) external returns (bool) {
        // Validate resource types
        if (uint256(resourceType) > 15 || uint256(referencedResourceType) > 15) {
            revert FHIRVerifier__InvalidResourceType();
        }

        // Create input array for reference validation (mode 3)
        uint256[] memory input = new uint256[](5);
        input[0] = uint256(resourceType) + 1; // Add 1 to match ZoKrates enum (1-based)
        input[1] = expectedHash[0];
        input[2] = expectedHash[1];
        input[3] = 3; // Reference validation mode
        input[4] = uint256(referencedResourceType) + 1; // Add 1 to match ZoKrates enum (1-based)

        bool result = this.verify(a, b, c, input);
        emit FHIRResourceVerified(msg.sender, resourceType, expectedHash, VerificationMode.ReferenceValidation, result);

        return result;
    }

    /**
     * @dev Gets the string representation of a resource type
     * @param resourceType The resource type enum value
     * @return The string representation of the resource type
     */
    function getResourceTypeString(ResourceType resourceType) external pure returns (string memory) {
        if (resourceType == ResourceType.Patient) {
            return "Patient";
        } else if (resourceType == ResourceType.Observation) {
            return "Observation";
        } else if (resourceType == ResourceType.MedicationRequest) {
            return "MedicationRequest";
        } else if (resourceType == ResourceType.Condition) {
            return "Condition";
        } else if (resourceType == ResourceType.Procedure) {
            return "Procedure";
        } else if (resourceType == ResourceType.Encounter) {
            return "Encounter";
        } else if (resourceType == ResourceType.DiagnosticReport) {
            return "DiagnosticReport";
        } else if (resourceType == ResourceType.CarePlan) {
            return "CarePlan";
        } else if (resourceType == ResourceType.Immunization) {
            return "Immunization";
        } else if (resourceType == ResourceType.AllergyIntolerance) {
            return "AllergyIntolerance";
        } else if (resourceType == ResourceType.Device) {
            return "Device";
        } else if (resourceType == ResourceType.Organization) {
            return "Organization";
        } else if (resourceType == ResourceType.Practitioner) {
            return "Practitioner";
        } else if (resourceType == ResourceType.Location) {
            return "Location";
        } else if (resourceType == ResourceType.Medication) {
            return "Medication";
        } else if (resourceType == ResourceType.Coverage) {
            return "Coverage";
        } else {
            revert FHIRVerifier__InvalidResourceType();
        }
    }

    /**
     * @dev Gets the string representation of a verification mode
     * @param mode The verification mode enum value
     * @return The string representation of the verification mode
     */
    function getVerificationModeString(VerificationMode mode) external pure returns (string memory) {
        if (mode == VerificationMode.Basic) {
            return "Basic";
        } else if (mode == VerificationMode.SelectiveDisclosure) {
            return "SelectiveDisclosure";
        } else if (mode == VerificationMode.ReferenceValidation) {
            return "ReferenceValidation";
        } else {
            revert FHIRVerifier__InvalidVerificationMode();
        }
    }
}
