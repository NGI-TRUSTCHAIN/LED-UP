// SPDX-License-Identifier: MIT

pragma solidity ^0.8.19;

contract ConsentManagement {
    enum ConsentStatus {
        Granted,
        Revoked
    }

    struct Consent {
        address producer;
        address provider;
        ConsentStatus status;
    }

    mapping(address => mapping(address => Consent)) private consents;

    event ConsentGranted(address indexed producer, address indexed provider);
    event ConsentRevoked(address indexed producer, address indexed provider);

    function grant(address provider) external {
        consents[msg.sender][provider] = Consent({
            producer: msg.sender,
            provider: provider,
            status: ConsentStatus.Granted
        });

        emit ConsentGranted(msg.sender, provider);
    }

    function revoke(address provider) external {
        require(
            consents[msg.sender][provider].status == ConsentStatus.Granted,
            "Consent not granted"
        );

        consents[msg.sender][provider].status = ConsentStatus.Revoked;

        emit ConsentRevoked(msg.sender, provider);
    }

    function queryConsent(
        address producer,
        address provider
    ) external view returns (ConsentStatus) {
        require(
            consents[producer][provider].producer == producer,
            "Consent not found"
        );

        return consents[producer][provider].status;
    }
}
