// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import {Script, console} from "forge-std/Script.sol";
import {DataTypes} from "../src/library/DataTypes.sol";

contract HelperConfig is Script {
    address public provider = 0x04E1B236182b9703535ecB490697b79B45453Ba1;
    string _data_url = "https://example.com";
    bytes32 _data_hash = intoBytes32("https://example.com");
    string _schema_url = "https://example.com";
    bytes32 _schema_hash = intoBytes32("https://example.com");

    DataTypes.Metadata public metadata;
    DataTypes.Schema public schema;

    address public owner = msg.sender;

    address public leveaWallet = 0xc11d7664cE6C27AD61e1D935735683686A9B4E9a;
    address public token = 0x702Bd63ddB359fF45F1De789e9aD8E2EcAb15218;

    constructor() {
        metadata = DataTypes.Metadata({url: _data_url, hash: _data_hash});
        schema = DataTypes.Schema({
            schemaRef: DataTypes.Metadata({
                url: _schema_url,
                hash: _schema_hash
            })
        });
    }

    // Helper function
    function intoBytes32(string memory _input) public pure returns (bytes32) {
        return bytes32(keccak256(abi.encodePacked(_input)));
    }

    function getMetadata() public view returns (DataTypes.Metadata memory) {
        return metadata;
    }

    function getSchema() public view returns (DataTypes.Schema memory) {
        return schema;
    }

    function getProvider() public view returns (address) {
        return provider;
    }

    function getLeveaWallet() public view returns (address) {
        return leveaWallet;
    }

    function getToken() public view returns (address) {
        return token;
    }

    function getOwner() public view returns (address) {
        return owner;
    }
}
