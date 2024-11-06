// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import {FisheriesManagement} from "./FisheriesManagement.sol";

contract FishMarketplace {
    FisheriesManagement fisheriesManagement;
    struct Listing {
        uint256 listingId;
        uint256 batchId;
        address fisher;
        uint256 totalWeight;
        uint256 availableWeight;
        uint256 pricePerKg;
        bool isSoldOut;
    }

    mapping(uint256 => Listing) public listings;
    uint256 public nextListingId = 1;

    event FishListed(uint256 listingId, uint256 batchId, uint256 weight, uint256 pricePerKg);
    event FishBought(uint256 listingId, address buyer, uint256 weight, uint256 totalPrice);

    constructor(address fisheriesManagementAddress) {
        fisheriesManagement = FisheriesManagement(fisheriesManagementAddress);
    }

    function listFish(uint256 batchId, uint256 weight, uint256 pricePerKg) public {
        require(fisheriesManagement.getBatchSustainability(batchId), "Batch is not sustainable");
        
        listings[nextListingId] = Listing(nextListingId, batchId, msg.sender, weight, weight, pricePerKg, false);
        emit FishListed(nextListingId, batchId, weight, pricePerKg);
        nextListingId++;
    }

    function buyFish(uint256 listingId, uint256 weight) public payable {
        Listing storage listing = listings[listingId];
        require(!listing.isSoldOut, "Listing is sold out");
        require(weight <= listing.availableWeight, "Not enough weight available");

        uint256 totalPrice = weight * listing.pricePerKg;
        require(msg.value >= totalPrice, "Insufficient funds");

        payable(listing.fisher).transfer(totalPrice);
        listing.availableWeight -= weight;

        if (listing.availableWeight == 0) {
            listing.isSoldOut = true;
        }

        emit FishBought(listingId, msg.sender, weight, totalPrice);
    }
}