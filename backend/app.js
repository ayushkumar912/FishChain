const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
require("dotenv").config({ path: ".env" });
const routes = require("./routes");

// Setup express and middleware
const app = express();
const port = 8080;

app.use(cors({
  origin: "*",
}));

app.use(bodyParser.json());
app.use("/api", routes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: "Internal server error" });
});

// Start server with error handling
const server = app
  .listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
  })
  .on("error", (error) => {
    console.error("Error starting server:", error);
    process.exit(1);
  });

// Handle graceful shutdown
process.on("SIGTERM", () => {
  server.close(() => {
    console.log("Server shutting down");
    process.exit(0);
  });
});

module.exports = app;