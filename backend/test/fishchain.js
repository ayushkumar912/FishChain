const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Fisheries Management Ecosystem", function () {
  let fisheriesManagement;
  let fishMarketplace;
  let fishTransfer;
  let inspectorAuthorization;
  let priceAdjustment;

  let owner;
  let fisher1;
  let fisher2;
  let buyer;
  let inspector;

  beforeEach(async function () {
    [owner, fisher1, fisher2, buyer, inspector] = await ethers.getSigners();
    const FisheriesManagementFactory = await ethers.getContractFactory(
      "FisheriesManagement"
    );
    fisheriesManagement = await FisheriesManagementFactory.deploy();
    const FishMarketplaceFactory = await ethers.getContractFactory(
      "FishMarketplace"
    );
    fishMarketplace = await FishMarketplaceFactory.deploy(
      await fisheriesManagement.getAddress()
    );

    const FishTransferFactory = await ethers.getContractFactory("FishTransfer");
    fishTransfer = await FishTransferFactory.deploy(
      await fisheriesManagement.getAddress()
    );

    const InspectorAuthorizationFactory = await ethers.getContractFactory(
      "InspectorAuthorization"
    );
    inspectorAuthorization = await InspectorAuthorizationFactory.deploy();

    const PriceAdjustmentFactory = await ethers.getContractFactory(
      "PriceAdjustment"
    );
    priceAdjustment = await PriceAdjustmentFactory.deploy(
      await fishMarketplace.getAddress()
    );
  });

  describe("FisheriesManagement", function () {
    it("should allow logging a catch", async function () {
      await fisheriesManagement.connect(fisher1).logCatch(100, 10);
      const batch = await fisheriesManagement.getFishBatch(1);
      expect(batch[0]).to.equal(1n);
      expect(batch[1]).to.equal(fisher1.address);
      expect(batch[2]).to.equal(100n);
      expect(batch[3]).to.equal(10n);
    });

    it("should only allow government to update sustainability", async function () {
      await fisheriesManagement.connect(fisher1).logCatch(100, 10);

      await fisheriesManagement.updateSustainability(1, true);

      const sustainability = await fisheriesManagement.getBatchSustainability(
        1
      );
      expect(sustainability).to.be.true;

      await expect(
        fisheriesManagement.connect(fisher1).updateSustainability(1, false)
      ).to.be.revertedWith("Only government can call this function");
    });

    it("should allow adding transfer IDs to a batch", async function () {
      await fisheriesManagement.connect(fisher1).logCatch(100, 10);
      await fisheriesManagement.addTransferToBatch(1, 123);

      const transferIds = await fisheriesManagement.getTransferIds(1);
      expect(transferIds[0]).to.equal(123n);
    });
  });
  describe("FishMarketplace", function () {
    beforeEach(async function () {
      await fisheriesManagement.connect(fisher1).logCatch(100, 10);
      await fisheriesManagement.connect(owner).updateSustainability(1, true);
    });

    it("should allow listing sustainable fish", async function () {
      await fishMarketplace.connect(fisher1).listFish(1, 50, 12);

      const listing = await fishMarketplace.getListingDetails(1);
      expect(listing[2]).to.equal(fisher1.address);
      expect(listing[3]).to.equal(50n);
      expect(listing[5]).to.equal(12n);
    });

    it("should prevent listing unsustainable fish", async function () {
      await fisheriesManagement.connect(fisher2).logCatch(100, 10);

      await expect(
        fishMarketplace.connect(fisher2).listFish(2, 50, 12)
      ).to.be.revertedWith("Batch is not sustainable");
    });

    it("should allow buying fish", async function () {
      await fishMarketplace.connect(fisher1).listFish(1, 50, 10);
      await fishMarketplace.connect(buyer).buyFish(1, 20, { 
        value: ethers.parseEther("0.2") 
      });

      const listing = await fishMarketplace.getListingDetails(1);
      expect(listing[4]).to.equal(30n);
    });
  });

  describe("FishTransfer", function () {
    beforeEach(async function () {
      await fisheriesManagement.connect(fisher1).logCatch(100, 10);
    });

    it("should record fish transfers", async function () {
      await fishTransfer.recordTransfer(1, "Storage");

      const transfers = await fisheriesManagement.getTransferIds(1);
      expect(transfers.length).to.equal(1);
    });
  });

  describe("InspectorAuthorization", function () {
    it("should allow government to authorize inspectors", async function () {
      await inspectorAuthorization.authorizeInspector(inspector.address);

      const isAuthorized = await inspectorAuthorization.authorizedInspectors(
        inspector.address
      );
      expect(isAuthorized).to.be.true;
    });

    it("should prevent non-government from authorizing inspectors", async function () {
      await expect(
        inspectorAuthorization
          .connect(fisher1)
          .authorizeInspector(inspector.address)
      ).to.be.revertedWith("Only government can call this function");
    });
  });

  describe("PriceAdjustment", function () {
    beforeEach(async function () {
      await fisheriesManagement.connect(fisher1).logCatch(100, 10);
      await fisheriesManagement.connect(owner).updateSustainability(1, true);
      await fishMarketplace.connect(fisher1).listFish(1, 50, 100);
    });

    it("should adjust listing price", async function () {
      await priceAdjustment.adjustPrice(1, 90, 95);

      const listing = await fishMarketplace.getListingDetails(1);
      expect(listing[5]).to.be.lessThan(100n);
    });
  
  });
});
