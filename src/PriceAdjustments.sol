// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./FishMarketplace.sol";

contract PricingAdjustment {

    mapping(uint256 => uint256) public sustainabilityMultiplier;
    mapping(uint256 => uint256) public freshnessMultiplier;

    event PriceAdjusted(uint256 batchId, uint256 newPricePerKg);
    event DebugPriceChange(uint256 listingId, uint256 initialPrice, uint256 adjustedPrice);

    FishMarketplace fishMarketplace;

    constructor(address fishMarketplaceAddress) {
        fishMarketplace = FishMarketplace(fishMarketplaceAddress);
    }

    function adjustPrice(uint256 listingId, uint256 sustainabilityFactor, uint256 freshnessFactor) public {
        (
            uint256 id,,,,,
            uint256 pricePerKg,
        ) = fishMarketplace.getListingDetails(listingId);

        require(id == listingId, "Listing does not exist");

        uint256 initialPrice = pricePerKg;
        uint256 adjustedPrice = initialPrice;

        // Apply sustainability and freshness multipliers
        if (sustainabilityFactor > 0) {
            adjustedPrice = adjustedPrice * sustainabilityFactor / 100;
        }
        if (freshnessFactor > 0) {
            adjustedPrice = adjustedPrice * freshnessFactor / 100;
        }

        // Update price in marketplace
        fishMarketplace.adjustListingPrice(listingId, adjustedPrice);

        emit DebugPriceChange(listingId, initialPrice, adjustedPrice);
        emit PriceAdjusted(listingId, adjustedPrice);
    }
}
