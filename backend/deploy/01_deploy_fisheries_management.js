// deploy/01_deploy_fisheries_management.js

module.exports = async ({ deployments, getNamedAccounts }) => {
    const { deployer } = await getNamedAccounts();
    const { deploy } = deployments;
  
    console.log("Deploying FisheriesManagement contract...");
    const fisheriesManagement = await deploy("FisheriesManagement", {
      from: deployer,
      log: true,
    });
  
    console.log("FisheriesManagement contract deployed at:", fisheriesManagement.address);
  };
  
  module.exports.tags = ["FisheriesManagement"];
  