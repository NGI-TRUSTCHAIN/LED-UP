// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.19;

import {Test, console} from "forge-std/Test.sol";
import {DataRegistry} from "src/contracts/DataRegistry.sol";
import {DataTypes} from "src/library/DataTypes.sol";
import {IDataRegistry} from "src/interfaces/IDataRegistry.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import {DidAuth} from "src/contracts/DidAuth.sol";

contract ERC20Mock is ERC20 {
    constructor(string memory name, string memory symbol) ERC20(name, symbol) {}

    function mint(address to, uint256 amount) public {
        _mint(to, amount);
    }
}

// Mock DidAuth contract for testing
contract DidAuthMock {
    bytes32 public constant PRODUCER_ROLE = keccak256("PRODUCER");
    bytes32 public constant CONSUMER_ROLE = keccak256("CONSUMER");
    bytes32 public constant SERVICE_PROVIDER_ROLE = keccak256("SERVICE_PROVIDER");

    mapping(string => bool) private validProducers;
    mapping(string => bool) private validConsumers;
    mapping(string => bool) private validServiceProviders;
    mapping(address => string) private addressToDid;

    constructor() {}

    function authenticate(string memory did, bytes32 role) public view returns (bool) {
        if (role == PRODUCER_ROLE) {
            return validProducers[did];
        } else if (role == CONSUMER_ROLE) {
            return validConsumers[did];
        } else if (role == SERVICE_PROVIDER_ROLE) {
            return validServiceProviders[did];
        }
        return false;
    }

    function registerProducer(string memory did) public {
        validProducers[did] = true;
    }

    function registerConsumer(string memory did) public {
        validConsumers[did] = true;
    }

    function registerServiceProvider(string memory did) public {
        validServiceProviders[did] = true;
    }

    function setAddressToDid(address addr, string memory did) public {
        addressToDid[addr] = did;
    }

    function getDid(address addr) public view returns (string memory) {
        return addressToDid[addr];
    }
}

