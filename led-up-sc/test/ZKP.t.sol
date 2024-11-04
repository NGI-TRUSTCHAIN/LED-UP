// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;
import {Test, console} from "forge-std/Test.sol";
import {Groth16Verifier} from "../src/contracts/ZKP.sol";

contract ZKPTest is Test {
    Groth16Verifier public verifier;

    function setUp() public {
        verifier = new Groth16Verifier();
    }

    function testZKPContractAddressIsSet() public view {
        assert(address(verifier) != address(0));
    }

    function testVerifyProof() public view {
        uint[2] memory pA = [uint(1), uint(2)];
        uint[2][2] memory pB = [[uint(1), uint(2)], [uint(3), uint(4)]];
        uint[2] memory pC = [uint(1), uint(2)];
        uint[1] memory pubSignals = [uint(1)];

        bool result = verifier.verifyProof(pA, pB, pC, pubSignals);
        assertTrue(!result, "Proof verification failed");
    }
}
