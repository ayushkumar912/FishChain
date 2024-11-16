// Import Hardhat Runtime Environment explicitly
const { ethers } = require("hardhat");
require("dotenv").config();

async function main() {
    // List of contracts to deploy with optional imports dependency notes
    const contracts = [
        { name: "FisheriesManagement", imports: [] },
        { name: "FishMarketplace", imports: ["FisheriesManagement"] },
        { name: "PriceAdjustment", imports: ["FishMarketplace"] },
        { name: "FishTransfer", imports: ["FisheriesManagement"] },
        { name: "InspectorAuthorization", imports: [] },
    ];

    // Mapping to store deployed contract addresses
    const deployedContracts = {};

    // Deploy contracts based on their dependencies
    for (const contract of contracts) {
        // Deploy any dependencies first
        for (const importedContract of contract.imports) {
            if (!deployedContracts[importedContract]) {
                console.log(`\nDeploying ${importedContract}...`);
                const ContractFactory = await ethers.getContractFactory(importedContract);
                const contractInstance = await ContractFactory.deploy();
                await contractInstance.waitForDeployment();
                console.log(`${importedContract} deployed to:`, contractInstance.target);
                deployedContracts[importedContract] = contractInstance.target;
            }
        }

        // Deploy the current contract with arguments if dependencies exist
        console.log(`\nDeploying ${contract.name}...`);
        let contractInstance;
        try {
            if (contract.name === "FishMarketplace") {
                const ContractFactory = await ethers.getContractFactory(contract.name);
                contractInstance = await ContractFactory.deploy(deployedContracts["FisheriesManagement"]);
            } else if (contract.name === "PriceAdjustment") {
                const ContractFactory = await ethers.getContractFactory(contract.name);
                contractInstance = await ContractFactory.deploy(deployedContracts["FishMarketplace"]);
            } else if (contract.name === "FishTransfer") {
                const ContractFactory = await ethers.getContractFactory(contract.name);
                contractInstance = await ContractFactory.deploy(deployedContracts["FisheriesManagement"]);
            } else {
                const ContractFactory = await ethers.getContractFactory(contract.name);
                contractInstance = await ContractFactory.deploy();
            }

            // Wait for deployment and log the address
            await contractInstance.waitForDeployment();
            console.log(`${contract.name} deployed to:`, contractInstance.target);

            // Store the deployed address
            deployedContracts[contract.name] = contractInstance.target;
        } catch (error) {
            console.error(`Error deploying ${contract.name}:`, error);
            process.exitCode = 1;
        }
    }

    console.log("\nDeployment completed.");
    console.log("Deployed Contract Addresses:");
    console.log(deployedContracts);
}

// Catch errors during deployment
main().catch((error) => {
    console.error("Error during deployment:", error);
    process.exitCode = 1;
});
