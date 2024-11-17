const { ethers } = require("ethers");
require("dotenv").config({ path: ".env" });

// Validate environment variables
const requiredEnvVars = [
  "RPC_URL",
  "PRIVATE_KEY",
  "FISHERIES_MANAGEMENT_CONTRACT_ADDRESS",
  "FISH_MARKETPLACE_CONTRACT_ADDRESS",
  "FISH_TRANSFER_CONTRACT_ADDRESS",
  "INSPECTOR_AUTHORIZATION_CONTRACT_ADDRESS",
  "PRICING_ADJUSTMENT_CONTRACT_ADDRESS",
];

for (const envVar of requiredEnvVars) {
  if (!process.env[envVar]) {
    throw new Error(`${envVar} is not defined in your environment variables.`);
  }
}

// Transaction Logger
const logTransaction = async (tx, receipt, contractName, methodName) => {
  console.log(`Contract call:       ${contractName}#${methodName}`);
  console.log(`  Transaction:         ${tx.hash}`);
  console.log(`  From:                ${tx.from}`);
  console.log(`  To:                  ${tx.to}`);
  console.log(`  Value:               ${ethers.formatEther(tx.value || '0')} ETH`);
  console.log(`  Gas used:            ${receipt.gasUsed} of ${tx.gasLimit}`);
  console.log(`  Block #${receipt.blockNumber}:           ${receipt.blockHash}`);
  console.log('\n');
};

// Improved contract wrapper creation with better error handling
const createContractWrapper = (contract, contractName) => {
  if (!contract || !contractName) {
    throw new Error('Contract and contract name are required for wrapper creation');
  }

  console.log(`Creating wrapper for ${contractName}...`);
  console.log('Contract interface:', contract.interface ? 'exists' : 'missing');
  
  const wrapper = {};
  
  try {
    // Get function signatures from the ABI instead of interface
    const functions = contract.interface.fragments.filter(f => f.type === 'function');
    
    console.log(`Found ${functions.length} functions for ${contractName}`);
    
    for (const func of functions) {
      const functionName = func.name;
      console.log(`Creating wrapper for function: ${functionName}`);
      
      wrapper[functionName] = async (...args) => {
        try {
          const tx = await contract[functionName](...args);
          
          // Handle both transaction responses and direct returns
          if (tx && tx.wait && typeof tx.wait === 'function') {
            const receipt = await tx.wait();
            await logTransaction(tx, receipt, contractName, functionName);
            return { tx, receipt };
          } else {
            // For view/pure functions that don't create transactions
            return tx;
          }
        } catch (error) {
          console.error(`Error in ${contractName}#${functionName}:`, error);
          throw error;
        }
      };
    }
    
    return wrapper;
  } catch (error) {
    console.error(`Error creating wrapper for ${contractName}:`, error);
    console.error('Contract details:', {
      address: contract.address,
      hasInterface: !!contract.interface,
      hasFunctions: contract.interface ? !!contract.interface.fragments : false
    });
    throw error;
  }
};

// Set up provider and wallet
let provider;
let wallet;
let contracts = {};

try {
  provider = new ethers.JsonRpcProvider(process.env.RPC_URL);
  wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
  console.log("Provider and wallet initialized successfully");
  console.log("Connected wallet address:", wallet.address);
} catch (error) {
  console.error("Error initializing provider or wallet:", error);
  process.exit(1);
}

// Load contract ABIs with error handling and validation
const contractABIs = {};
try {
  const loadABI = (name, path) => {
    try {
      const abi = require(path).abi;
      if (!Array.isArray(abi)) {
        throw new Error(`Invalid ABI format for ${name}`);
      }
      console.log(`Loaded ABI for ${name} with ${abi.length} entries`);
      return abi;
    } catch (error) {
      console.error(`Error loading ABI for ${name}:`, error);
      throw error;
    }
  };

  contractABIs.fisheriesManagement = loadABI(
    'FisheriesManagement',
    "../artifacts/contracts/FisheriesManagement.sol/FisheriesManagement.json"
  );
  contractABIs.fishMarketplace = loadABI(
    'FishMarketplace',
    "../artifacts/contracts/FishMarketplace.sol/FishMarketplace.json"
  );
  contractABIs.fishTransfer = loadABI(
    'FishTransfer',
    "../artifacts/contracts/FishTransfer.sol/FishTransfer.json"
  );
  contractABIs.inspectorAuthorization = loadABI(
    'InspectorAuthorization',
    "../artifacts/contracts/InspectorAuthorization.sol/InspectorAuthorization.json"
  );
  contractABIs.pricingAdjustment = loadABI(
    'PricingAdjustment',
    "../artifacts/contracts/PriceAdjustment.sol/PriceAdjustment.json"
  );
} catch (error) {
  console.error("Error loading contract ABIs:", error);
  process.exit(1);
}

// Initialize contract instances with logging wrapper
try {
  const contractConfigs = {
    fisheriesManagement: {
      address: process.env.FISHERIES_MANAGEMENT_CONTRACT_ADDRESS,
      abi: contractABIs.fisheriesManagement
    },
    fishMarketplace: {
      address: process.env.FISH_MARKETPLACE_CONTRACT_ADDRESS,
      abi: contractABIs.fishMarketplace
    },
    fishTransfer: {
      address: process.env.FISH_TRANSFER_CONTRACT_ADDRESS,
      abi: contractABIs.fishTransfer
    },
    inspectorAuthorization: {
      address: process.env.INSPECTOR_AUTHORIZATION_CONTRACT_ADDRESS,
      abi: contractABIs.inspectorAuthorization
    },
    pricingAdjustment: {
      address: process.env.PRICING_ADJUSTMENT_CONTRACT_ADDRESS,
      abi: contractABIs.pricingAdjustment
    }
  };

  // Create and wrap contracts
  for (const [name, config] of Object.entries(contractConfigs)) {
    console.log(`\nInitializing ${name} contract...`);
    console.log(`Address: ${config.address}`);
    console.log(`ABI length: ${config.abi.length}`);

    if (!config.address || !config.abi) {
      throw new Error(`Missing address or ABI for contract: ${name}`);
    }

    const contract = new ethers.Contract(config.address, config.abi, wallet);
    contracts[name] = createContractWrapper(contract, name);
    console.log(`Contract ${name} initialized successfully`);
  }

  console.log("\nAll contracts initialized successfully with logging enabled");
} catch (error) {
  console.error("Error initializing contracts:", error);
  process.exit(1);
}

module.exports = contracts;