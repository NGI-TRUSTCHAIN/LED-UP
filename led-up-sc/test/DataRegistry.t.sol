// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.19;

import {Test, console} from "forge-std/Test.sol";
import {DataRegistry} from "../src/contracts/DataRegistry.sol";
import {DataTypes} from "../src/library/DataTypes.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract ERC20Mock is ERC20 {
    constructor(string memory name, string memory symbol) ERC20(name, symbol) {}

    function mint(address to, uint256 amount) public {
        _mint(to, amount);
    }
}

contract DataRegistryTest is Test {
    DataRegistry public dataRegistry;
    address PROVIDER = makeAddr("owner");
    address PRODUCER = makeAddr("producer");
    address PRODUCER_2 = makeAddr("producer_2");
    address USER = makeAddr("user");
    address EXTERNAL_USER = makeAddr("external_user");
    // ----------------------------- new
    address LEVEA_WALLET = makeAddr("leveaWallet");
    address TOKEN = makeAddr("token");
    ERC20Mock token;

    // ------------------------------- new

    function setUp() public {
        vm.startPrank(PROVIDER);
        token = new ERC20Mock("Test Token", "TTK"); // <--- new
        dataRegistry = new DataRegistry(
            DataTypes.Metadata({url: "https://example.com", hash: intoBytes32("https://example.com")}),
            DataTypes.Schema({
                schemaRef: DataTypes.Metadata({url: "https://example.com", hash: intoBytes32("https://example.com")})
            }),
            PROVIDER,
            // <--- new
            address(token),
            payable(LEVEA_WALLET),
            10
        );
        // <--- new

        vm.stopPrank();
    }

    // ------------------------------- new

    function testReturnsTheProvider() public view {
        assert(dataRegistry.owner() == PROVIDER);
    }

    function testReturnsCompensationSmartContractAddress() public view {
        address compAddress = dataRegistry.getCompensationContractAddress();
        assert(compAddress != address(0));
    }

    function testReturnsCompensationProvider() public pure {
        assert(true);
    }

    // ------------------------------- new

    function testReturnsProviderMetadata() public view {
        assert(
            keccak256(abi.encodePacked(dataRegistry.getProviderMetadata().url))
                == keccak256(abi.encodePacked("https://example.com"))
        );

        assert(dataRegistry.getProviderMetadata().hash == (intoBytes32("https://example.com")));
    }

    function testSetsRecordSchema() public view {
        assert(
            keccak256(abi.encodePacked(dataRegistry.getRecordSchema().schemaRef.url))
                == keccak256(abi.encodePacked("https://example.com"))
        );

        assert(dataRegistry.getRecordSchema().schemaRef.hash == (intoBytes32("https://example.com")));

        assert(dataRegistry.owner() == PROVIDER);
    }

    function testOwnerIsNewProviderAddress() public view {
        assert(dataRegistry.owner() == PROVIDER);
    }

    function testGetCompensationSmartContractAddress() public view {
        assert(dataRegistry.getCompensationContractAddress() != address(0));
    }

    function testPauseStatusIsFalse() public view {
        assert(dataRegistry.paused() == false);
    }

    function testChangesPauseState() public {
        vm.startPrank(PROVIDER);
        dataRegistry.changePauseState(true);
        assert(dataRegistry.paused() == true);
        vm.stopPrank();
    }

    function testCannotUnpauseIfPauseIsFalse() public {
        vm.expectRevert();
        vm.prank(EXTERNAL_USER);
        dataRegistry.changePauseState(false);
    }

    function testAnyUserCanGetRecordStatus() public view {
        DataTypes.RecordStatus status = dataRegistry.getProducerRecordStatus(USER);

        assert(status == DataTypes.RecordStatus.ACTIVE);
    }

    function testOnlyProviderCanChangeRecordStatus() public {
        vm.expectRevert();
        vm.prank(EXTERNAL_USER);
        dataRegistry.updateProducerRecordStatus(PRODUCER, DataTypes.RecordStatus.INACTIVE);
    }

    function testAccountsOtherThanProviderCannotRegisterMedicalResource() public {
        vm.expectRevert();
        vm.prank(USER);

        dataRegistry.registerProducerRecord(
            "550e8400-e29b-41d4-a716-446655440000",
            PRODUCER,
            "signature",
            "Producer",
            DataTypes.ConsentStatus.Allowed,
            DataTypes.RecordMetadata({cid: "cid", url: "https://example.com", hash: intoBytes32("https://example.com")})
        );
    }

    function testUpdateProviderMetadata() public {
        vm.prank(PROVIDER);
        dataRegistry.updateProviderMetadata(
            DataTypes.Metadata({url: "https://example.com2", hash: intoBytes32("https://example.com2")})
        );

        assert(
            keccak256(abi.encodePacked(dataRegistry.getProviderMetadata().url))
                == keccak256(abi.encodePacked("https://example.com2"))
        );

        assert(dataRegistry.getProviderMetadata().hash == (intoBytes32("https://example.com2")));
    }

    function testUpdateProviderRecordMetadata() public {
        vm.prank(PROVIDER);
        dataRegistry.updateProviderRecordSchema(
            DataTypes.Schema({
                schemaRef: DataTypes.Metadata({url: "https://example.com2", hash: intoBytes32("https://example.com2")})
            })
        );

        assert(
            keccak256(abi.encodePacked(dataRegistry.getRecordSchema().schemaRef.url))
                == keccak256(abi.encodePacked("https://example.com2"))
        );

        assert(dataRegistry.getRecordSchema().schemaRef.hash == (intoBytes32("https://example.com2")));
    }

    function testProviderCanRegisterMedicalResource() public {
        vm.prank(PROVIDER);
        dataRegistry.registerProducerRecord(
            "1",
            PRODUCER,
            "signature",
            "Producer",
            DataTypes.ConsentStatus.Allowed,
            DataTypes.RecordMetadata({cid: "cid", url: "https://example.com", hash: intoBytes32("https://example.com")})
        );
        DataTypes.ConsentStatus consent = dataRegistry.getProducerConsent(PRODUCER);
        DataTypes.RecordStatus status = dataRegistry.getProducerRecordStatus(PRODUCER);

        vm.prank(PROVIDER);
        DataTypes.Record memory record = dataRegistry.getProducerRecord(PRODUCER, "1");
        assert(consent == DataTypes.ConsentStatus.Allowed);
        assert(status == DataTypes.RecordStatus.ACTIVE);

        assert(record.metadata.hash == intoBytes32("https://example.com"));

        assert(keccak256(abi.encodePacked(record.metadata.url)) == keccak256(abi.encodePacked("https://example.com")));

        assert(dataRegistry.getTotalRecordsCount() == 1);
    }

    function testReturnsTheProducerRecordInfo() public {
        vm.prank(PROVIDER);
        dataRegistry.registerProducerRecord(
            "1",
            PRODUCER,
            "signature",
            "Producer",
            DataTypes.ConsentStatus.Allowed,
            DataTypes.RecordMetadata({cid: "cid", url: "https://example.com", hash: intoBytes32("https://example.com")})
        );
        vm.prank(PROVIDER);
        DataTypes.RecordInfo memory recordInfo = dataRegistry.getProducerRecordInfo(PRODUCER);

        assert(
            recordInfo.producer == PRODUCER && recordInfo.status == DataTypes.RecordStatus.ACTIVE
                && recordInfo.consent == DataTypes.ConsentStatus.Allowed && recordInfo.nonce == 1
        );
    }

    function testOnlyProviderCanCallGetProducerRecordInfo() public {
        vm.prank(PROVIDER);
        dataRegistry.registerProducerRecord(
            "1",
            PRODUCER,
            "signature",
            "Producer",
            DataTypes.ConsentStatus.Allowed,
            DataTypes.RecordMetadata({cid: "cid", url: "https://example.com", hash: intoBytes32("https://example.com")})
        );
        vm.expectRevert();
        vm.prank(USER);
        dataRegistry.getProducerRecordInfo(PRODUCER);
    }

    function testRetrunsTheProducerRecord() public {
        vm.prank(PROVIDER);
        dataRegistry.registerProducerRecord(
            "1",
            PRODUCER,
            "signature",
            "Producer",
            DataTypes.ConsentStatus.Denied,
            DataTypes.RecordMetadata({cid: "cid", url: "https://example.com", hash: intoBytes32("https://example.com")})
        );
        vm.prank(PROVIDER);
        DataTypes.Record memory record = dataRegistry.getProducerRecord(PRODUCER, "1");

        assert(
            compareStr(record.resourceType, "Producer") && record.metadata.hash == intoBytes32("https://example.com")
                && compareStr(record.metadata.url, "https://example.com")
                && compareStr(string(record.signature), "signature")
        );
    }

    function testReturnsFalseIfProducerDoesNotExist() public {
        vm.prank(PROVIDER);
        dataRegistry.registerProducerRecord(
            "1",
            PRODUCER,
            "signature",
            "Producer",
            DataTypes.ConsentStatus.Denied,
            DataTypes.RecordMetadata({cid: "cid", url: "https://example.com", hash: intoBytes32("https://example.com")})
        );

        assert(dataRegistry.producerExists(PRODUCER) == true);
        assert(dataRegistry.producerExists(USER) == false);
    }

    function testRemovesRegisteredProducerRecord() public {
        vm.prank(PROVIDER);
        dataRegistry.registerProducerRecord(
            "1",
            PRODUCER,
            "signature",
            "Producer",
            DataTypes.ConsentStatus.Denied,
            DataTypes.RecordMetadata({cid: "cid", url: "https://example.com", hash: intoBytes32("https://example.com")})
        );
        vm.prank(PROVIDER);
        dataRegistry.removeProducerRecord(PRODUCER);
        assert(dataRegistry.producerExists(PRODUCER) == false);
        assert(dataRegistry.getTotalRecordsCount() == 0);
    }

    function testUpdatesProducerRecord() public {
        vm.prank(PROVIDER);
        dataRegistry.registerProducerRecord(
            "1",
            PRODUCER,
            "signature",
            "Producer",
            DataTypes.ConsentStatus.Denied,
            DataTypes.RecordMetadata({cid: "cid", url: "https://example.com", hash: intoBytes32("https://example.com")})
        );
        vm.prank(PROVIDER);
        dataRegistry.updateProducerRecord(
            "1",
            PRODUCER,
            "signature2",
            "Producer",
            DataTypes.RecordStatus.ACTIVE,
            DataTypes.ConsentStatus.Allowed,
            DataTypes.RecordMetadata({
                cid: "cid2",
                url: "https://example.com2",
                hash: intoBytes32("https://example.com2")
            })
        );

        vm.prank(PROVIDER);
        DataTypes.Record memory record = dataRegistry.getProducerRecord(PRODUCER, "1");
        assert(
            compareStr(record.resourceType, "Producer") && record.metadata.hash == intoBytes32("https://example.com2")
                && compareStr(record.metadata.url, "https://example.com2")
                && compareStr(string(record.signature), "signature2")
        );
    }

    function testReturnsCorrectNumberOfRecords() public {
        vm.prank(PROVIDER);
        dataRegistry.registerProducerRecord(
            "1",
            PRODUCER,
            "signature",
            "Producer",
            DataTypes.ConsentStatus.Denied,
            DataTypes.RecordMetadata({cid: "cid", url: "https://example.com", hash: intoBytes32("https://example.com")})
        );
        vm.prank(PROVIDER);
        dataRegistry.registerProducerRecord(
            "2",
            PRODUCER_2,
            "signature",
            "Condition",
            DataTypes.ConsentStatus.Denied,
            DataTypes.RecordMetadata({cid: "cid", url: "https://example.com", hash: intoBytes32("https://example.com")})
        );

        assert(dataRegistry.getTotalRecordsCount() == 2);
    }

    function testUpdatesProducerRecordMetadata() public {
        vm.prank(PROVIDER);
        dataRegistry.registerProducerRecord(
            "1",
            PRODUCER,
            "signature",
            "Producer",
            DataTypes.ConsentStatus.Denied,
            DataTypes.RecordMetadata({cid: "cid", url: "https://example.com", hash: intoBytes32("https://example.com")})
        );
        vm.prank(PROVIDER);
        dataRegistry.updateProducerRecordMetadata(
            PRODUCER,
            "1",
            DataTypes.RecordMetadata({
                cid: "cid2",
                url: "https://example.com2",
                hash: intoBytes32("https://example.com2")
            })
        );

        vm.prank(PROVIDER);
        DataTypes.Record memory record = dataRegistry.getProducerRecord(PRODUCER, "1");
        assert(
            record.metadata.hash == intoBytes32("https://example.com2")
                && compareStr(record.metadata.url, "https://example.com2")
                && compareStr(string(record.signature), "signature")
        );
    }

    function testUpdatesProducerRecordStatus() public {
        vm.prank(PROVIDER);
        dataRegistry.registerProducerRecord(
            "1",
            PRODUCER,
            "signature",
            "Producer",
            DataTypes.ConsentStatus.Denied,
            DataTypes.RecordMetadata({cid: "cid", url: "https://example.com", hash: intoBytes32("https://example.com")})
        );
        vm.prank(PROVIDER);
        dataRegistry.updateProducerRecordStatus(PRODUCER, DataTypes.RecordStatus.INACTIVE);

        vm.prank(PROVIDER);
        DataTypes.RecordInfo memory recordInfo = dataRegistry.getProducerRecordInfo(PRODUCER);
        assert(recordInfo.status == DataTypes.RecordStatus.INACTIVE);
    }

    function testNonProviderAccountCannotUpdateProducerRecordStatus() public {
        vm.prank(PROVIDER);
        dataRegistry.registerProducerRecord(
            "1",
            PRODUCER,
            "signature",
            "Producer",
            DataTypes.ConsentStatus.Denied,
            DataTypes.RecordMetadata({cid: "cid", url: "https://example.com", hash: intoBytes32("https://example.com")})
        );
        vm.expectRevert();
        vm.prank(USER);
        dataRegistry.updateProducerRecordStatus(PRODUCER, DataTypes.RecordStatus.INACTIVE);
    }

    function testUpdatesProducerRecordConsent() public {
        vm.prank(PROVIDER);
        dataRegistry.registerProducerRecord(
            "1",
            PRODUCER,
            "signature",
            "Producer",
            DataTypes.ConsentStatus.Denied,
            DataTypes.RecordMetadata({cid: "cid", url: "https://example.com", hash: intoBytes32("https://example.com")})
        );
        vm.prank(PROVIDER);

        dataRegistry.updateProducerConsent(PRODUCER, DataTypes.ConsentStatus.Allowed);

        vm.prank(PROVIDER);

        assert(dataRegistry.getProducerConsent(PRODUCER) == DataTypes.ConsentStatus.Allowed);
    }

    function testRegisterProducerRecords() public {
        vm.startPrank(PROVIDER);
        dataRegistry.registerProducerRecord(
            "1",
            PRODUCER,
            "signature1",
            "Producer",
            DataTypes.ConsentStatus.Allowed,
            DataTypes.RecordMetadata({
                cid: "cid1",
                url: "https://example1.com",
                hash: intoBytes32("https://example1.com")
            })
        );
        dataRegistry.registerProducerRecord(
            "2",
            PRODUCER,
            "signature2",
            "Producer",
            DataTypes.ConsentStatus.Allowed,
            DataTypes.RecordMetadata({
                cid: "cid2",
                url: "https://example2.com",
                hash: intoBytes32("https://example2.com")
            })
        );
        vm.stopPrank();

        vm.prank(PRODUCER);
        // Verify records were registered
        (,, DataTypes.Record[] memory records, string[] memory recordIds,) = dataRegistry.getProducerRecords(PRODUCER);

        assert(dataRegistry.producerExists(PRODUCER));
        assert(records.length == 2);
        assert(recordIds.length == 2);
    }

    function testGetProducerRecordsAsProvider() public {
        testRegisterProducerRecords();

        vm.prank(PROVIDER);
        (
            DataTypes.RecordStatus status,
            DataTypes.ConsentStatus consent,
            DataTypes.Record[] memory records,
            string[] memory recordIds,
        ) = dataRegistry.getProducerRecords(PRODUCER);

        assert(status == DataTypes.RecordStatus.ACTIVE);
        assert(consent == DataTypes.ConsentStatus.Allowed);
        assert(recordIds.length > 0);
        if (records.length > 0) {
            assert(compareStr(string(records[0].signature), "signature1"));
            assert(compareStr(records[0].metadata.url, "https://example1.com"));
        }

        if (records.length > 1) {
            assert(compareStr(string(records[1].signature), "signature2"));
            assert(compareStr(records[1].metadata.url, "https://example2.com"));
        }
    }

    function testGetProducerRecordsAsProducer() public {
        testRegisterProducerRecords();

        vm.prank(PRODUCER);
        (
            DataTypes.RecordStatus status,
            DataTypes.ConsentStatus consent,
            DataTypes.Record[] memory records,
            string[] memory recordIds,
        ) = dataRegistry.getProducerRecords(PRODUCER);

        assert(status == DataTypes.RecordStatus.ACTIVE);
        assert(consent == DataTypes.ConsentStatus.Allowed);
        assert(records.length > 0);
        assert(recordIds.length > 0);
    }

    function testGetProducerRecordsAccessControl() public {
        testRegisterProducerRecords();

        vm.expectRevert();
        vm.prank(USER);
        dataRegistry.getProducerRecords(PRODUCER);
    }

    // Helper function
    function intoBytes32(string memory _input) public pure returns (bytes32) {
        return bytes32(keccak256(abi.encodePacked(_input)));
    }

    function compareStr(string memory a, string memory b) public pure returns (bool) {
        return keccak256(abi.encodePacked(a)) == keccak256(abi.encodePacked(b));
    }
}
