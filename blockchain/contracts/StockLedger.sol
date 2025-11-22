// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

contract StockLedger {
    event OperationRecorded(
        string operationId,
        string opType,
        uint256 timestamp,
        address indexed actor
    );

    function recordOperation(
        string memory operationId,
        string memory opType,
        uint256 timestamp
    ) public {
        emit OperationRecorded(operationId, opType, timestamp, msg.sender);
    }
}
