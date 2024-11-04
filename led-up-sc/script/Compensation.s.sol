// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.19;

import {Script, console} from "forge-std/Script.sol";
import {Compensation} from "../src/contracts/Compensation.sol";
import {HelperConfig} from "./HelperConfig.s.sol";
import {DataTypes} from "../src/library/DataTypes.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract DeployCompensation is Script {
    Compensation public compensation;
    HelperConfig public config;
    uint256 public serviceFee = 10;
    uint256 public unitPrice = 1;

    function run() public returns (Compensation) {
        config = new HelperConfig();

        compensation = new Compensation(
            config.getProvider(), config.getToken(), payable(config.getLeveaWallet()), serviceFee, unitPrice
        );
        return compensation;
    }
}
