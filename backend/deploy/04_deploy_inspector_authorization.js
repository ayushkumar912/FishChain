// deploy/04_deploy_inspector_authorization.js

module.exports = async ({ deployments, getNamedAccounts }) => {
    const { deployer } = await getNamedAccounts();
    const { deploy } = deployments;
  
    console.log("Deploying InspectorAuthorization contract...");
    const inspectorAuthorization = await deploy("InspectorAuthorization", {
      from: deployer,
      log: true,
    });
  
    console.log("InspectorAuthorization contract deployed at:", inspectorAuthorization.address);
  };
  
  module.exports.tags = ["InspectorAuthorization"];
  