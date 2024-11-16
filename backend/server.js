// server.js
const express = require('express');
const cors = require('cors');
const { ethers } = require("hardhat");
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Contract ABIs
const FisheriesManagement = require('../contracts/artifacts/contracts/FisheriesManagement.sol/FisheriesManagement.json');
const FishMarketplace = require('../contracts/artifacts/contracts/FishMarketplace.sol/FishMarketplace.json');
const FishTransfer = require('../contracts/artifacts/contracts/FishTransfer.sol/FishTransfer.json');
const InspectorAuthorization = require('../contracts/artifacts/contracts/InspectorAuthorization.sol/InspectorAuthorization.json');
const PricingAdjustment = require('../contracts/artifacts/contracts/PricingAdjustment.sol/PricingAdjustment.json');

// Initialize provider and contracts
const provider = new ethers.providers.JsonRpcProvider(process.env.RPC_URL);
const signer = new ethers.Wallet(process.env.PRIVATE_KEY, provider);

const fisheriesContract = new ethers.Contract(
  process.env.FISHERIES_CONTRACT_ADDRESS,
  FisheriesManagement.abi,
  signer
);

const marketplaceContract = new ethers.Contract(
  process.env.MARKETPLACE_CONTRACT_ADDRESS,
  FishMarketplace.abi,
  signer
);

const transferContract = new ethers.Contract(
  process.env.TRANSFER_CONTRACT_ADDRESS,
  FishTransfer.abi,
  signer
);

// API Routes

// Fisheries Management Routes
app.post('/api/logCatch', async (req, res) => {
  try {
    const { weight, pricePerKg } = req.body;
    const tx = await fisheriesContract.logCatch(weight, pricePerKg);
    await tx.wait();
    res.json({ success: true, transactionHash: tx.hash });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/updateSustainability', async (req, res) => {
  try {
    const { batchId, sustainable } = req.body;
    const tx = await fisheriesContract.updateSustainability(batchId, sustainable);
    await tx.wait();
    res.json({ success: true, transactionHash: tx.hash });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Marketplace Routes
app.post('/api/listFish', async (req, res) => {
  try {
    const { batchId, weight, pricePerKg } = req.body;
    const tx = await marketplaceContract.listFish(batchId, weight, pricePerKg);
    await tx.wait();
    res.json({ success: true, transactionHash: tx.hash });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/buyFish', async (req, res) => {
  try {
    const { listingId, weight, value } = req.body;
    const tx = await marketplaceContract.buyFish(listingId, weight, {
      value: ethers.utils.parseEther(value.toString())
    });
    await tx.wait();
    res.json({ success: true, transactionHash: tx.hash });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Transfer Routes
app.post('/api/recordTransfer', async (req, res) => {
  try {
    const { batchId, stage } = req.body;
    const tx = await transferContract.recordTransfer(batchId, stage);
    await tx.wait();
    res.json({ success: true, transactionHash: tx.hash });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get Routes
app.get('/api/batch/:id', async (req, res) => {
  try {
    const batch = await fisheriesContract.batches(req.params.id);
    res.json(batch);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/listing/:id', async (req, res) => {
  try {
    const listing = await marketplaceContract.getListingDetails(req.params.id);
    res.json(listing);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});