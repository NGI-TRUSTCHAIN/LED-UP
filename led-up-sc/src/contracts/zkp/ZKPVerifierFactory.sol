// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./ZKPRegistry.sol";
import "./AgeVerifier.sol";
import "./HashVerifier.sol";
import "./FHIRVerifier.sol";

/**
 * @title ZKPVerifierFactory
 * @dev Factory contract for deploying ZKP verifier contracts
 */
contract ZKPVerifierFactory {
    /*===================== ERRORS ======================*/
    error ZKPVerifierFactory__InvalidRegistryAddress();
    error ZKPVerifierFactory__CallerNotOwner();
    error ZKPVerifierFactory__InvalidVerifierAddress();

    /*===================== VARIABLES ======================*/
    /// @dev The ZKP registry contract
    ZKPRegistry public immutable registry;

    /// @dev The owner of the factory
    address private immutable owner;

    /// @dev Constants for verifier types
    bytes32 public constant AGE_VERIFIER_TYPE = keccak256("AGE_VERIFIER");
    bytes32 public constant HASH_VERIFIER_TYPE = keccak256("HASH_VERIFIER");
    bytes32 public constant ENHANCED_HASH_VERIFIER_TYPE = keccak256("ENHANCED_HASH_VERIFIER");
    bytes32 public constant FHIR_VERIFIER_TYPE = keccak256("FHIR_VERIFIER");

    /// @dev Events
    event VerifierDeployed(bytes32 indexed verifierType, address verifierAddress);

    /*===================== MODIFIERS ======================*/
    modifier onlyOwner() {
        if (msg.sender != owner) revert ZKPVerifierFactory__CallerNotOwner();
        _;
    }

    /**
     * @dev Constructor
     * @param _registryAddress The address of the ZKP registry contract
     */
    constructor(address _registryAddress) {
        if (_registryAddress == address(0)) revert ZKPVerifierFactory__InvalidRegistryAddress();
        registry = ZKPRegistry(_registryAddress);
        owner = msg.sender;
    }

    /*===================== FUNCTIONS ======================*/
    /**
     * @dev Deploys an AgeVerifier contract
     * @param verifierAddress The address of the ZoKrates-generated verifier contract
     * @return The address of the deployed AgeVerifier contract
     */
    function deployAgeVerifier(address verifierAddress) external onlyOwner returns (address) {
        if (verifierAddress == address(0)) revert ZKPVerifierFactory__InvalidVerifierAddress();

        AgeVerifier ageVerifier = new AgeVerifier(verifierAddress);
        address ageVerifierAddress = address(ageVerifier);

        // Register the verifier in the registry
        registry.registerVerifier(AGE_VERIFIER_TYPE, ageVerifierAddress);

        emit VerifierDeployed(AGE_VERIFIER_TYPE, ageVerifierAddress);
        return ageVerifierAddress;
    }

    /**
     * @dev Deploys a HashVerifier contract
     * @param verifierAddress The address of the ZoKrates-generated verifier contract
     * @return The address of the deployed HashVerifier contract
     */
    function deployHashVerifier(address verifierAddress) external onlyOwner returns (address) {
        if (verifierAddress == address(0)) revert ZKPVerifierFactory__InvalidVerifierAddress();

        HashVerifier hashVerifier = new HashVerifier(verifierAddress);
        address hashVerifierAddress = address(hashVerifier);

        // Register the verifier in the registry
        registry.registerVerifier(HASH_VERIFIER_TYPE, hashVerifierAddress);

        emit VerifierDeployed(HASH_VERIFIER_TYPE, hashVerifierAddress);
        return hashVerifierAddress;
    }

    /**
     * @dev Deploys a FHIRVerifier contract
     * @param verifierAddress The address of the ZoKrates-generated verifier contract
     * @return The address of the deployed FHIRVerifier contract
     */
    function deployFHIRVerifier(address verifierAddress) external onlyOwner returns (address) {
        if (verifierAddress == address(0)) revert ZKPVerifierFactory__InvalidVerifierAddress();

        FHIRVerifier fhirVerifier = new FHIRVerifier(verifierAddress);
        address fhirVerifierAddress = address(fhirVerifier);

        // Register the verifier in the registry
        registry.registerVerifier(FHIR_VERIFIER_TYPE, fhirVerifierAddress);

        emit VerifierDeployed(FHIR_VERIFIER_TYPE, fhirVerifierAddress);
        return fhirVerifierAddress;
    }

    /**
     * @dev Gets the address of a verifier from the registry
     * @param verifierType The type of the verifier
     * @return The address of the verifier
     */
    function getVerifier(bytes32 verifierType) external view returns (address) {
        return registry.getVerifier(verifierType);
    }
}
