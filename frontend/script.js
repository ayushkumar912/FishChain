// Helper function to handle API requests
async function makeApiRequest(url, method, body) {
    const response = await fetch(url, {
      method: method,
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });
  
    const data = await response.json();
    return data;
  }
  
// Log Catch
document.getElementById("logCatchForm").addEventListener("submit", async (e) => {
    e.preventDefault();
    const weight = document.getElementById("weight").value;
    const pricePerKg = document.getElementById("pricePerKg").value;
    
    const result = await makeApiRequest("http://localhost:8080/api/fisheries/log-catch", "POST", {
      weight,
      pricePerKg,
    });
    
    // Show the response message and transaction details
    document.getElementById("logCatchMessage").textContent = result.message;
    
    // Optionally display the txHash and batchId
    const txDetails = `
      Transaction Hash: <a href="https://etherscan.io/tx/${result.txHash}" target="_blank">${result.txHash}</a><br>
      Batch ID: ${result.batchId}
    `;
    
    document.getElementById("logCatchMessage").innerHTML += txDetails;
});
  
// Update Weight
document.getElementById("updateWeightForm").addEventListener("submit", async (e) => {
    e.preventDefault();
    const batchId = document.getElementById("updateBatchId").value;
    const weight = document.getElementById("newWeight").value;
  
    const result = await makeApiRequest("http://localhost:8080/update-weight", "POST", {
      batchId,
      weight,
    });
    document.getElementById("updateWeightMessage").textContent = result.message;
});
  
// Update Sustainability
document.getElementById("updateSustainabilityForm").addEventListener("submit", async (e) => {
    e.preventDefault();
    const batchId = document.getElementById("updateSustainabilityBatchId").value;
    const sustainable = document.getElementById("sustainable").checked;
  
    const result = await makeApiRequest("http://localhost:8080/update-sustainability", "POST", {
      batchId,
      sustainable,
    });
    document.getElementById("updateSustainabilityMessage").textContent = result.message;
});
  
// List Fish
document.getElementById("listFishForm").addEventListener("submit", async (e) => {
    e.preventDefault();
    const batchId = document.getElementById("listBatchId").value;
    const weight = document.getElementById("fishWeight").value;
    const pricePerKg = document.getElementById("fishPrice").value;
  
    const result = await makeApiRequest("http://localhost:8080/list-fish", "POST", {
      batchId,
      weight,
      pricePerKg,
    });
    document.getElementById("listFishMessage").textContent = result.message;
});
  
// Buy Fish
document.getElementById("buyFishForm").addEventListener("submit", async (e) => {
    e.preventDefault();
    const listingId = document.getElementById("buyListingId").value;
    const weight = document.getElementById("buyWeight").value;
    const value = document.getElementById("value").value;
  
    const result = await makeApiRequest("http://localhost:8080/buy-fish", "POST", {
      listingId,
      weight,
      value,
    });
    document.getElementById("buyFishMessage").textContent = result.message;
});
  
// Record Transfer
document.getElementById("recordTransferForm").addEventListener("submit", async (e) => {
    e.preventDefault();
    const batchId = document.getElementById("transferBatchId").value;
    const stage = document.getElementById("stage").value;
  
    const result = await makeApiRequest("http://localhost:8080/record-transfer", "POST", {
      batchId,
      stage,
    });
    document.getElementById("recordTransferMessage").textContent = result.message;
});
  
// Adjust Price
document.getElementById("adjustPriceForm").addEventListener("submit", async (e) => {
    e.preventDefault();
    const listingId = document.getElementById("adjustListingId").value;
    const sustainabilityFactor = document.getElementById("sustainabilityFactor").value;
    const freshnessFactor = document.getElementById("freshnessFactor").value;
  
    const result = await makeApiRequest("http://localhost:8080/adjust-price", "POST", {
      listingId,
      sustainabilityFactor,
      freshnessFactor,
    });
    document.getElementById("adjustPriceMessage").textContent = result.message;
});
  
// Authorize Inspector
document.getElementById("authorizeInspectorForm").addEventListener("submit", async (e) => {
    e.preventDefault();
    const inspectorAddress = document.getElementById("inspectorAddress").value;
  
    const result = await makeApiRequest("http://localhost:8080/authorize-inspector", "POST", {
      inspectorAddress,
    });
    document.getElementById("authorizeInspectorMessage").textContent = result.message;
});
