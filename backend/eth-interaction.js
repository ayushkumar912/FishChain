const express = require("express");
const cors = require('cors');
const bodyParser = require("body-parser");
const { ethers } = require("ethers"); 
require("dotenv").config({ path: ".env" });


// Setup express and middleware
const app = express();
const port = 8080;
app.use(cors({
  origin: '*'
}));


app.use(bodyParser.json());

// Validate environment variables
const requiredEnvVars = [
  'RPC_URL',
  'PRIVATE_KEY',
  'FISHERIES_MANAGEMENT_CONTRACT_ADDRESS',
  'FISH_MARKETPLACE_CONTRACT_ADDRESS',
  'FISH_TRANSFER_CONTRACT_ADDRESS',
  'INSPECTOR_AUTHORIZATION_CONTRACT_ADDRESS',
  'PRICING_ADJUSTMENT_CONTRACT_ADDRESS'
];

for (const envVar of requiredEnvVars) {
  if (!process.env[envVar]) {
    throw new Error(`${envVar} is not defined in your environment variables.`);
  }
}

// Set up provider and wallet
let provider;
let wallet;
try {
  provider = new ethers.JsonRpcProvider(process.env.RPC_URL);
  wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
  console.log("Provider and wallet initialized successfully");
  console.log("Connected wallet address:", wallet.address);
} catch (error) {
  console.error("Error initializing provider or wallet:", error);
  process.exit(1);
}

// Load contract ABIs
const contractABIs = {
    fisheriesManagement: require("./artifacts/contracts/FisheriesManagement.sol/FisheriesManagement.json").abi,
    fishMarketplace: require("./artifacts/contracts/FishMarketplace.sol/FishMarketplace.json").abi,
    fishTransfer: require("./artifacts/contracts/FishTransfer.sol/FishTransfer.json").abi,
    inspectorAuthorization: require("./artifacts/contracts/InspectorAuthorization.sol/InspectorAuthorization.json").abi,
    pricingAdjustment: require("./artifacts/contracts/PriceAdjustment.sol/PriceAdjustment.json").abi
}

// Initialize contract instances
const contracts = {};
try {
  contracts.fisheriesManagement = new ethers.Contract(
    process.env.FISHERIES_MANAGEMENT_CONTRACT_ADDRESS,
    contractABIs.fisheriesManagement,
    wallet
  );
  
  contracts.fishMarketplace = new ethers.Contract(
    process.env.FISH_MARKETPLACE_CONTRACT_ADDRESS,
    contractABIs.fishMarketplace,
    wallet
  );
  
  contracts.fishTransfer = new ethers.Contract(
    process.env.FISH_TRANSFER_CONTRACT_ADDRESS,
    contractABIs.fishTransfer,
    wallet
  );
  
  contracts.inspectorAuthorization = new ethers.Contract(
    process.env.INSPECTOR_AUTHORIZATION_CONTRACT_ADDRESS,
    contractABIs.inspectorAuthorization,
    wallet
  );
  
  contracts.pricingAdjustment = new ethers.Contract(
    process.env.PRICING_ADJUSTMENT_CONTRACT_ADDRESS,
    contractABIs.pricingAdjustment,
    wallet
  );
  
  console.log("All contracts initialized successfully");
} catch (error) {
  console.error("Error initializing contracts:", error);
  process.exit(1);
}

// Middleware to validate ethereum addresses


// FisheriesManagement Routes
app.post("/log-catch", async (req, res) => {
  const { weight, pricePerKg } = req.body;
  try {
    const tx = await contracts.fisheriesManagement.logCatch(weight, pricePerKg);
    const receipt = await tx.wait();
    const event = receipt.events?.find((e) => e.event === "FishLogged");
    res.json({
      message: "Fish catch logged successfully",
      batchId: event?.args?.batchId.toString(),
      txHash: tx.hash,
    });
  } catch (error) {
    console.error("Error logging catch:", error);
    res.status(500).json({ message: `Error logging catch: ${error.message}` });
  }
});
app.post("/update-weight", async (req, res) => {
  const { batchId, weight } = req.body;
  try {
    // Call the updateweight function in FisheriesManagement
    const tx = await contracts.fisheriesManagement.updateweight(batchId, weight);
    await tx.wait();
    res.json({
      message: "Weight updated successfully",
      batchId: batchId,
      newWeight: weight,
      txHash: tx.hash,
    });
  } catch (error) {
    console.error("Error updating weight:", error);
    res.status(500).json({ message: `Error updating weight: ${error.message}` });
  }
});


