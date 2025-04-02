// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import {Test, console} from "forge-std/Test.sol";

import {Token} from "src/contracts/Token.sol";

contract LedUpTokenTest is Test {
    Token public token;
    address OWNER = makeAddr("owner");
    uint256 mintAmount = 1000e18;

    function setUp() public {
        token = new Token();
    }

    function testmint() public {
        token.mint(OWNER, mintAmount);
        assertEq(token.balanceOf(OWNER), 1000e18);
    }

    function testname() public view {
        assertEq(token.name(), "LedUpToken");
    }

    function testsymbol() public view {
        assertEq(token.symbol(), "LEDUP");
    }
}
