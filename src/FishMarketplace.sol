// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import {FisheriesManagement} from "./FisheriesManagement.sol";

contract FishMarketplace {
    FisheriesManagement fisheriesManagement;
    address public pricingAdjustmentContract;

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
    event PriceUpdated(uint256 listingId, uint256 newPricePerKg);

    constructor(address fisheriesManagementAddress) {
        fisheriesManagement = FisheriesManagement(fisheriesManagementAddress);
    }

    // modifier onlyPricingAdjustment() {
    //     require(msg.sender == pricingAdjustmentContract, "Unauthorized: Only the PricingAdjustment contract can adjust prices");
    //     _;
    // }

    function setPricingAdjustmentContract(address _pricingAdjustmentContract) external {
        require(pricingAdjustmentContract == address(0), "Pricing adjustment contract already set");
        pricingAdjustmentContract = _pricingAdjustmentContract;
    }

    function listFish(uint256 batchId, uint256 weight, uint256 pricePerKg) public {
        require(fisheriesManagement.getBatchSustainability(batchId), "Batch is not sustainable");
        fisheriesManagement.updateweight(batchId, weight);
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

        listing.availableWeight -= weight;

        if (listing.availableWeight == 0) {
            listing.isSoldOut = true;
        }

        emit FishBought(listingId, msg.sender, weight, totalPrice);
    }

    // New function to allow only authorized contract to adjust prices
    function adjustListingPrice(uint256 listingId, uint256 newPricePerKg) external {
        Listing storage listing = listings[listingId];
        listing.pricePerKg = newPricePerKg;
        emit PriceUpdated(listingId, newPricePerKg);
    }

    // New getter function to access listing details
    function getListingDetails(uint256 listingId)
        external
        view
        returns (
            uint256,
            uint256,
            address,
            uint256,
            uint256,
            uint256,
            bool
        )
    {
        Listing storage listing = listings[listingId];
        return (
            listing.listingId,
            listing.batchId,
            listing.fisher,
            listing.totalWeight,
            listing.availableWeight,
            listing.pricePerKg,
            listing.isSoldOut
        );
    }
}
