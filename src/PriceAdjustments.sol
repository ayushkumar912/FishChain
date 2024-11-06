// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./FishMarketplace.sol";

contract PricingAdjustment is FishMarketplace {
    mapping(uint256 => uint256) public sustainabilityMultiplier;
    mapping(uint256 => uint256) public freshnessMultiplier;

    event PriceAdjusted(uint256 batchId, uint256 newPricePerKg);
    event DebugPriceChange(uint256 listingId, uint256 initialPrice, uint256 adjustedPrice);


    constructor(address fisheriesManagementAddress) 
        FishMarketplace(fisheriesManagementAddress) // Call the base constructor
    {}

    function adjustPrice(uint256 listingId, uint256 sustainabilityFactor, uint256 freshnessFactor) public {
    Listing storage listing = listings[listingId];
    require(listing.listingId == listingId, "Listing does not exist");

    uint256 initialPrice = listing.pricePerKg;
    uint256 adjustedPrice = initialPrice;

    // Apply sustainability and freshness multipliers
    if (sustainabilityFactor > 0) {
        adjustedPrice = adjustedPrice * sustainabilityFactor / 100;
    }
    if (freshnessFactor > 0) {
        adjustedPrice = adjustedPrice * freshnessFactor / 100;
    }

    listing.pricePerKg = adjustedPrice;

    emit DebugPriceChange(listingId, initialPrice, adjustedPrice);
    emit PriceAdjusted(listingId, adjustedPrice);
}

}