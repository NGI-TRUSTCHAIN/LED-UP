// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import {Script, console} from "forge-std/Script.sol";
import {DataTypes} from "../src/library/DataTypes.sol";
import {LedUpToken} from "../src/contracts/Token.sol";

contract HelperConfig is Script {
    LedUpToken public paymentToken;

    struct Config {
        address provider;
        address leveaWallet;
        address token;
        address owner;
    }

    string _data_url = "https://led-up-sc-api.fhir.net";
    bytes32 _data_hash = intoBytes32("https://led-up-sc-api.fhir.net");
    string _schema_url = "https://led-up-sc-api.azurewebsites.net";
    bytes32 _schema_hash = intoBytes32("https://led-up-sc-api.fhir.net");

    DataTypes.Metadata public metadata;
    DataTypes.Schema public schema;
    Config public config;

    constructor() {
        metadata = DataTypes.Metadata({url: _data_url, hash: _data_hash});
        schema = DataTypes.Schema({schemaRef: DataTypes.Metadata({url: _schema_url, hash: _schema_hash})});
        if (block.chainid == 11155111) {
            config = getSepoliaConfig();
        } else {
            config = getAnvilConfig();
        }
    }

    // Helper function

    function getMetadata() public view returns (DataTypes.Metadata memory) {
        return metadata;
    }

    function getSchema() public view returns (DataTypes.Schema memory) {
        return schema;
    }

    function getProvider() public view returns (address) {
        return config.provider;
    }

    function getLeveaWallet() public view returns (address) {
        return config.leveaWallet;
    }

    function getToken() public view returns (address) {
        return config.token;
    }

    function getOwner() public view returns (address) {
        return config.owner;
    }

    function getSepoliaConfig() public view returns (Config memory) {
        return Config({
            provider: 0x04E1B236182b9703535ecB490697b79B45453Ba1,
            leveaWallet: 0xc11d7664cE6C27AD61e1D935735683686A9B4E9a,
            token: 0x702Bd63ddB359fF45F1De789e9aD8E2EcAb15218,
            owner: msg.sender
        });
    }

    function getAnvilConfig() public returns (Config memory) {
        vm.startBroadcast();
        paymentToken = new LedUpToken("MockToken", "MTK");
        paymentToken.mint(msg.sender, 1000000000000000000000000);
        vm.stopBroadcast();

        return Config({
            provider: 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266,
            leveaWallet: 0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC,
            token: address(paymentToken),
            owner: msg.sender
        });
    }

    function addressToString(address _address) public pure returns (string memory) {
        return string(abi.encodePacked(_address));
    }

    function intoBytes32(string memory _input) public pure returns (bytes32) {
        return bytes32(keccak256(abi.encodePacked(_input)));
    }
}
