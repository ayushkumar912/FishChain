// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import {FisheriesManagement} from "./FisheriesManagement.sol";

contract FishTransfer {
    FisheriesManagement public fisheriesManagement;
    struct Transfer {
        uint256 transferId;
        uint256 batchId;
        string stage; // e.g., "Storage", "Transport"
        uint256 timestamp;
    }

    mapping(uint256 => Transfer) public transfers;
    uint256 public nextTransferId = 1;

    constructor(address fisheriesManagementAddress) {
        fisheriesManagement = FisheriesManagement(fisheriesManagementAddress);
    }


    event TransferRecorded(uint256 transferId, uint256 batchId, string stage, uint256 timestamp);

    function recordTransfer(uint256 batchId, string memory stage) public {

        // require(fisheriesManagement.batches(batchId).id == batchId, "Batch does not exist");


        transfers[nextTransferId] = Transfer(nextTransferId, batchId, stage, block.timestamp);
        fisheriesManagement.addTransferToBatch(batchId, nextTransferId);
        emit TransferRecorded(nextTransferId, batchId, stage, block.timestamp);
        nextTransferId++;
    }
}