// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.19;

import {Script, console} from "forge-std/Script.sol";
import {DataRegistry} from "../src/contracts/DataRegistry.sol";
import {HelperConfig} from "./HelperConfig.s.sol";
import {DataTypes} from "../src/library/DataTypes.sol";

contract DeployDataRegistry is Script {
    DataRegistry public dataRegistry;
    HelperConfig public config;

    function run() public returns (DataRegistry) {
        config = new HelperConfig();

        dataRegistry = new DataRegistry(
            config.getMetadata(),
            config.getSchema(),
            config.getProvider(),
            config.getToken(),
            payable(config.getLeveaWallet()),
            10
        );
        vm.stopBroadcast();

        return dataRegistry;
    }
}
