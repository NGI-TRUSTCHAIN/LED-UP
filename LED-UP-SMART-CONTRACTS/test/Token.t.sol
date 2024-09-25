// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import {Test} from "forge-std/Test.sol";
import {LedUpToken} from "../src/contracts/Token.sol";

contract LedUpTokenTest is Test {
    LedUpToken public token;
    address OWNER = makeAddr("owner");
    uint256 mintAmount = 1000e18;

    function setUp() public {
        token = new LedUpToken("LedUpToken", "LDTK");
    }

    function testmint() public {
        token.mint(OWNER, mintAmount);
        assertEq(token.balanceOf(OWNER), 1000e18);
    }

    function testname() public view {
        assertEq(token.name(), "LedUpToken");
    }

    function testsymbol() public view {
        assertEq(token.symbol(), "LDTK");
    }
}
