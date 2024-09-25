// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

interface ICompensation {
    // /**
    //  * @dev -
    //  * @param _producer
    //  * @param _recordId
    //  * @param dataSize
    //  */
    function processPayment(
        address _producer,
        string memory _recordId,
        uint256 dataSize
    ) external;

    function verifyPayment(
        string memory _recordId
    ) external view returns (bool);

    function withdrawProducerBalance(uint256 _amount) external;

    function withdrawServiceFee(uint256 _amount) external;

    function removeProducer(address _producer) external;

    function changeServiceFee(uint256 _newServiceFee) external;

    function changeUnitPrice(uint256 _newUnitPrice) external;

    function setMinimumWithdrawAmount(uint256 _amount) external;

    function pauseService() external;

    function unpauseService() external;

    function getServiceFee() external view returns (uint256);

    function getLeveaWallet() external view returns (address);

    function getLeveaWalletBalance() external view returns (uint256);

    function getProducerBalance() external view returns (uint256);

    function getProducerBalance(
        address _producer
    ) external view returns (uint256);

    function getMinimumWithdrawAmount() external view returns (uint256);

    function producerExist(address _producer) external view returns (bool);

    function getUnitPrice() external view returns (uint256);
}
