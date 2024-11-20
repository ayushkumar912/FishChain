const { ethers } = require("hardhat");

async function main() {
  // Deploy FisheriesManagement
  const FisheriesManagement = await ethers.getContractFactory("FisheriesManagement");
  const fisheriesManagement = await FisheriesManagement.deploy();
  await fisheriesManagement.waitForDeployment();
  console.log("FisheriesManagement deployed to:", fisheriesManagement.target);

  // Deploy FishMarketplace with FisheriesManagement address
  const FishMarketplace = await ethers.getContractFactory("FishMarketplace");
  const fishMarketplace = await FishMarketplace.deploy(fisheriesManagement.target);
  await fishMarketplace.waitForDeployment();
  console.log("FishMarketplace deployed to:", fishMarketplace.target);

  // Deploy PriceAdjustment with FishMarketplace address
  const PriceAdjustment = await ethers.getContractFactory("PriceAdjustment");
  const priceAdjustment = await PriceAdjustment.deploy(fishMarketplace.target);
  await priceAdjustment.waitForDeployment();
  console.log("PriceAdjustment deployed to:", priceAdjustment.target);

  // Deploy FishTransfer with FisheriesManagement address
  const FishTransfer = await ethers.getContractFactory("FishTransfer");
  const fishTransfer = await FishTransfer.deploy(fisheriesManagement.target);
  await fishTransfer.waitForDeployment();
  console.log("FishTransfer deployed to:", fishTransfer.target);

  // Deploy InspectorAuthorization
  const InspectorAuthorization = await ethers.getContractFactory("InspectorAuthorization");
  const inspectorAuthorization = await InspectorAuthorization.deploy();
  await inspectorAuthorization.waitForDeployment();
  console.log("InspectorAuthorization deployed to:", inspectorAuthorization.target);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });