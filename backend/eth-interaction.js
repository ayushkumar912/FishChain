// backend/eth-interaction.js

const express = require('express');
const bodyParser = require('body-parser');
const { ethers } = require("hardhat");
require('dotenv').config({ path: '.env' });

// Setup express and middleware
const app = express();
const port = 8080;
app.use(bodyParser.json());

// Set up provider and signer
provider = ethers.provider; 
const signer = provider ? provider.getSigner() : new ethers.Wallet(process.env.PRIVATE_KEY, provider);

// Load ABIs and contract addresses
const fisheriesManagementABI = require('./artifacts/contracts/FisheriesManagement.sol/FisheriesManagement.json').abi;
const fishMarketplaceABI = require('./artifacts/contracts/FishMarketplace.sol/FishMarketplace.json').abi;
const fishTransferABI = require('./artifacts/contracts/FishTransfer.sol/FishTransfer.json').abi;
const inspectorAuthorizationABI = require('./artifacts/contracts/InspectorAuthorization.sol/InspectorAuthorization.json').abi;
const pricingAdjustmentABI = require('./artifacts/contracts/PriceAdjustment.sol/PriceAdjustment.json').abi;

const fisheriesManagementAddress = process.env.FISHERIES_MANAGEMENT_CONTRACT_ADDRESS;
const fishMarketplaceAddress = process.env.FISH_MARKETPLACE_CONTRACT_ADDRESS;
const fishTransferAddress = process.env.FISH_TRANSFER_CONTRACT_ADDRESS;
const inspectorAuthorizationAddress = process.env.INSPECTOR_AUTHORIZATION_CONTRACT_ADDRESS;
const pricingAdjustmentAddress = process.env.PRICING_ADJUSTMENT_CONTRACT_ADDRESS;

// Create contract instances
const fisheriesManagement = new ethers.Contract(fisheriesManagementAddress, fisheriesManagementABI, signer);
const fishMarketplace = new ethers.Contract(fishMarketplaceAddress, fishMarketplaceABI, signer);
const fishTransfer = new ethers.Contract(fishTransferAddress, fishTransferABI, signer);
const inspectorAuthorization = new ethers.Contract(inspectorAuthorizationAddress, inspectorAuthorizationABI, signer);
const pricingAdjustment = new ethers.Contract(pricingAdjustmentAddress, pricingAdjustmentABI, signer);

// Routes for each action

// Adjust price
app.post('/adjust-price', async (req, res) => {
  const { listingId, batchId } = req.body;
  try {
    const tx = await pricingAdjustment.adjustPrice(listingId, batchId);
    await tx.wait();
    res.json({ message: `Price adjusted for listing ID: ${listingId}` });
  } catch (error) {
    console.error('Error adjusting price:', error);
    res.status(500).json({ message: `Error adjusting price: ${error.message}` });
  }
});

// Transfer fish
app.post('/transfer-fish', async (req, res) => {
  const { toAddress, amount } = req.body;
  try {
    const tx = await fishTransfer.transferFish(toAddress, amount);
    await tx.wait();
    res.json({ message: `Fish transferred to ${toAddress}` });
  } catch (error) {
    console.error('Error transferring fish:', error);
    res.status(500).json({ message: `Error transferring fish: ${error.message}` });
  }
});

// Register fish
app.post('/register-fish', async (req, res) => {
  const { batchId, fishType } = req.body;
  try {
    const tx = await fisheriesManagement.registerFishBatch(batchId, fishType);
    await tx.wait();
    res.json({ message: `Fish batch registered: ${batchId} of type ${fishType}` });
  } catch (error) {
    console.error('Error registering fish:', error);
    res.status(500).json({ message: `Error registering fish: ${error.message}` });
  }
});

// Authorize inspector
app.post('/authorize-inspector', async (req, res) => {
  const { inspectorAddress } = req.body;
  try {
    const tx = await inspectorAuthorization.authorizeInspector(inspectorAddress);
    await tx.wait();
    res.json({ message: `Inspector authorized: ${inspectorAddress}` });
  } catch (error) {
    console.error('Error authorizing inspector:', error);
    res.status(500).json({ message: `Error authorizing inspector: ${error.message}` });
  }
});

// Register price
app.post('/register-price', async (req, res) => {
  const { listingId, price } = req.body;
  try {
    const tx = await fishMarketplace.registerPrice(listingId, price);
    await tx.wait();
    res.json({ message: `Price registered for listing ID: ${listingId}` });
  } catch (error) {
    console.error('Error registering price:', error);
    res.status(500).json({ message: `Error registering price: ${error.message}` });
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
