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

// Connect to DB
connectDB();

// Schedule a daily cron job
cron.schedule("0 0 * * *", () => {
  logger.info("⏰ Midnight cron task triggered");
});

// Get port from environment (Render injects process.env.PORT)
const PORT = process.env.PORT;

if (!PORT) {
  logger.error("❌ process.env.PORT is not set. Are you running on Render?");
  process.exit(1);
}

const server = http.createServer(app);

server.listen(PORT, () => {
  logger.info(`✅ Server running on port ${PORT}`);
});

// Optional: Handle unexpected errors gracefully
server.on("error", (err) => {
  if (err.code === "EADDRINUSE") {
    logger.error(`❌ Port ${PORT} is already in use`);
  } else {
    logger.error(`❌ Server error: ${err.message}`);
  }
  process.exit(1);
});
