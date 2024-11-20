// deploy/03_deploy_fish_transfer.js

module.exports = async ({ deployments, getNamedAccounts, ethers }) => {
    const { deployer } = await getNamedAccounts();
    const { deploy } = deployments;
    const fisheriesManagement = await deployments.get("FisheriesManagement");
  
    console.log("Deploying FishTransfer contract...");
  
    const fishTransfer = await deploy("FishTransfer", {
      from: deployer,
      args: [fisheriesManagement.address], // Passing the FisheriesManagement contract address
      log: true,
    });
  
    console.log("FishTransfer contract deployed at:", fishTransfer.address);
  };
  
  module.exports.tags = ["FishTransfer"];
  module.exports.dependencies = ["FisheriesManagement"];
  