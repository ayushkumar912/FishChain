// deploy/02_deploy_fish_marketplace.js

module.exports = async ({ deployments, getNamedAccounts, ethers }) => {
    const { deployer } = await getNamedAccounts();
    const { deploy } = deployments;
    const fisheriesManagement = await deployments.get("FisheriesManagement");
  
    console.log("Deploying FishMarketplace contract...");
  
    const fishMarketplace = await deploy("FishMarketplace", {
      from: deployer,
      args: [fisheriesManagement.address], // Passing the FisheriesManagement contract address
      log: true,
    });
  
    console.log("FishMarketplace contract deployed at:", fishMarketplace.address);
  };
  
  module.exports.tags = ["FishMarketplace"];
  module.exports.dependencies = ["FisheriesManagement"];
  