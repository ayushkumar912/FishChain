// eth-interaction.js
const API_BASE_URL = 'http://localhost:3000/api';

async function logCatch(weight, pricePerKg) {
    try {
        const response = await fetch(`${API_BASE_URL}/logCatch`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ weight, pricePerKg })
        });
        return await response.json();
    } catch (error) {
        console.error('Error logging catch:', error);
        throw error;
    }
}

async function listFish(batchId, weight, pricePerKg) {
    try {
        const response = await fetch(`${API_BASE_URL}/listFish`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ batchId, weight, pricePerKg })
        });
        return await response.json();
    } catch (error) {
        console.error('Error listing fish:', error);
        throw error;
    }
}

async function buyFish(listingId, weight, value) {
    try {
        const response = await fetch(`${API_BASE_URL}/buyFish`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ listingId, weight, value })
        });
        return await response.json();
    } catch (error) {
        console.error('Error buying fish:', error);
        throw error;
    }
}

async function recordTransfer(batchId, stage) {
    try {
        const response = await fetch(`${API_BASE_URL}/recordTransfer`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ batchId, stage })
        });
        return await response.json();
    } catch (error) {
        console.error('Error recording transfer:', error);
        throw error;
    }
}

// Getter functions
async function getBatch(batchId) {
    try {
        const response = await fetch(`${API_BASE_URL}/batch/${batchId}`);
        return await response.json();
    } catch (error) {
        console.error('Error getting batch:', error);
        throw error;
    }
}

async function getListing(listingId) {
    try {
        const response = await fetch(`${API_BASE_URL}/listing/${listingId}`);
        return await response.json();
    } catch (error) {
        console.error('Error getting listing:', error);
        throw error;
    }
}