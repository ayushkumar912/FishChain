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

router.post("/fisheries/logcatch", async (req, res) => {
  const { weight, pricePerKg } = req.body;
  try {
    const { tx, receipt } = await contracts.fisheriesManagement.logCatch(weight, pricePerKg);
    const event = receipt.logs?.find(log => 
      log.topics[0] === contracts.fisheriesManagement.interface.getEventTopic('FishLogged')
    );
    
    res.json({
      message: "Fish catch logged successfully",
      batchId: event ? event.args?.batchId.toString() : null,
      txHash: tx.hash
    });
  } catch (error) {
    console.error("Error logging catch:", error);
    res.status(500).json({ message: `Error logging catch: ${error.message}` });
  }
});


router.get("/fisheries/batch/:batchId", async (req, res) => {
  try {
    const batch = await contracts.fisheriesManagement.getBatch(
      req.params.batchId
    );
    res.json({
      weight: batch.weight.toString(),
      pricePerKg: batch.pricePerKg.toString(),
      sustainable: batch.sustainable,
      fisher: batch.fisher,
    });
  } catch (error) {
    res.status(500).json({ message: `Error fetching batch: ${error.message}` });
  }
});

router.put("/fisheries/updateweight/:batchId", async (req, res) => {
  const { weight } = req.body;
  try {
    const tx = await contracts.fisheriesManagement.updateWeight(
      req.params.batchId,
      weight
    );
    await tx.wait();
    res.json({
      message: "Weight updated successfully",
      batchId: req.params.batchId,
      newWeight: weight,
      txHash: tx.hash,
    });
  } catch (error) {
    console.error("Error updating weight:", error);
    res
      .status(500)
      .json({ message: `Error updating weight: ${error.message}` });
  }
});

router.post("/marketplace/list", async (req, res) => {
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
