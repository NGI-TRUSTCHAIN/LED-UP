// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.19;

import {Script, console} from "forge-std/Script.sol";
import {Compensation} from "../src/contracts/Compensation.sol";
import {HelperConfig} from "./HelperConfig.s.sol";
import {DataTypes} from "../src/library/DataTypes.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

/*
 constructor(
        address _provider,
        address _tokenAddress,
        address payable _leveaWallet,
        uint256 _serviceFeePercent,
        uint256 _unitPrice
    ) Ownable(_provider) {
        token = IERC20(_tokenAddress);
        leveaWallet = _leveaWallet;
        serviceFeePercent = _serviceFeePercent;
        unitPrice = _unitPrice;
    }
    */

contract DeployCompensation is Script {
    Compensation public compensation;
    HelperConfig public config;

    function run() public returns (Compensation) {
        config = new HelperConfig();

        compensation = new Compensation(
            config.getProvider(),
            config.getToken(),
            payable(config.getLeveaWallet()),
            10, // service fee in percent
            1 // unit price
        );
        return compensation;
    }
}
