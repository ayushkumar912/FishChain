// deploy/05_deploy_price_adjustment.js

module.exports = async ({ deployments, getNamedAccounts, ethers }) => {
    const { deployer } = await getNamedAccounts();
    const { deploy } = deployments;
    const fishMarketplace = await deployments.get("FishMarketplace");
  
    console.log("Deploying PriceAdjustment contract...");
  
    const priceAdjustment = await deploy("PriceAdjustment", {
      from: deployer,
      args: [fishMarketplace.address], // Passing the FishMarketplace contract address
      log: true,
    });
  
    console.log("PriceAdjustment contract deployed at:", priceAdjustment.address);
  };
  
  module.exports.tags = ["PriceAdjustment"];
  module.exports.dependencies = ["FishMarketplace"];

  