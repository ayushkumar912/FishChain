const express = require("express");
const router = express.Router();
const contracts = require("../config/contracts");
const { ethers } = require("ethers");

const validateAddress = (req, res, next) => {
  const address = req.body.address || req.params.address;
  if (address && !ethers.isAddress(address)) {
    return res.status(400).json({ message: "Invalid Ethereum address" });
  }
  next();
};

async function checkSyncStatus() {
  const provider = new ethers.JsonRpcProvider('http://127.0.0.1:8545');
  const syncStatus = await provider.send('eth_syncing');
  console.log(syncStatus);
}

checkSyncStatus();

async function trackBlockNumber() {
  const provider = new ethers.JsonRpcProvider('http://127.0.0.1:8545');
  let currentBlock = await provider.getBlockNumber();
  console.log(`Current Block Number: ${currentBlock}`);

  // Continuously track, but with a delay
  setInterval(async () => {
    const newBlock = await provider.getBlockNumber();
    if (newBlock !== currentBlock) {
      currentBlock = newBlock;
      console.log(`New Block: ${currentBlock}`);
    }
  }, 10000); // Poll every 10 seconds
}

trackBlockNumber();


router.post("/fisheries/logcatch", async (req, res) => {
  console.log("Received request for /fisheries/logcatch");
  let { weight, pricePerKg } = req.body;
  weight = Number(weight);
  pricePerKg = Number(pricePerKg);

  if (isNaN(weight) || weight <= 0) {
    return res.status(400).json({ message: "Invalid weight. Must be a positive integer." });
  }

  if (isNaN(pricePerKg) || pricePerKg <= 0) {
    return res.status(400).json({ message: "Invalid pricePerKg. Must be a positive integer." });
  }

  try {
    const result = await contracts.fisheriesManagement.logCatch(weight, pricePerKg);
    
    res.json({
      message: "Fish catch logged successfully",
      txHash: result.tx.hash
    });

  } catch (error) {
    console.error("Error logging catch:", error);
    res.status(500).json({ 
      message: error.message || "Error logging catch" 
    });
  }
});


router.post("/fisheries/updatesustainability", async (req, res) => {
  const { batchId, sustainable } = req.body;

  try {
    const result = await contracts.fisheriesManagement.updateSustainability(
      batchId,
      sustainable
    );

    res.json({
      message: "Sustainability updated successfully",
      batchId,
      sustainable,
      txHash: result.tx.hash
    });
  } catch (error) {
    console.error("Error updating sustainability:", error);
    res.status(500).json({ 
      message: error.message || "Error updating sustainability" 
    });
  }
});


router.get("/fisheries/batch/:batchId", async (req, res) => {
  try {
    const batchId = Number(req.params.batchId);
    const batch = await contracts.fisheriesManagement.getFishBatch(batchId);

    const parsedBatch = {
      id: batch[0].toString(), 
      fisher: batch[1],
      weight: batch[2].toString(), 
      pricePerKg: batch[3].toString(), 
      isSold: batch[4],
      inDispute: batch[5],
      sustainable: batch[6],
      transferIds: batch[7].map((id) => id.toString()) 
    };

    res.json(parsedBatch);
  } catch (error) {
    console.error("Error fetching batch:", error);
    res.status(500).json({ message: `Error fetching batch: ${error.message}` });
  }
});




router.put("/fisheries/updateweight/:batchId", async (req, res) => {
  const { weight } = req.body;
  const batchId = Number(req.params.batchId);

  if (isNaN(weight) || weight <= 0) {
    return res.status(400).json({ message: "Invalid weight" });
  }

  try {
    const result = await contracts.fisheriesManagement.updateweight(batchId, weight);
    
    res.json({
      message: "Weight updated successfully",
      batchId: batchId,
      newWeight: weight,
      txHash: result.tx.hash
    });
  } catch (error) {
    console.error("Error updating weight:", error);
    res.status(500).json({ 
      message: error.message || "Error updating weight" 
    });
  }
});



router.post("/marketplace/list", async (req, res) => {
  const { batchId, weight, pricePerKg } = req.body;

  if (isNaN(batchId) || batchId < 0) {
    return res.status(400).json({ message: "Invalid batch ID" });
  }

  if (isNaN(weight) || weight < 0) {
    return res.status(400).json({ message: "Invalid weight" });
  }

  if (isNaN(pricePerKg) || pricePerKg < 0) {
    return res.status(400).json({ message: "Invalid price per kg" });
  }

  try {
    const result = await contracts.fishMarketplace.listFish(
      batchId,
      weight,
      pricePerKg
    );

    res.json({
      message: "Fish listed successfully",
      listingId: result.tx.hash, // Adjust this based on how you want to track listing ID
      txHash: result.tx.hash
    });
  } catch (error) {
    console.error("Error listing fish:", error);
    res.status(500).json({ 
      message: error.message || "Error listing fish" 
    });
  }
});

router.post("/marketplace/buy/:listingId", async (req, res) => {
  const { weight, value } = req.body;
  try {
    const tx = await contracts.fishMarketplace.buyFish(
      req.params.listingId,
      weight,
      {
        value: ethers.parseEther(value.toString()),
      }
    );
    await tx.wait();
    res.json({ message: "Fish purchased successfully", txHash: tx.hash });
  } catch (error) {
    console.error("Error buying fish:", error);
    res.status(500).json({ message: `Error buying fish: ${error.message}` });
  }
});





















router.post("/transfer/record", async (req, res) => {
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

router.post("/inspector/authorize", validateAddress, async (req, res) => {
  const { address } = req.body;
  try {
    const tx = await contracts.inspectorAuthorization.authorizeInspector(
      address
    );
    await tx.wait();
    res.json({ message: "Inspector authorized successfully", txHash: tx.hash });
  } catch (error) {
    console.error("Error authorizing inspector:", error);
    res
      .status(500)
      .json({ message: `Error authorizing inspector: ${error.message}` });
  }
});

router.post("/pricing/adjust/:listingId", async (req, res) => {
  const { sustainabilityFactor, freshnessFactor } = req.body;
  try {
    const tx = await contracts.pricingAdjustment.adjustPrice(
      req.params.listingId,
      sustainabilityFactor,
      freshnessFactor
    );
    await tx.wait();
    res.json({ message: "Price adjusted successfully", txHash: tx.hash });
  } catch (error) {
    console.error("Error adjusting price:", error);
    res
      .status(500)
      .json({ message: `Error adjusting price: ${error.message}` });
  }
});

module.exports = router;