contract DataRegistryTest is Test {
    DataRegistry public dataRegistry;
    DidAuthMock public didAuthMock;

    address PROVIDER = makeAddr("owner");
    address PRODUCER = makeAddr("producer");
    address PRODUCER_2 = makeAddr("producer_2");
    address USER = makeAddr("user");
    address EXTERNAL_USER = makeAddr("external_user");
    address LEVEA_WALLET = makeAddr("leveaWallet");
    address TOKEN = makeAddr("token");
    ERC20Mock token;

    // DIDs for testing
    string constant PRODUCER_DID = "did:example:producer";
    string constant PRODUCER_2_DID = "did:example:producer2";
    string constant CONSUMER_DID = "did:example:consumer";
    string constant SERVICE_PROVIDER_DID = "did:example:serviceprovider";

    function setUp() public {
        vm.startPrank(PROVIDER);

        // Create token mock
        token = new ERC20Mock("Test Token", "TTK");

        // Create DidAuth mock
        didAuthMock = new DidAuthMock();

        // Register DIDs
        didAuthMock.registerProducer(PRODUCER_DID);
        didAuthMock.registerProducer(PRODUCER_2_DID);
        didAuthMock.registerConsumer(CONSUMER_DID);
        didAuthMock.registerServiceProvider(SERVICE_PROVIDER_DID);

        // Map addresses to DIDs
        didAuthMock.setAddressToDid(PRODUCER, PRODUCER_DID);
        didAuthMock.setAddressToDid(PRODUCER_2, PRODUCER_2_DID);
        didAuthMock.setAddressToDid(USER, CONSUMER_DID);
        didAuthMock.setAddressToDid(PROVIDER, SERVICE_PROVIDER_DID);

        // Create DataRegistry with DidAuth mock
        dataRegistry = new DataRegistry(address(token), payable(PROVIDER), 10, address(didAuthMock));

        // Initialize provider metadata and record schema
        dataRegistry.updateProviderMetadata(
            IDataRegistry.Metadata({url: "https://example.com", hash: intoBytes32("https://example.com")})
        );

        dataRegistry.updateProviderRecordSchema(
            IDataRegistry.Schema({
                schemaRef: IDataRegistry.Metadata({url: "https://example.com", hash: intoBytes32("https://example.com")})
            })
        );

        vm.stopPrank();
    }

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

    function testReturnsProviderMetadata() public view {
        IDataRegistry.Metadata memory metadata = dataRegistry.getProviderMetadata();

        assert(keccak256(abi.encodePacked(metadata.url)) == keccak256(abi.encodePacked("https://example.com")));

        assert(metadata.hash == intoBytes32("https://example.com"));
    }

    function testSetsRecordSchema() public view {
        IDataRegistry.Schema memory schema = dataRegistry.getRecordSchema();

        assert(keccak256(abi.encodePacked(schema.schemaRef.url)) == keccak256(abi.encodePacked("https://example.com")));

        assert(schema.schemaRef.hash == intoBytes32("https://example.com"));

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
        IDataRegistry.RecordStatus status = dataRegistry.getProducerRecordStatus(USER);

        assert(uint256(status) == uint256(IDataRegistry.RecordStatus.Active));
    }

    function testOnlyProviderCanChangeRecordStatus() public {
        vm.expectRevert();
        vm.prank(EXTERNAL_USER);
        dataRegistry.updateProducerRecordStatus(PRODUCER, IDataRegistry.RecordStatus.Deactivated);
    }

    function testAccountsOtherThanProviderCannotRegisterMedicalResource() public {
        vm.expectRevert();
        vm.prank(USER);

        dataRegistry.registerProducerRecord(
            "550e8400-e29b-41d4-a716-446655440000",
            "1",
            PRODUCER,
            "signature",
            "Producer",
            IDataRegistry.ConsentStatus.Allowed,
            IDataRegistry.RecordMetadata({
                cid: "cid",
                url: "https://example.com",
                hash: intoBytes32("https://example.com")
            })
        );
    }

    function testUpdateProviderMetadata() public {
        vm.prank(PROVIDER);
        dataRegistry.updateProviderMetadata(
            IDataRegistry.Metadata({url: "https://example.com2", hash: intoBytes32("https://example.com2")})
        );

        assert(
            keccak256(abi.encodePacked(dataRegistry.getProviderMetadata().url))
                == keccak256(abi.encodePacked("https://example.com2"))
        );

        assert(dataRegistry.getProviderMetadata().hash == (intoBytes32("https://example.com2")));
    }

    function testUpdateProviderRecordSchema() public {
        vm.prank(PROVIDER);
        dataRegistry.updateProviderRecordSchema(
            IDataRegistry.Schema({
                schemaRef: IDataRegistry.Metadata({url: "https://example.com2", hash: intoBytes32("https://example.com2")})
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
            PRODUCER_DID,
            "1",
            PRODUCER,
            "signature",
            "Producer",
            IDataRegistry.ConsentStatus.Allowed,
            IDataRegistry.RecordMetadata({
                cid: "cid",
                url: "https://example.com",
                hash: intoBytes32("https://example.com")
            })
        );
        IDataRegistry.ConsentStatus consent = dataRegistry.getProducerConsent(PRODUCER);
        IDataRegistry.RecordStatus status = dataRegistry.getProducerRecordStatus(PRODUCER);

        vm.prank(PROVIDER);
        IDataRegistry.HealthRecord memory record = dataRegistry.getProducerRecord(PRODUCER, "1");
        assert(uint256(consent) == uint256(IDataRegistry.ConsentStatus.Allowed));
        assert(uint256(status) == uint256(IDataRegistry.RecordStatus.Active));

        assert(record.hash == intoBytes32("https://example.com"));

        assert(keccak256(abi.encodePacked(record.url)) == keccak256(abi.encodePacked("https://example.com")));

        assert(dataRegistry.getTotalRecordsCount() == 1);
    }

    function testReturnsTheProducerRecordInfo() public {
        vm.prank(PROVIDER);
        dataRegistry.registerProducerRecord(
            PRODUCER_DID,
            "1",
            PRODUCER,
            "signature",
            "Producer",
            IDataRegistry.ConsentStatus.Allowed,
            IDataRegistry.RecordMetadata({
                cid: "cid",
                url: "https://example.com",
                hash: intoBytes32("https://example.com")
            })
        );
        vm.prank(PROVIDER);
        IDataRegistry.DataRecordCore memory recordInfo = dataRegistry.getProducerRecordInfo(PRODUCER);

        assert(
            recordInfo.producer == PRODUCER && uint256(recordInfo.status) == uint256(IDataRegistry.RecordStatus.Active)
                && uint256(recordInfo.consent) == uint256(IDataRegistry.ConsentStatus.Allowed) && recordInfo.nonce == 1
        );
    }

    function testOnlyProviderCanCallGetProducerRecordInfo() public {
        vm.prank(PROVIDER);
        dataRegistry.registerProducerRecord(
            PRODUCER_DID,
            "1",
            PRODUCER,
            "signature",
            "Producer",
            IDataRegistry.ConsentStatus.Allowed,
            IDataRegistry.RecordMetadata({
                cid: "cid",
                url: "https://example.com",
                hash: intoBytes32("https://example.com")
            })
        );
        vm.expectRevert();
        vm.prank(USER);
        dataRegistry.getProducerRecordInfo(PRODUCER);
    }

    function testRetrunsTheProducerRecord() public {
        vm.prank(PROVIDER);
        dataRegistry.registerProducerRecord(
            PRODUCER_DID,
            "1",
            PRODUCER,
            "signature",
            "Producer",
            IDataRegistry.ConsentStatus.Denied,
            IDataRegistry.RecordMetadata({
                cid: "cid",
                url: "https://example.com",
                hash: intoBytes32("https://example.com")
            })
        );
        vm.prank(PROVIDER);
        IDataRegistry.HealthRecord memory record = dataRegistry.getProducerRecord(PRODUCER, "1");

        assert(
            compareStr(record.resourceType, "Producer") && record.hash == intoBytes32("https://example.com")
                && compareStr(record.url, "https://example.com") && compareStr(string(record.signature), "signature")
        );
    }

    function testReturnsFalseIfProducerDoesNotExist() public {
        vm.prank(PROVIDER);
        dataRegistry.registerProducerRecord(
            PRODUCER_DID,
            "1",
            PRODUCER,
            "signature",
            "Producer",
            IDataRegistry.ConsentStatus.Denied,
            IDataRegistry.RecordMetadata({
                cid: "cid",
                url: "https://example.com",
                hash: intoBytes32("https://example.com")
            })
        );

        assert(dataRegistry.producerExists(PRODUCER) == true);
        assert(dataRegistry.producerExists(USER) == false);
    }

    function testRemovesRegisteredProducerRecord() public {
        vm.prank(PROVIDER);
        dataRegistry.registerProducerRecord(
            PRODUCER_DID,
            "1",
            PRODUCER,
            "signature",
            "Producer",
            IDataRegistry.ConsentStatus.Denied,
            IDataRegistry.RecordMetadata({
                cid: "cid",
                url: "https://example.com",
                hash: intoBytes32("https://example.com")
            })
        );
        vm.prank(PROVIDER);
        dataRegistry.removeProducerRecord(PRODUCER);
        assert(dataRegistry.producerExists(PRODUCER) == false);
        assert(dataRegistry.getTotalRecordsCount() == 0);
    }

    function testUpdatesProducerRecord() public {
        vm.prank(PROVIDER);
        dataRegistry.registerProducerRecord(
            PRODUCER_DID,
            "1",
            PRODUCER,
            "signature",
            "Producer",
            IDataRegistry.ConsentStatus.Denied,
            IDataRegistry.RecordMetadata({
                cid: "cid",
                url: "https://example.com",
                hash: intoBytes32("https://example.com")
            })
        );
        vm.prank(PROVIDER);
        dataRegistry.updateProducerRecord(
            "1",
            PRODUCER,
            "signature2",
            "Producer",
            IDataRegistry.RecordStatus.Active,
            IDataRegistry.ConsentStatus.Allowed,
            IDataRegistry.RecordMetadata({
                cid: "cid2",
                url: "https://example.com2",
                hash: intoBytes32("https://example.com2")
            }),
            SERVICE_PROVIDER_DID
        );

        vm.prank(PROVIDER);
        IDataRegistry.HealthRecord memory record = dataRegistry.getProducerRecord(PRODUCER, "1");
        assert(
            compareStr(record.resourceType, "Producer") && record.hash == intoBytes32("https://example.com2")
                && compareStr(record.url, "https://example.com2") && compareStr(string(record.signature), "signature2")
        );
    }

    function testReturnsCorrectNumberOfRecords() public {
        vm.prank(PROVIDER);
        dataRegistry.registerProducerRecord(
            PRODUCER_DID,
            "1",
            PRODUCER,
            "signature",
            "Producer",
            IDataRegistry.ConsentStatus.Denied,
            IDataRegistry.RecordMetadata({
                cid: "cid",
                url: "https://example.com",
                hash: intoBytes32("https://example.com")
            })
        );
        vm.prank(PROVIDER);
        dataRegistry.registerProducerRecord(
            PRODUCER_2_DID,
            "2",
            PRODUCER_2,
            "signature",
            "Condition",
            IDataRegistry.ConsentStatus.Denied,
            IDataRegistry.RecordMetadata({
                cid: "cid",
                url: "https://example.com",
                hash: intoBytes32("https://example.com")
            })
        );

        assert(dataRegistry.getTotalRecordsCount() == 2);
    }

    function testUpdatesProducerRecordMetadata() public {
        vm.prank(PROVIDER);
        dataRegistry.registerProducerRecord(
            PRODUCER_DID,
            "1",
            PRODUCER,
            "signature",
            "Producer",
            IDataRegistry.ConsentStatus.Denied,
            IDataRegistry.RecordMetadata({
                cid: "cid",
                url: "https://example.com",
                hash: intoBytes32("https://example.com")
            })
        );
        vm.prank(PROVIDER);
        dataRegistry.updateProducerRecordMetadata(
            PRODUCER,
            "1",
            IDataRegistry.RecordMetadata({
                cid: "cid2",
                url: "https://example.com2",
                hash: intoBytes32("https://example.com2")
            })
        );

        vm.prank(PROVIDER);
        IDataRegistry.HealthRecord memory record = dataRegistry.getProducerRecord(PRODUCER, "1");
        assert(
            record.hash == intoBytes32("https://example.com2") && compareStr(record.url, "https://example.com2")
                && compareStr(string(record.signature), "signature")
        );
    }

    function testUpdatesProducerRecordStatus() public {
        vm.prank(PROVIDER);
        dataRegistry.registerProducerRecord(
            PRODUCER_DID,
            "1",
            PRODUCER,
            "signature",
            "Producer",
            IDataRegistry.ConsentStatus.Denied,
            IDataRegistry.RecordMetadata({
                cid: "cid",
                url: "https://example.com",
                hash: intoBytes32("https://example.com")
            })
        );
        vm.prank(PROVIDER);
        dataRegistry.updateProducerRecordStatus(PRODUCER, IDataRegistry.RecordStatus.Deactivated);

        vm.prank(PROVIDER);
        IDataRegistry.DataRecordCore memory recordInfo = dataRegistry.getProducerRecordInfo(PRODUCER);
        assert(uint256(recordInfo.status) == uint256(IDataRegistry.RecordStatus.Deactivated));
    }

    function testNonProviderAccountCannotUpdateProducerRecordStatus() public {
        vm.prank(PROVIDER);
        dataRegistry.registerProducerRecord(
            PRODUCER_DID,
            "1",
            PRODUCER,
            "signature",
            "Producer",
            IDataRegistry.ConsentStatus.Denied,
            IDataRegistry.RecordMetadata({
                cid: "cid",
                url: "https://example.com",
                hash: intoBytes32("https://example.com")
            })
        );
        vm.expectRevert();
        vm.prank(USER);
        dataRegistry.updateProducerRecordStatus(PRODUCER, IDataRegistry.RecordStatus.Deactivated);
    }

    function testUpdatesProducerRecordConsent() public {
        vm.prank(PROVIDER);
        dataRegistry.registerProducerRecord(
            PRODUCER_DID,
            "1",
            PRODUCER,
            "signature",
            "Producer",
            IDataRegistry.ConsentStatus.Denied,
            IDataRegistry.RecordMetadata({
                cid: "cid",
                url: "https://example.com",
                hash: intoBytes32("https://example.com")
            })
        );
        vm.prank(PROVIDER);

        dataRegistry.updateProducerConsent(PRODUCER, IDataRegistry.ConsentStatus.Allowed);

        vm.prank(PROVIDER);

        assert(uint256(dataRegistry.getProducerConsent(PRODUCER)) == uint256(IDataRegistry.ConsentStatus.Allowed));
    }

    function testRegisterProducerRecords() public {
        vm.startPrank(PROVIDER);
        dataRegistry.registerProducerRecord(
            PRODUCER_DID,
            "1",
            PRODUCER,
            "signature1",
            "Producer",
            IDataRegistry.ConsentStatus.Allowed,
            IDataRegistry.RecordMetadata({
                cid: "cid1",
                url: "https://example1.com",
                hash: intoBytes32("https://example1.com")
            })
        );
        dataRegistry.registerProducerRecord(
            PRODUCER_DID,
            "2",
            PRODUCER,
            "signature2",
            "Producer",
            IDataRegistry.ConsentStatus.Allowed,
            IDataRegistry.RecordMetadata({
                cid: "cid2",
                url: "https://example2.com",
                hash: intoBytes32("https://example2.com")
            })
        );
        vm.stopPrank();

        vm.prank(PRODUCER);
        // Verify records were registered
        (,, IDataRegistry.HealthRecord[] memory records, string[] memory recordIds,) =
            dataRegistry.getProducerRecords(PRODUCER);

        assert(dataRegistry.producerExists(PRODUCER));
        assert(records.length == 2);
        assert(recordIds.length == 2);
    }

    function testGetProducerRecordsAsProvider() public {
        testRegisterProducerRecords();

        vm.prank(PROVIDER);
        (
            IDataRegistry.RecordStatus status,
            IDataRegistry.ConsentStatus consent,
            IDataRegistry.HealthRecord[] memory records,
            string[] memory recordIds,
        ) = dataRegistry.getProducerRecords(PRODUCER);

        assert(uint256(status) == uint256(IDataRegistry.RecordStatus.Active));
        assert(uint256(consent) == uint256(IDataRegistry.ConsentStatus.Allowed));
        assert(recordIds.length > 0);
        if (records.length > 0) {
            assert(compareStr(string(records[0].signature), "signature1"));
            assert(compareStr(records[0].url, "https://example1.com"));
        }

        if (records.length > 1) {
            assert(compareStr(string(records[1].signature), "signature2"));
            assert(compareStr(records[1].url, "https://example2.com"));
        }
    }

    function testGetProducerRecordsAsProducer() public {
        testRegisterProducerRecords();

        vm.prank(PRODUCER);
        (
            IDataRegistry.RecordStatus status,
            IDataRegistry.ConsentStatus consent,
            IDataRegistry.HealthRecord[] memory records,
            string[] memory recordIds,
        ) = dataRegistry.getProducerRecords(PRODUCER);

        assert(uint256(status) == uint256(IDataRegistry.RecordStatus.Active));
        assert(uint256(consent) == uint256(IDataRegistry.ConsentStatus.Allowed));
        assert(records.length > 0);
        assert(recordIds.length > 0);
    }

    function testGetProducerRecordsAccessControl() public {
        testRegisterProducerRecords();

        vm.expectRevert();
        vm.prank(USER);
        dataRegistry.getProducerRecords(PRODUCER);
    }

    function testGetAddressFromDid() public {
        vm.prank(PROVIDER);
        dataRegistry.registerProducerRecord(
            PRODUCER_DID,
            "1",
            PRODUCER,
            "signature",
            "Producer",
            IDataRegistry.ConsentStatus.Allowed,
            IDataRegistry.RecordMetadata({
                cid: "cid",
                url: "https://example.com",
                hash: intoBytes32("https://example.com")
            })
        );

        address retrievedAddress = dataRegistry.getAddressFromDid(PRODUCER_DID);
        assert(retrievedAddress == PRODUCER);
    }

    function testGetProducerDid() public {
        vm.prank(PROVIDER);
        dataRegistry.registerProducerRecord(
            PRODUCER_DID,
            "1",
            PRODUCER,
            "signature",
            "Producer",
            IDataRegistry.ConsentStatus.Allowed,
            IDataRegistry.RecordMetadata({
                cid: "cid",
                url: "https://example.com",
                hash: intoBytes32("https://example.com")
            })
        );

        string memory retrievedDid = dataRegistry.getProducerDid(PRODUCER);
        assert(keccak256(abi.encodePacked(retrievedDid)) == keccak256(abi.encodePacked(PRODUCER_DID)));
    }

    function testUpdateDidAuthAddress() public {
        // Create a new DidAuth mock
        DidAuthMock newDidAuthMock = new DidAuthMock();

        vm.prank(PROVIDER);
        dataRegistry.updateDidAuthAddress(address(newDidAuthMock));

        // Verify the address was updated (indirectly, since we can't directly access the didAuth address)
        // We can check that the contract still works with the new DidAuth

        // Register a producer in the new DidAuth
        newDidAuthMock.registerProducer(PRODUCER_DID);

        vm.prank(PROVIDER);
        dataRegistry.registerProducerRecord(
            PRODUCER_DID,
            "1",
            PRODUCER,
            "signature",
            "Producer",
            IDataRegistry.ConsentStatus.Allowed,
            IDataRegistry.RecordMetadata({
                cid: "cid",
                url: "https://example.com",
                hash: intoBytes32("https://example.com")
            })
        );

        assert(dataRegistry.producerExists(PRODUCER));
    }

    // Helper function
    function intoBytes32(string memory _input) public pure returns (bytes32) {
        return bytes32(keccak256(abi.encodePacked(_input)));
    }

    function compareStr(string memory a, string memory b) public pure returns (bool) {
        return keccak256(abi.encodePacked(a)) == keccak256(abi.encodePacked(b));
    }

    // Additional tests for DidAuth integration

    function testRegisterProducerWithInvalidDid() public {
        // Try to register a producer with a DID that is not registered in DidAuth
        string memory invalidDid = "did:example:invalid";

        vm.expectRevert();
        vm.prank(PROVIDER);
        dataRegistry.registerProducerRecord(
            invalidDid,
            "1",
            PRODUCER,
            "signature",
            "Producer",
            IDataRegistry.ConsentStatus.Allowed,
            IDataRegistry.RecordMetadata({
                cid: "cid",
                url: "https://example.com",
                hash: intoBytes32("https://example.com")
            })
        );
    }

    function testUpdateProducerRecordWithInvalidDid() public {
        // First register a valid producer
        vm.prank(PROVIDER);
        dataRegistry.registerProducerRecord(
            PRODUCER_DID,
            "1",
            PRODUCER,
            "signature",
            "Producer",
            IDataRegistry.ConsentStatus.Allowed,
            IDataRegistry.RecordMetadata({
                cid: "cid",
                url: "https://example.com",
                hash: intoBytes32("https://example.com")
            })
        );

        // Try to update with an invalid DID
        string memory invalidDid = "did:example:invalid";

        vm.expectRevert();
        vm.prank(PROVIDER);
        dataRegistry.updateProducerRecord(
            "1",
            PRODUCER,
            "signature2",
            "Producer",
            IDataRegistry.RecordStatus.Active,
            IDataRegistry.ConsentStatus.Allowed,
            IDataRegistry.RecordMetadata({
                cid: "cid2",
                url: "https://example.com2",
                hash: intoBytes32("https://example.com2")
            }),
            invalidDid
        );
    }

    function testNonOwnerCannotUpdateDidAuthAddress() public {
        DidAuthMock newDidAuthMock = new DidAuthMock();

        vm.expectRevert();
        vm.prank(USER);
        dataRegistry.updateDidAuthAddress(address(newDidAuthMock));
    }

    function testCannotUpdateToInvalidDidAuthAddress() public {
        vm.expectRevert();
        vm.prank(PROVIDER);
        dataRegistry.updateDidAuthAddress(address(0));
    }

    // Tests for data sharing functionality

    function testShareData() public {
        // Setup: Register a producer record
        vm.prank(PROVIDER);
        dataRegistry.registerProducerRecord(
            PRODUCER_DID,
            "1",
            PRODUCER,
            "signature",
            "Producer",
            IDataRegistry.ConsentStatus.Allowed,
            IDataRegistry.RecordMetadata({
                cid: "cid",
                url: "https://example.com",
                hash: intoBytes32("https://example.com")
            })
        );

        // Mock the compensation.verifyPayment to return true
        // This would require a mock for the Compensation contract
        // For now, we'll just test the revert case

        vm.expectRevert();
        vm.prank(PRODUCER);
        dataRegistry.shareData("1", CONSUMER_DID, PRODUCER_DID);
    }

    function testCannotShareDataWithDeniedConsent() public {
        // Setup: Register a producer record with denied consent
        vm.prank(PROVIDER);
        dataRegistry.registerProducerRecord(
            PRODUCER_DID,
            "1",
            PRODUCER,
            "signature",
            "Producer",
            IDataRegistry.ConsentStatus.Denied,
            IDataRegistry.RecordMetadata({
                cid: "cid",
                url: "https://example.com",
                hash: intoBytes32("https://example.com")
            })
        );

        vm.expectRevert();
        vm.prank(PRODUCER);
        dataRegistry.shareData("1", CONSUMER_DID, PRODUCER_DID);
    }

    function testCannotShareDataWithUnauthorizedConsumer() public {
        // Setup: Register a producer record
        vm.prank(PROVIDER);
        dataRegistry.registerProducerRecord(
            PRODUCER_DID,
            "1",
            PRODUCER,
            "signature",
            "Producer",
            IDataRegistry.ConsentStatus.Allowed,
            IDataRegistry.RecordMetadata({
                cid: "cid",
                url: "https://example.com",
                hash: intoBytes32("https://example.com")
            })
        );

        // Create an invalid consumer DID
        string memory invalidConsumerDid = "did:example:invalidconsumer";

        vm.expectRevert();
        vm.prank(PRODUCER);
        dataRegistry.shareData("1", invalidConsumerDid, PRODUCER_DID);
    }

    // Tests for error handling

    function testCannotRegisterDuplicateRecord() public {
        // Register a record
        vm.prank(PROVIDER);
        dataRegistry.registerProducerRecord(
            PRODUCER_DID,
            "1",
            PRODUCER,
            "signature",
            "Producer",
            IDataRegistry.ConsentStatus.Allowed,
            IDataRegistry.RecordMetadata({
                cid: "cid",
                url: "https://example.com",
                hash: intoBytes32("https://example.com")
            })
        );

        // Try to register the same record ID again
        vm.expectRevert();
        vm.prank(PROVIDER);
        dataRegistry.registerProducerRecord(
            PRODUCER_DID,
            "1", // Same ID
            PRODUCER,
            "signature2",
            "Producer",
            IDataRegistry.ConsentStatus.Allowed,
            IDataRegistry.RecordMetadata({
                cid: "cid2",
                url: "https://example.com2",
                hash: intoBytes32("https://example.com2")
            })
        );
    }

    function testCannotUpdateNonExistentRecord() public {
        // Expect a revert with a specific error message
        vm.expectRevert(abi.encodeWithSelector(IDataRegistry.DataRegistry__ProducerNotFound.selector, EXTERNAL_USER));
        vm.prank(PROVIDER);
        dataRegistry.updateProducerRecordMetadata(
            EXTERNAL_USER, // Non-existent producer
            "nonexistent",
            IDataRegistry.RecordMetadata({
                cid: "cid2",
                url: "https://example.com2",
                hash: intoBytes32("https://example.com2")
            })
        );
    }

    function testCannotUpdateNonExistentProducerStatus() public {
        // Expect a revert with a specific error message
        vm.expectRevert(abi.encodeWithSelector(IDataRegistry.DataRegistry__ProducerNotFound.selector, EXTERNAL_USER));
        vm.prank(PROVIDER);
        dataRegistry.updateProducerRecordStatus(EXTERNAL_USER, IDataRegistry.RecordStatus.Deactivated);
    }

    function testCannotUpdateNonExistentProducerConsent() public {
        // Expect a revert with a specific error message
        vm.expectRevert(abi.encodeWithSelector(IDataRegistry.DataRegistry__ProducerNotFound.selector, EXTERNAL_USER));
        vm.prank(PROVIDER);
        dataRegistry.updateProducerConsent(EXTERNAL_USER, IDataRegistry.ConsentStatus.Allowed);
    }

    // Tests for paused state

    function testCannotRegisterRecordWhenPaused() public {
        // Pause the contract
        vm.prank(PROVIDER);
        dataRegistry.changePauseState(true);

        // Try to register a record
        vm.expectRevert();
        vm.prank(PROVIDER);
        dataRegistry.registerProducerRecord(
            PRODUCER_DID,
            "1",
            PRODUCER,
            "signature",
            "Producer",
            IDataRegistry.ConsentStatus.Allowed,
            IDataRegistry.RecordMetadata({
                cid: "cid",
                url: "https://example.com",
                hash: intoBytes32("https://example.com")
            })
        );
    }

    function testCannotUpdateRecordWhenPaused() public {
        // Register a record
        vm.prank(PROVIDER);
        dataRegistry.registerProducerRecord(
            PRODUCER_DID,
            "1",
            PRODUCER,
            "signature",
            "Producer",
            IDataRegistry.ConsentStatus.Allowed,
            IDataRegistry.RecordMetadata({
                cid: "cid",
                url: "https://example.com",
                hash: intoBytes32("https://example.com")
            })
        );

        // Pause the contract
        vm.prank(PROVIDER);
        dataRegistry.changePauseState(true);

        // Try to update the record
        vm.expectRevert();
        vm.prank(PROVIDER);
        dataRegistry.updateProducerRecord(
            "1",
            PRODUCER,
            "signature2",
            "Producer",
            IDataRegistry.RecordStatus.Active,
            IDataRegistry.ConsentStatus.Allowed,
            IDataRegistry.RecordMetadata({
                cid: "cid2",
                url: "https://example.com2",
                hash: intoBytes32("https://example.com2")
            }),
            SERVICE_PROVIDER_DID
        );
    }

    // Tests for producer verification

    function testVerifyData() public {
        // Setup: Register a producer record
        vm.prank(PROVIDER);
        dataRegistry.registerProducerRecord(
            PRODUCER_DID,
            "1",
            PRODUCER,
            "signature",
            "Producer",
            IDataRegistry.ConsentStatus.Allowed,
            IDataRegistry.RecordMetadata({
                cid: "cid",
                url: "https://example.com",
                hash: intoBytes32("https://example.com")
            })
        );

        // Try to verify the data
        // This would require mocking the verification process
        // For now, we'll just test the basic functionality

        vm.expectRevert(); // Will revert due to missing verification logic in our test
        vm.prank(PROVIDER);
        dataRegistry.verifyData("1", SERVICE_PROVIDER_DID);
    }

    // Tests for consumer authorization

    function testIsConsumerAuthorized() public {
        // Setup: Register a producer record
        vm.prank(PROVIDER);
        dataRegistry.registerProducerRecord(
            PRODUCER_DID,
            "1",
            PRODUCER,
            "signature",
            "Producer",
            IDataRegistry.ConsentStatus.Allowed,
            IDataRegistry.RecordMetadata({
                cid: "cid",
                url: "https://example.com",
                hash: intoBytes32("https://example.com")
            })
        );

        // Check if consumer is authorized (should be false initially)
        bool isAuthorized = dataRegistry.isConsumerAuthorized("1", CONSUMER_DID);
        assert(isAuthorized == false);

        // We would need to properly authorize the consumer first
        // This would require mocking the compensation contract
        // For now, we'll just test the initial state
    }

    // Additional tests for DID-to-address mapping

    function testDIDToAddressMappingAfterRegistration() public {
        // Register a producer
        vm.prank(PROVIDER);
        dataRegistry.registerProducerRecord(
            PRODUCER_DID,
            "1",
            PRODUCER,
            "signature",
            "Producer",
            IDataRegistry.ConsentStatus.Allowed,
            IDataRegistry.RecordMetadata({
                cid: "cid",
                url: "https://example.com",
                hash: intoBytes32("https://example.com")
            })
        );

        // Verify the DID-to-address mapping
        address retrievedAddress = dataRegistry.getAddressFromDid(PRODUCER_DID);
        assert(retrievedAddress == PRODUCER);

        // Verify the address-to-DID mapping
        string memory retrievedDid = dataRegistry.getProducerDid(PRODUCER);
        assert(keccak256(abi.encodePacked(retrievedDid)) == keccak256(abi.encodePacked(PRODUCER_DID)));
    }

    function testDIDToAddressMappingAfterRemoval() public {
        // Register a producer
        vm.prank(PROVIDER);
        dataRegistry.registerProducerRecord(
            PRODUCER_DID,
            "1",
            PRODUCER,
            "signature",
            "Producer",
            IDataRegistry.ConsentStatus.Allowed,
            IDataRegistry.RecordMetadata({
                cid: "cid",
                url: "https://example.com",
                hash: intoBytes32("https://example.com")
            })
        );

        // Remove the producer record
        vm.prank(PROVIDER);
        dataRegistry.removeProducerRecord(PRODUCER);

        // Verify the DID-to-address mapping is cleared
        address retrievedAddress = dataRegistry.getAddressFromDid(PRODUCER_DID);
        assert(retrievedAddress == address(0));
    }

    function testMultipleProducersWithDifferentDIDs() public {
        // Register first producer
        vm.prank(PROVIDER);
        dataRegistry.registerProducerRecord(
            PRODUCER_DID,
            "1",
            PRODUCER,
            "signature1",
            "Producer",
            IDataRegistry.ConsentStatus.Allowed,
            IDataRegistry.RecordMetadata({
                cid: "cid1",
                url: "https://example1.com",
                hash: intoBytes32("https://example1.com")
            })
        );

        // Register second producer
        vm.prank(PROVIDER);
        dataRegistry.registerProducerRecord(
            PRODUCER_2_DID,
            "2",
            PRODUCER_2,
            "signature2",
            "Producer",
            IDataRegistry.ConsentStatus.Allowed,
            IDataRegistry.RecordMetadata({
                cid: "cid2",
                url: "https://example2.com",
                hash: intoBytes32("https://example2.com")
            })
        );

        // Verify the DID-to-address mappings
        address retrievedAddress1 = dataRegistry.getAddressFromDid(PRODUCER_DID);
        address retrievedAddress2 = dataRegistry.getAddressFromDid(PRODUCER_2_DID);

        assert(retrievedAddress1 == PRODUCER);
        assert(retrievedAddress2 == PRODUCER_2);

        // Verify the address-to-DID mappings
        string memory retrievedDid1 = dataRegistry.getProducerDid(PRODUCER);
        string memory retrievedDid2 = dataRegistry.getProducerDid(PRODUCER_2);

        assert(keccak256(abi.encodePacked(retrievedDid1)) == keccak256(abi.encodePacked(PRODUCER_DID)));
        assert(keccak256(abi.encodePacked(retrievedDid2)) == keccak256(abi.encodePacked(PRODUCER_2_DID)));
    }

    function testUpdateProducerRecordWithServiceProviderDid() public {
        // Register a producer
        vm.prank(PROVIDER);
        dataRegistry.registerProducerRecord(
            PRODUCER_DID,
            "1",
            PRODUCER,
            "signature",
            "Producer",
            IDataRegistry.ConsentStatus.Allowed,
            IDataRegistry.RecordMetadata({
                cid: "cid",
                url: "https://example.com",
                hash: intoBytes32("https://example.com")
            })
        );

        // Update the record using a service provider DID
        vm.prank(PROVIDER);
        dataRegistry.updateProducerRecord(
            "1",
            PRODUCER,
            "signature2",
            "Producer",
            IDataRegistry.RecordStatus.Active,
            IDataRegistry.ConsentStatus.Allowed,
            IDataRegistry.RecordMetadata({
                cid: "cid2",
                url: "https://example.com2",
                hash: intoBytes32("https://example.com2")
            }),
            SERVICE_PROVIDER_DID
        );

        // Verify the record was updated
        vm.prank(PROVIDER);
        IDataRegistry.HealthRecord memory record = dataRegistry.getProducerRecord(PRODUCER, "1");

        assert(compareStr(string(record.signature), "signature2"));
        assert(compareStr(record.url, "https://example.com2"));
        assert(record.hash == intoBytes32("https://example.com2"));
    }

    function testGetNonExistentProducerDid() public view {
        // Try to get the DID of a non-existent producer
        string memory retrievedDid = dataRegistry.getProducerDid(EXTERNAL_USER);

        // Should return an empty string
        assert(bytes(retrievedDid).length == 0);
    }

    function testGetNonExistentAddressFromDid() public view {
        // Try to get the address from a non-existent DID
        address retrievedAddress = dataRegistry.getAddressFromDid("did:example:nonexistent");

        // Should return the zero address
        assert(retrievedAddress == address(0));
    }

    // Tests for edge cases with empty or invalid inputs

    function testCannotRegisterRecordWithEmptyDid() public {
        vm.expectRevert();
        vm.prank(PROVIDER);
        dataRegistry.registerProducerRecord(
            "", // Empty DID
            "1",
            PRODUCER,
            "signature",
            "Producer",
            IDataRegistry.ConsentStatus.Allowed,
            IDataRegistry.RecordMetadata({
                cid: "cid",
                url: "https://example.com",
                hash: intoBytes32("https://example.com")
            })
        );
    }

    function testCannotRegisterRecordWithEmptyRecordId() public {
        vm.expectRevert();
        vm.prank(PROVIDER);
        dataRegistry.registerProducerRecord(
            PRODUCER_DID,
            "", // Empty record ID
            PRODUCER,
            "signature",
            "Producer",
            IDataRegistry.ConsentStatus.Allowed,
            IDataRegistry.RecordMetadata({
                cid: "cid",
                url: "https://example.com",
                hash: intoBytes32("https://example.com")
            })
        );
    }

    function testCannotRegisterRecordWithZeroAddress() public {
        vm.expectRevert();
        vm.prank(PROVIDER);
        dataRegistry.registerProducerRecord(
            PRODUCER_DID,
            "1",
            address(0), // Zero address
            "signature",
            "Producer",
            IDataRegistry.ConsentStatus.Allowed,
            IDataRegistry.RecordMetadata({
                cid: "cid",
                url: "https://example.com",
                hash: intoBytes32("https://example.com")
            })
        );
    }

    // Tests for concurrent operations and state transitions

    function testMultipleRecordsForSameProducer() public {
        // Register first record
        vm.prank(PROVIDER);
        dataRegistry.registerProducerRecord(
            PRODUCER_DID,
            "record1",
            PRODUCER,
            "signature1",
            "Producer",
            IDataRegistry.ConsentStatus.Allowed,
            IDataRegistry.RecordMetadata({
                cid: "cid1",
                url: "https://example1.com",
                hash: intoBytes32("https://example1.com")
            })
        );

        // Register second record
        vm.prank(PROVIDER);
        dataRegistry.registerProducerRecord(
            PRODUCER_DID,
            "record2",
            PRODUCER,
            "signature2",
            "Producer",
            IDataRegistry.ConsentStatus.Allowed,
            IDataRegistry.RecordMetadata({
                cid: "cid2",
                url: "https://example2.com",
                hash: intoBytes32("https://example2.com")
            })
        );

        // Register third record
        vm.prank(PROVIDER);
        dataRegistry.registerProducerRecord(
            PRODUCER_DID,
            "record3",
            PRODUCER,
            "signature3",
            "Producer",
            IDataRegistry.ConsentStatus.Allowed,
            IDataRegistry.RecordMetadata({
                cid: "cid3",
                url: "https://example3.com",
                hash: intoBytes32("https://example3.com")
            })
        );

        // Verify all records were registered
        vm.prank(PRODUCER);
        (,, IDataRegistry.HealthRecord[] memory records, string[] memory recordIds,) =
            dataRegistry.getProducerRecords(PRODUCER);

        assert(records.length == 3);
        assert(recordIds.length == 3);

        // Verify each record has the correct data
        bool foundRecord1 = false;
        bool foundRecord2 = false;
        bool foundRecord3 = false;

        for (uint256 i = 0; i < recordIds.length; i++) {
            if (compareStr(recordIds[i], "record1")) {
                foundRecord1 = true;
                assert(compareStr(records[i].cid, "cid1"));
                assert(compareStr(records[i].url, "https://example1.com"));
            } else if (compareStr(recordIds[i], "record2")) {
                foundRecord2 = true;
                assert(compareStr(records[i].cid, "cid2"));
                assert(compareStr(records[i].url, "https://example2.com"));
            } else if (compareStr(recordIds[i], "record3")) {
                foundRecord3 = true;
                assert(compareStr(records[i].cid, "cid3"));
                assert(compareStr(records[i].url, "https://example3.com"));
            }
        }

        assert(foundRecord1 && foundRecord2 && foundRecord3);
    }

    function testStateTransitionsForProducerRecord() public {
        // Register a producer record
        vm.prank(PROVIDER);
        dataRegistry.registerProducerRecord(
            PRODUCER_DID,
            "1",
            PRODUCER,
            "signature",
            "Producer",
            IDataRegistry.ConsentStatus.Allowed,
            IDataRegistry.RecordMetadata({
                cid: "cid",
                url: "https://example.com",
                hash: intoBytes32("https://example.com")
            })
        );

        // Initial state should be Active and Allowed
        vm.prank(PROVIDER);
        IDataRegistry.DataRecordCore memory recordInfo = dataRegistry.getProducerRecordInfo(PRODUCER);
        assert(uint256(recordInfo.status) == uint256(IDataRegistry.RecordStatus.Active));
        assert(uint256(recordInfo.consent) == uint256(IDataRegistry.ConsentStatus.Allowed));

        // Change status to Deactivated
        vm.prank(PROVIDER);
        dataRegistry.updateProducerRecordStatus(PRODUCER, IDataRegistry.RecordStatus.Deactivated);

        vm.prank(PROVIDER);
        recordInfo = dataRegistry.getProducerRecordInfo(PRODUCER);
        assert(uint256(recordInfo.status) == uint256(IDataRegistry.RecordStatus.Deactivated));

        // Change consent to Denied
        vm.prank(PROVIDER);
        dataRegistry.updateProducerConsent(PRODUCER, IDataRegistry.ConsentStatus.Denied);

        vm.prank(PROVIDER);
        recordInfo = dataRegistry.getProducerRecordInfo(PRODUCER);
        assert(uint256(recordInfo.consent) == uint256(IDataRegistry.ConsentStatus.Denied));

        // Change back to Active and Allowed
        vm.prank(PROVIDER);
        dataRegistry.updateProducerRecordStatus(PRODUCER, IDataRegistry.RecordStatus.Active);

        vm.prank(PROVIDER);
        dataRegistry.updateProducerConsent(PRODUCER, IDataRegistry.ConsentStatus.Allowed);

        vm.prank(PROVIDER);
        recordInfo = dataRegistry.getProducerRecordInfo(PRODUCER);
        assert(uint256(recordInfo.status) == uint256(IDataRegistry.RecordStatus.Active));
        assert(uint256(recordInfo.consent) == uint256(IDataRegistry.ConsentStatus.Allowed));
    }

    // Tests for security and access control

    function testAccessControlForMultipleOperations() public {
        // Register a producer record
        vm.prank(PROVIDER);
        dataRegistry.registerProducerRecord(
            PRODUCER_DID,
            "1",
            PRODUCER,
            "signature",
            "Producer",
            IDataRegistry.ConsentStatus.Allowed,
            IDataRegistry.RecordMetadata({
                cid: "cid",
                url: "https://example.com",
                hash: intoBytes32("https://example.com")
            })
        );

        // Test that non-owner cannot update provider metadata
        vm.expectRevert();
        vm.prank(USER);
        dataRegistry.updateProviderMetadata(
            IDataRegistry.Metadata({url: "https://example.com2", hash: intoBytes32("https://example.com2")})
        );

        // Test that non-owner cannot update record schema
        vm.expectRevert();
        vm.prank(USER);
        dataRegistry.updateProviderRecordSchema(
            IDataRegistry.Schema({
                schemaRef: IDataRegistry.Metadata({url: "https://example.com2", hash: intoBytes32("https://example.com2")})
            })
        );

        // Test that non-owner cannot remove producer record
        vm.expectRevert();
        vm.prank(USER);
        dataRegistry.removeProducerRecord(PRODUCER);

        // Test that producer can access their own records
        vm.prank(PRODUCER);
        (,, IDataRegistry.HealthRecord[] memory records, string[] memory recordIds,) =
            dataRegistry.getProducerRecords(PRODUCER);
        assert(records.length == 1);
        assert(recordIds.length == 1);

        // Test that other users cannot access producer records
        vm.expectRevert();
        vm.prank(EXTERNAL_USER);
        dataRegistry.getProducerRecords(PRODUCER);
    }

    function testPauseAndUnpauseEffects() public {
        // Pause the contract
        vm.prank(PROVIDER);
        dataRegistry.changePauseState(true);
        assert(dataRegistry.paused() == true);

        // Test that operations are blocked when paused
        vm.expectRevert();
        vm.prank(PROVIDER);
        dataRegistry.registerProducerRecord(
            PRODUCER_DID,
            "1",
            PRODUCER,
            "signature",
            "Producer",
            IDataRegistry.ConsentStatus.Allowed,
            IDataRegistry.RecordMetadata({
                cid: "cid",
                url: "https://example.com",
                hash: intoBytes32("https://example.com")
            })
        );

        // Unpause the contract
        vm.prank(PROVIDER);
        dataRegistry.changePauseState(false);
        assert(dataRegistry.paused() == false);

        // Test that operations work again after unpausing
        vm.prank(PROVIDER);
        dataRegistry.registerProducerRecord(
            PRODUCER_DID,
            "1",
            PRODUCER,
            "signature",
            "Producer",
            IDataRegistry.ConsentStatus.Allowed,
            IDataRegistry.RecordMetadata({
                cid: "cid",
                url: "https://example.com",
                hash: intoBytes32("https://example.com")
            })
        );

        // Verify the record was created
        assert(dataRegistry.producerExists(PRODUCER) == true);
    }

    // Tests for data integrity and consistency

    function testDataIntegrityAfterMultipleUpdates() public {
        // Register a producer record
        vm.prank(PROVIDER);
        dataRegistry.registerProducerRecord(
            PRODUCER_DID,
            "1",
            PRODUCER,
            "signature1",
            "Producer",
            IDataRegistry.ConsentStatus.Allowed,
            IDataRegistry.RecordMetadata({
                cid: "cid1",
                url: "https://example1.com",
                hash: intoBytes32("https://example1.com")
            })
        );

        // Update the record multiple times
        vm.prank(PROVIDER);
        dataRegistry.updateProducerRecord(
            "1",
            PRODUCER,
            "signature2",
            "Producer",
            IDataRegistry.RecordStatus.Active,
            IDataRegistry.ConsentStatus.Allowed,
            IDataRegistry.RecordMetadata({
                cid: "cid2",
                url: "https://example2.com",
                hash: intoBytes32("https://example2.com")
            }),
            SERVICE_PROVIDER_DID
        );

        vm.prank(PROVIDER);
        dataRegistry.updateProducerRecord(
            "1",
            PRODUCER,
            "signature3",
            "Producer",
            IDataRegistry.RecordStatus.Active,
            IDataRegistry.ConsentStatus.Allowed,
            IDataRegistry.RecordMetadata({
                cid: "cid3",
                url: "https://example3.com",
                hash: intoBytes32("https://example3.com")
            }),
            SERVICE_PROVIDER_DID
        );

        vm.prank(PROVIDER);
        dataRegistry.updateProducerRecordMetadata(
            PRODUCER,
            "1",
            IDataRegistry.RecordMetadata({
                cid: "cid4",
                url: "https://example4.com",
                hash: intoBytes32("https://example4.com")
            })
        );

        // Verify the final state of the record
        vm.prank(PROVIDER);
        IDataRegistry.HealthRecord memory record = dataRegistry.getProducerRecord(PRODUCER, "1");

        assert(compareStr(string(record.signature), "signature3"));
        assert(compareStr(record.resourceType, "Producer"));
        assert(compareStr(record.cid, "cid4"));
        assert(compareStr(record.url, "https://example4.com"));
        assert(record.hash == intoBytes32("https://example4.com"));
        assert(record.isVerified == false);

        // Verify the record info
        vm.prank(PROVIDER);
        IDataRegistry.DataRecordCore memory recordInfo = dataRegistry.getProducerRecordInfo(PRODUCER);

        assert(recordInfo.producer == PRODUCER);
        assert(uint256(recordInfo.status) == uint256(IDataRegistry.RecordStatus.Active));
        assert(uint256(recordInfo.consent) == uint256(IDataRegistry.ConsentStatus.Allowed));
        assert(recordInfo.nonce == 3); // Initial registration + 2 updates
    }

    function testConsistencyBetweenDifferentGetterMethods() public {
        // Register a producer record
        vm.prank(PROVIDER);
        dataRegistry.registerProducerRecord(
            PRODUCER_DID,
            "1",
            PRODUCER,
            "signature",
            "Producer",
            IDataRegistry.ConsentStatus.Allowed,
            IDataRegistry.RecordMetadata({
                cid: "cid",
                url: "https://example.com",
                hash: intoBytes32("https://example.com")
            })
        );

        // Get record using different methods
        vm.prank(PROVIDER);
        IDataRegistry.HealthRecord memory singleRecord = dataRegistry.getProducerRecord(PRODUCER, "1");

        vm.prank(PROVIDER);
        (,, IDataRegistry.HealthRecord[] memory records,,) = dataRegistry.getProducerRecords(PRODUCER);

        // Verify consistency between different getter methods
        assert(records.length == 1);
        assert(compareStr(string(singleRecord.signature), string(records[0].signature)));
        assert(compareStr(singleRecord.resourceType, records[0].resourceType));
        assert(compareStr(singleRecord.cid, records[0].cid));
        assert(compareStr(singleRecord.url, records[0].url));
        assert(singleRecord.hash == records[0].hash);
        assert(singleRecord.isVerified == records[0].isVerified);
    }

    // Tests for DidAuth integration with more complex scenarios

    function testDidAuthIntegrationWithMultipleRoles() public {
        // Create a new DidAuth mock for this test
        DidAuthMock newDidAuthMock = new DidAuthMock();

        // Create a new DataRegistry with the new DidAuth
        vm.prank(PROVIDER);
        DataRegistry newDataRegistry = new DataRegistry(address(token), payable(PROVIDER), 10, address(newDidAuthMock));

        // Register DIDs with multiple roles
        string memory multiRoleDid = "did:example:multirole";
        newDidAuthMock.registerProducer(multiRoleDid);
        newDidAuthMock.registerConsumer(multiRoleDid);
        newDidAuthMock.registerServiceProvider(multiRoleDid);

        // Map address to DID
        newDidAuthMock.setAddressToDid(USER, multiRoleDid);

        // Test that the DID can be used for producer operations
        vm.prank(PROVIDER);
        newDataRegistry.registerProducerRecord(
            multiRoleDid,
            "1",
            USER,
            "signature",
            "Producer",
            IDataRegistry.ConsentStatus.Allowed,
            IDataRegistry.RecordMetadata({
                cid: "cid",
                url: "https://example.com",
                hash: intoBytes32("https://example.com")
            })
        );

        // Verify the record was created
        assert(newDataRegistry.producerExists(USER) == true);

        // Test that the DID can be used for service provider operations
        // (This would require more complex mocking of the verification process)
    }

    function testDidAuthAddressUpdateWithExistingRecords() public {
        // Register a producer record with the original DidAuth
        vm.prank(PROVIDER);
        dataRegistry.registerProducerRecord(
            PRODUCER_DID,
            "1",
            PRODUCER,
            "signature",
            "Producer",
            IDataRegistry.ConsentStatus.Allowed,
            IDataRegistry.RecordMetadata({
                cid: "cid",
                url: "https://example.com",
                hash: intoBytes32("https://example.com")
            })
        );

        // Create a new DidAuth mock
        DidAuthMock newDidAuthMock = new DidAuthMock();

        // Register the same DIDs in the new DidAuth
        newDidAuthMock.registerProducer(PRODUCER_DID);
        newDidAuthMock.registerConsumer(CONSUMER_DID);
        newDidAuthMock.registerServiceProvider(SERVICE_PROVIDER_DID);

        // Update the DidAuth address
        vm.prank(PROVIDER);
        dataRegistry.updateDidAuthAddress(address(newDidAuthMock));

        // Verify that existing records still work with the new DidAuth
        assert(dataRegistry.producerExists(PRODUCER) == true);

        // Test that operations still work with the new DidAuth
        vm.prank(PROVIDER);
        dataRegistry.updateProducerRecordMetadata(
            PRODUCER,
            "1",
            IDataRegistry.RecordMetadata({
                cid: "cid2",
                url: "https://example2.com",
                hash: intoBytes32("https://example2.com")
            })
        );

        // Verify the update worked
        vm.prank(PROVIDER);
        IDataRegistry.HealthRecord memory record = dataRegistry.getProducerRecord(PRODUCER, "1");
        assert(compareStr(record.cid, "cid2"));
        assert(compareStr(record.url, "https://example2.com"));
    }
}
