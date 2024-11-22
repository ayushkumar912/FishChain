totalBatches = 0;


async function loadForm(option) {
    const formContainer = document.getElementById("form-container");

    // Clear the current content
    formContainer.innerHTML = "";

    // Inject different forms based on the navbar option clicked
    if (option === "Overview") {
        formContainer.innerHTML = `
            <h2>Overview Form</h2>
            <form id="overviewForm">
                <label for="overview-info">Information:</label><br>
                <textarea id="overview-info" name="overview-info" rows="4" cols="30"></textarea><br>
                <button type="submit">Submit</button>
            </form>
        `;
    } else if (option === "Market") {
        const batches = await fetchBatches();

        // If no batches are available
        if (batches.length === 0) {
            formContainer.innerHTML = "<p>No batches available at the moment.</p>";
            return;
        }

        // Create a table to display batches
        let tableHTML = `
    <div class="market-table-container">
        <table class="market-table">
            <thead>
                <tr>
                    <th>Batch ID</th>
                    <th>Weight</th>
                    <th>Fisherman Address</th>
                    <th>Price Per Kg</th>
                    <th>Action</th>
                </tr>
            </thead>
            <tbody>
`;

batches.forEach((batch) => {
    tableHTML += `
        <tr>
            <td>${batch.listingId}</td>
            <td>${batch.availableWeight}</td>
            <td>${batch.fisher}</td>
            <td>${batch.pricePerKg}</td>
            <td><button>Buy</button></td>
        </tr>
    `;
});

tableHTML += `
            </tbody>
        </table>
    </div>
`;

formContainer.innerHTML = tableHTML;

    } else if (option === "Sell") {
        formContainer.innerHTML = `
            <form id="logCatchForm">
                <label for="weight">Weight</label><br>
                <input type="text" id="weight" name="weight"><br>
                <label for="pricePerKg">Price [Per Kg]</label><br>
                <input type="text" id="pricePerKg" name="pricePerKg"><br>
                <h1 id="logCatchMessage"></h1>
                <button type="submit">Sell</button>
            </form>
        `;
    } else if (option === "Authorize") {
        formContainer.innerHTML = `
            <form id="authorizeForm">
                <label for="username">Username:</label><br>
                <input type="text" id="username" name="username"><br>
                <label for="password">Password:</label><br>
                <input type="password" id="password" name="password"><br>
                <button type="submit">Authorize</button>
            </form>
        `;
    }

    // Dynamically attach submit event listener to the newly injected form
    const form = formContainer.querySelector("form");
    if (form) {
        form.addEventListener("submit", handleFormSubmit);
    }
}




async function fetchBatches() {
    const batches = [];
    try {
        for (let batchId = 1; batchId <= totalBatches; batchId++) {
            const response = await fetch(`http://localhost:8080/api/marketplace/listing/${batchId}`);
            if (!response.ok) {
                console.warn(`Batch ID ${batchId} not found or error occurred: ${response.statusText}`);
                continue; // Skip to the next batch ID
            }
            const batch = await response.json();

            // Map the batch to match the table structure
            batches.push({
                listingId: batch.listingId,
                availableWeight: batch.availableWeight,
                fisher: batch.fisher,
                pricePerKg: batch.pricePerKg,
            });
        }
    } catch (error) {
        console.error("Error fetching batches:", error);
        alert("Error fetching batches. Please try again later.");
    }
    return batches;
}















function handleFormSubmit(event) {
    event.preventDefault(); // Prevent default form submission (page reload)
    
    // You can add logic here based on the form's ID
    const formId = event.target.id;

    if (formId === "logCatchForm") {
        // Example: Handle Sell form submission
        const weight = parseFloat(document.getElementById("weight").value);
        const pricePerKg = parseFloat(document.getElementById("pricePerKg").value);

        if (isNaN(weight) || isNaN(pricePerKg)) {
            alert("Please enter valid numbers for weight and price per kg.");
            return;
        }

        makeApiRequest("http://localhost:8080/api/fisheries/logcatch", "POST", {
            weight,
            pricePerKg,
        }).then((result) => {
            totalBatches += 1;
            document.getElementById("logCatchMessage").textContent = result.message;
            const txDetails = `
                \n<a href="https://etherscan.io/tx/${result.txHash}" target="_blank">${result.txHash}</a><br>
            `;
            document.getElementById("logCatchMessage").innerHTML += txDetails;
        });
    } else {
        // Example: Handle other forms
        alert(`Form submitted: ${formId}`);
    }
}












async function makeApiRequest(url, method, data) {
    const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
    });
    return response.json();
}
