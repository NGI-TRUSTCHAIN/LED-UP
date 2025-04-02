// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import {CompensationCore} from "../core/CompensationCore.sol";
import {ValidationLib} from "../libraries/ValidationLib.sol";
import {SecurityLib} from "../libraries/SecurityLib.sol";

/**
 * @title CompensationExtended
 * @dev Extended implementation of the Compensation contract with additional features
 * @notice This contract extends the core Compensation contract with additional functionality
 */
contract CompensationExtended is CompensationCore {
    /*===================== ERRORS ======================*/
    error CompensationExtended__InvalidAmount();
    error CompensationExtended__InvalidTimestamp();
    error CompensationExtended__InvalidSignature();
    error CompensationExtended__InvalidPeriod();
    error CompensationExtended__InvalidRate();
    error CompensationExtended__InvalidParticipant();
    error CompensationExtended__AlreadyProcessed();

    /*===================== STRUCTS ======================*/
    /**
     * @dev Compensation rate structure
     */
    struct CompensationRate {
        string rateType;
        uint256 baseRate;
        uint256 bonusRate;
        uint256 timestamp;
        bool active;
    }

    /**
     * @dev Compensation period structure
     */
    struct CompensationPeriod {
        uint256 startTime;
        uint256 endTime;
        bool processed;
        uint256 totalAmount;
    }

    /**
     * @dev Participant statistics structure
     */
    struct ParticipantStats {
        uint256 totalCompensation;
        uint256 lastCompensationTime;
        uint256 compensationCount;
        uint256 averageCompensation;
    }

    /*===================== VARIABLES ======================*/
    // Compensation rates
    mapping(string => CompensationRate) private compensationRates;
    string[] private rateTypes;

    // Compensation periods
    mapping(uint256 => CompensationPeriod) private compensationPeriods;
    uint256[] private periodIds;

    // Participant statistics
    mapping(address => ParticipantStats) private participantStats;

    // Used nonces for replay protection
    mapping(bytes32 => bool) private usedNonces;

    /*===================== EVENTS ======================*/
    event RateUpdated(string indexed rateType, uint256 baseRate, uint256 bonusRate);
    event PeriodCreated(uint256 indexed periodId, uint256 startTime, uint256 endTime);
    event PeriodProcessed(uint256 indexed periodId, uint256 totalAmount);
    event ParticipantStatisticsUpdated(address indexed participant, uint256 totalCompensation);

    /*===================== CONSTRUCTOR ======================*/
    /**
     * @dev Constructor
     * @param _token The address of the token contract
     * @param _didRegistry The address of the DID registry
     * @param _dataRegistry The address of the data registry
     */
    constructor(address _token, address _didRegistry, address _dataRegistry)
        CompensationCore(_token, _didRegistry, _dataRegistry)
    {}

    /*===================== EXTERNAL FUNCTIONS ======================*/
    /**
     * @dev Sets a compensation rate
     * @param rateType The type of rate
     * @param baseRate The base rate
     * @param bonusRate The bonus rate
     */
    function setCompensationRate(string calldata rateType, uint256 baseRate, uint256 bonusRate)
        external
        onlyOwner
        whenNotPausedWithCustomError
    {
        if (baseRate == 0) revert CompensationExtended__InvalidRate();

        bool rateExists = false;
        for (uint256 i = 0; i < rateTypes.length; i++) {
            if (keccak256(bytes(rateTypes[i])) == keccak256(bytes(rateType))) {
                rateExists = true;
                break;
            }
        }

        if (!rateExists) {
            rateTypes.push(rateType);
        }

        compensationRates[rateType] = CompensationRate({
            rateType: rateType,
            baseRate: baseRate,
            bonusRate: bonusRate,
            timestamp: block.timestamp,
            active: true
        });

        emit RateUpdated(rateType, baseRate, bonusRate);
    }

    /**
     * @dev Creates a compensation period
     * @param startTime The start time of the period
     * @param endTime The end time of the period
     * @return periodId The ID of the created period
     */
    function createCompensationPeriod(uint256 startTime, uint256 endTime)
        external
        onlyOwner
        whenNotPausedWithCustomError
        returns (uint256 periodId)
    {
        if (startTime >= endTime) revert CompensationExtended__InvalidPeriod();
        if (startTime < block.timestamp) revert CompensationExtended__InvalidTimestamp();

        periodId = periodIds.length;
        periodIds.push(periodId);

        compensationPeriods[periodId] =
            CompensationPeriod({startTime: startTime, endTime: endTime, processed: false, totalAmount: 0});

        emit PeriodCreated(periodId, startTime, endTime);

        return periodId;
    }

    /**
     * @dev Processes a compensation period
     * @param periodId The ID of the period to process
     * @return totalAmount The total amount processed
     */
    function processCompensationPeriod(uint256 periodId)
        external
        onlyOwner
        whenNotPausedWithCustomError
        returns (uint256 totalAmount)
    {
        CompensationPeriod storage period = compensationPeriods[periodId];

        if (period.startTime == 0) revert CompensationExtended__InvalidPeriod();
        if (period.processed) revert CompensationExtended__AlreadyProcessed();
        if (block.timestamp < period.endTime) revert CompensationExtended__InvalidTimestamp();

        // Process compensation for the period
        // This is a simplified implementation
        // In a real implementation, we would calculate compensation for all participants

        // Mark period as processed
        period.processed = true;
        period.totalAmount = totalAmount;

        emit PeriodProcessed(periodId, totalAmount);

        return totalAmount;
    }

    /**
     * @dev Compensates a participant with a signature
     * @param participant The address of the participant
     * @param amount The amount to compensate
     * @param rateType The type of rate
     * @param nonce A unique nonce
     * @param timestamp The timestamp of the compensation
     * @param signature The signature of the compensation data
     * @return success Whether the compensation was successful
     */
    function compensateWithSignature(
        address participant,
        uint256 amount,
        string calldata rateType,
        bytes32 nonce,
        uint256 timestamp,
        bytes calldata signature
    ) external whenNotPausedWithCustomError returns (bool success) {
        if (participant == address(0)) revert CompensationExtended__InvalidParticipant();
        if (amount == 0) revert CompensationExtended__InvalidAmount();

        // Check if nonce has been used
        if (!SecurityLib.validateNonce(usedNonces, nonce)) {
            revert CompensationExtended__InvalidSignature();
        }

        // Check if timestamp is valid (within 5 minutes)
        if (!SecurityLib.validateTimestamp(timestamp, 5 minutes)) {
            revert CompensationExtended__InvalidTimestamp();
        }

        // Verify the signature
        bytes32 messageHash = keccak256(abi.encodePacked(participant, amount, rateType, nonce, timestamp));

        if (!SecurityLib.validateSignature(messageHash, signature, owner())) {
            revert CompensationExtended__InvalidSignature();
        }

        // Compensate the participant
        success = compensateParticipant(participant, amount);

        // Update participant statistics
        if (success) {
            _updateParticipantStats(participant, amount);
        }

        return success;
    }

    /*===================== VIEW FUNCTIONS ======================*/
    /**
     * @dev Gets a compensation rate
     * @param rateType The type of rate
     * @return baseRate The base rate
     * @return bonusRate The bonus rate
     * @return timestamp The timestamp of the rate
     * @return active Whether the rate is active
     */
    function getCompensationRate(string calldata rateType)
        external
        view
        returns (uint256 baseRate, uint256 bonusRate, uint256 timestamp, bool active)
    {
        CompensationRate memory rate = compensationRates[rateType];

        return (rate.baseRate, rate.bonusRate, rate.timestamp, rate.active);
    }

    /**
     * @dev Gets all rate types
     * @return The list of rate types
     */
    function getRateTypes() external view returns (string[] memory) {
        return rateTypes;
    }

    /**
     * @dev Gets a compensation period
     * @param periodId The ID of the period
     * @return startTime The start time of the period
     * @return endTime The end time of the period
     * @return processed Whether the period has been processed
     * @return totalAmount The total amount processed
     */
    function getCompensationPeriod(uint256 periodId)
        external
        view
        returns (uint256 startTime, uint256 endTime, bool processed, uint256 totalAmount)
    {
        CompensationPeriod memory period = compensationPeriods[periodId];

        return (period.startTime, period.endTime, period.processed, period.totalAmount);
    }

    /**
     * @dev Gets all period IDs
     * @return The list of period IDs
     */
    function getPeriodIds() external view returns (uint256[] memory) {
        return periodIds;
    }

    /**
     * @dev Gets participant statistics
     * @param participant The address of the participant
     * @return totalCompensation The total compensation received
     * @return lastCompensationTime The timestamp of the last compensation
     * @return compensationCount The number of compensations received
     * @return averageCompensation The average compensation amount
     */
    function getParticipantStats(address participant)
        external
        view
        returns (
            uint256 totalCompensation,
            uint256 lastCompensationTime,
            uint256 compensationCount,
            uint256 averageCompensation
        )
    {
        ParticipantStats memory stats = participantStats[participant];

        return (stats.totalCompensation, stats.lastCompensationTime, stats.compensationCount, stats.averageCompensation);
    }

    /*===================== INTERNAL FUNCTIONS ======================*/
    /**
     * @dev Updates participant statistics
     * @param participant The address of the participant
     * @param amount The amount of compensation
     */
    function _updateParticipantStats(address participant, uint256 amount) internal {
        ParticipantStats storage stats = participantStats[participant];

        stats.totalCompensation += amount;
        stats.lastCompensationTime = block.timestamp;
        stats.compensationCount++;
        stats.averageCompensation = stats.totalCompensation / stats.compensationCount;

        emit ParticipantStatisticsUpdated(participant, stats.totalCompensation);
    }
}