app.post("/update-sustainability", async (req, res) => {
  const { batchId, sustainable } = req.body;
  try {
    // Execute the transaction (which changes the state on-chain)
    const tx = await contracts.fisheriesManagement.updateSustainability(batchId, sustainable);
    
    // Wait for the transaction to be mined
    const receipt = await tx.wait();
    
    // Optionally, check for any events or logs to confirm transaction success
    const event = receipt.events?.find((e) => e.event === "SustainabilityUpdated");
    
    res.json({
      message: "Sustainability updated successfully",
      batchId: batchId,
      sustainable: sustainable,
      txHash: tx.hash,
    });
  } catch (error) {
    console.error("Error updating sustainability:", error);
    res.status(500).json({ message: `Error updating sustainability: ${error.message}` });
  }
});


// FishMarketplace Routes
app.post("/list-fish", async (req, res) => {
  const { batchId, weight, pricePerKg } = req.body;
  try {
    const tx = await contracts.fishMarketplace.listFish(
      batchId,
      weight,
      pricePerKg
    );
    const receipt = await tx.wait();
    const event = receipt.events?.find((e) => e.event === "FishListed");
    res.json({
      message: "Fish listed successfully",
      listingId: event?.args?.listingId.toString(),
      txHash: tx.hash,
    });
  } catch (error) {
    console.error("Error listing fish:", error);
    res.status(500).json({ message: `Error listing fish: ${error.message}` });
  }
});

app.post("/buy-fish", async (req, res) => {
  const { listingId, weight, value } = req.body;
  try {
    const tx = await contracts.fishMarketplace.buyFish(listingId, weight, {
      value: ethers.utils.parseEther(value.toString()),
    });
    await tx.wait();
    res.json({ message: "Fish purchased successfully" });
  } catch (error) {
    console.error("Error buying fish:", error);
    res.status(500).json({ message: `Error buying fish: ${error.message}` });
  }
});

// FishTransfer Routes
app.post("/record-transfer", async (req, res) => {
  const { batchId, stage } = req.body;
  try {
    const tx = await contracts.fishTransfer.recordTransfer(batchId, stage);
    const receipt = await tx.wait();
    const event = receipt.events?.find((e) => e.event === "TransferRecorded");
    res.json({
      message: "Transfer recorded successfully",
      transferId: event?.args?.transferId.toString(),
      txHash: tx.hash,
    });
  } catch (error) {
    console.error("Error recording transfer:", error);
    res
      .status(500)
      .json({ message: `Error recording transfer: ${error.message}` });
  }
});

// PriceAdjustment Routes
app.post("/adjust-price", async (req, res) => {
  const { listingId, sustainabilityFactor, freshnessFactor } = req.body;
  try {
    const tx = await contracts.pricingAdjustment.adjustPrice(
      listingId,
      sustainabilityFactor,
      freshnessFactor
    );
    await tx.wait();
    res.json({ message: "Price adjusted successfully" });
  } catch (error) {
    console.error("Error adjusting price:", error);
    res
      .status(500)
      .json({ message: `Error adjusting price: ${error.message}` });
  }
});

// InspectorAuthorization Routes
app.post("/authorize-inspector", async (req, res) => {
  const { inspectorAddress } = req.body;
  try {
    const tx = await contracts.inspectorAuthorization.authorizeInspector(
      inspectorAddress
    );
    await tx.wait();
    res.json({ message: "Inspector authorized successfully" });
  } catch (error) {
    console.error("Error authorizing inspector:", error);
    res
      .status(500)
      .json({ message: `Error authorizing inspector: ${error.message}` });
  }
});

// Getter Routes
app.get("/batch/:batchId", async (req, res) => {
  try {
    const batch = await contracts.fisheriesManagement.batches(
      req.params.batchId
    );
    res.json(batch);
  } catch (error) {
    res.status(500).json({ message: `Error fetching batch: ${error.message}` });
  }
});

app.get("/listing/:listingId", async (req, res) => {
  try {
    const listingId = parseInt(req.params.listingId, 10);

    if (isNaN(listingId)) {
      return res.status(400).json({ message: "Invalid listingId parameter" });
    }

    const listing = await contracts.fishMarketplace.getListingDetails(listingId);
    res.json({
      listingId: listing[0].toString(),
      batchId: listing[1].toString(),
      fisher: listing[2],
      totalWeight: listing[3].toString(),
      availableWeight: listing[4].toString(),
      pricePerKg: listing[5].toString(),
      isSoldOut: listing[6],
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: `Error fetching listing: ${error.message}` });
  }
});

// Start server with error handling
const server = app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
}).on('error', (error) => {
  console.error("Error starting server:", error);
  process.exit(1);
});

// Handle graceful shutdown
process.on('SIGTERM', () => {
  server.close(() => {
    console.log('Server shutting down');
    process.exit(0);
  });
});