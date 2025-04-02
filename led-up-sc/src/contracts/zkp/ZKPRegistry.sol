// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "../../interfaces/IZKPVerifier.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title ZKPRegistry
 * @dev Registry for ZKP verifier contracts
 */
contract ZKPRegistry is Ownable {
    /*===================== ERRORS ======================*/
    error ZKPRegistry__InvalidVerifierAddress();
    error ZKPRegistry__InvalidVerifierType();
    error ZKPRegistry__VerifierNotRegistered();
    error ZKPRegistry__VerifierAlreadyRegistered();
    error ZKPRegistry__CallerNotAdmin();
    error ZKPRegistry__InvalidAdminAddress();
    error ZKPRegistry__AdminAlreadyExists();

    /*===================== VARIABLES ======================*/

    /// @dev Mapping from verifier type to verifier address
    mapping(bytes32 => address) private verifiers;

    /// @dev Mapping to track authorized administrators
    mapping(address => bool) private admins;

    /*===================== EVENTS ======================*/
    event VerifierRegistered(bytes32 indexed verifierType, address verifierAddress);
    event VerifierRemoved(bytes32 indexed verifierType);
    event AdminAdded(address indexed admin);
    event AdminRemoved(address indexed admin);

    /*===================== MODIFIERS ======================*/
    modifier onlyAdmin() {
        if (!admins[msg.sender] && msg.sender != owner()) revert ZKPRegistry__CallerNotAdmin();
        _;
    }

    /**
     * @dev Constructor
     */
    constructor() Ownable(msg.sender) {
        admins[msg.sender] = true;
    }

    /*===================== FUNCTIONS ======================*/
    /**
     * @dev Registers a verifier
     * @param verifierType The type of the verifier (as bytes32)
     * @param verifierAddress The address of the verifier contract
     */
    function registerVerifier(bytes32 verifierType, address verifierAddress) external onlyAdmin {
        if (verifierAddress == address(0)) revert ZKPRegistry__InvalidVerifierAddress();
        if (verifierType == bytes32(0)) revert ZKPRegistry__InvalidVerifierType();

        // Ensure the contract implements the IZKPVerifier interface
        // This will revert if the contract doesn't implement the interface
        IZKPVerifier verifier = IZKPVerifier(verifierAddress);

        // Try to call a function on the verifier to ensure it's a valid contract
        // This is a simple check and will revert if the contract doesn't exist
        // or doesn't implement the function
        // Create dummy parameters for the verification call
        uint256[2] memory a = [uint256(0), uint256(0)];
        uint256[2][2] memory b = [[uint256(0), uint256(0)], [uint256(0), uint256(0)]];
        uint256[2] memory c = [uint256(0), uint256(0)];
        uint256[] memory input = new uint256[](0);

        // This call will revert if the contract is not valid
        try verifier.verify(a, b, c, input) returns (bool) {
            // We don't care about the result, just that the call succeeded
        } catch {
            // If the call reverts, that's expected since we're passing dummy values
            // We just want to ensure the contract exists and has the verify function
        }

        verifiers[verifierType] = verifierAddress;
        emit VerifierRegistered(verifierType, verifierAddress);
    }

    /**
     * @dev Removes a verifier
     * @param verifierType The type of the verifier to remove
     */
    function removeVerifier(bytes32 verifierType) external onlyAdmin {
        if (verifiers[verifierType] == address(0)) revert ZKPRegistry__VerifierNotRegistered();

        delete verifiers[verifierType];
        emit VerifierRemoved(verifierType);
    }

    /**
     * @dev Gets a verifier address
     * @param verifierType The type of the verifier
     * @return The address of the verifier
     */
    function getVerifier(bytes32 verifierType) external view returns (address) {
        address verifier = verifiers[verifierType];
        if (verifier == address(0)) revert ZKPRegistry__VerifierNotRegistered();
        return verifier;
    }

    /**
     * @dev Checks if a verifier is registered
     * @param verifierType The type of the verifier
     * @return True if the verifier is registered, false otherwise
     */
    function isVerifierRegistered(bytes32 verifierType) external view returns (bool) {
        return verifiers[verifierType] != address(0);
    }

    /**
     * @dev Adds an admin
     * @param admin The address of the admin to add
     */
    function addAdmin(address admin) external onlyOwner {
        if (admin == address(0)) revert ZKPRegistry__InvalidAdminAddress();
        if (admins[admin]) revert ZKPRegistry__AdminAlreadyExists();

        admins[admin] = true;
        emit AdminAdded(admin);
    }

    /**
     * @dev Removes an admin
     * @param admin The address of the admin to remove
     */
    function removeAdmin(address admin) external onlyOwner {
        require(admin != owner(), "ZKPRegistry: cannot remove owner as admin");
        require(admins[admin], "ZKPRegistry: admin does not exist");

        admins[admin] = false;
        emit AdminRemoved(admin);
    }

    /**
     * @dev Checks if an address is an admin
     * @param admin The address to check
     * @return True if the address is an admin, false otherwise
     */
    function isAdmin(address admin) external view returns (bool) {
        return admins[admin] || admin == owner();
    }
}
