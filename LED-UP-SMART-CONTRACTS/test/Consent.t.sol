// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "forge-std/Test.sol";
import "../src/contracts/Consent.sol";

contract ConsentTest is Test {
    ConsentManagement public consent;
    address OWNER = makeAddr("owner");
    address PROVIDER = makeAddr("provider");

    function setUp() public {
        consent = new ConsentManagement();
    }

    function testOwnerCanGiveConsent() public {
        vm.startPrank(OWNER);
        consent.grant(PROVIDER);
        vm.stopPrank();

        assert(
            consent.queryConsent(OWNER, PROVIDER) ==
                ConsentManagement.ConsentStatus.Granted
        );
    }

    function testOwnerCanRevokeConsent() public {
        vm.startPrank(OWNER);
        consent.grant(PROVIDER);
        ConsentManagement.ConsentStatus beforeRevoked = consent.queryConsent(
            OWNER,
            PROVIDER
        );
        consent.revoke(PROVIDER);

        ConsentManagement.ConsentStatus afterRevoked = consent.queryConsent(
            OWNER,
            PROVIDER
        );

        vm.stopPrank();

        assert(beforeRevoked == ConsentManagement.ConsentStatus.Granted);
        assert(afterRevoked == ConsentManagement.ConsentStatus.Revoked);
    }
}
