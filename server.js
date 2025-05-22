require("dotenv").config({ path: "./config.env" });

const http = require("http");
const app = require("./app");
const connectDB = require("./config/db");
const cron = require("node-cron");
const winston = require("winston");

// Logger setup
const logger = winston.createLogger({
  transports: [new winston.transports.Console()],
});

logger.info("🚀 Application starting...");

// Get port from environment (Render injects process.env.PORT)
const PORT = process.env.PORT || 9000;

// Create HTTP server
const server = http.createServer(app);

// Handle server errors
server.on("error", (err) => {
  if (err.code === "EADDRINUSE") {
    logger.error(`❌ Port ${PORT} is already in use`);
  } else {
    logger.error(`❌ Server error: ${err.message}`);
  }
  process.exit(1);
});

// Connect to DB and then start server
connectDB()
  .then(() => {
    logger.info("✅ DB connected successfully");

    // Schedule a daily cron job
    cron.schedule("0 0 * * *", () => {
      logger.info("⏰ Midnight cron task triggered");
    });

    // Start server
    server.listen(PORT, () => {
      logger.info(`✅ Server running and listening on port ${PORT}`);
    });
  })
  .catch((err) => {
    logger.error(`❌ Failed to connect to DB: ${err.message}`);
    process.exit(1);
  });
