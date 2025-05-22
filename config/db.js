const mongoose = require("mongoose");
const dotenv = require("dotenv")
dotenv.config({path: "./config.env"})

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.CONN_STR);
    console.log("✅ MongoDB Connected");
  } catch (error) {

    console.error("❌ MongoDB Connection Error:", error);
    process.exit(1);
  }
};

// Handle MongoDB connection errors
mongoose.connection.on("error", (err) => console.error("Connection error:", err));
mongoose.connection.once("open", () => console.log("Connected to the database"));

module.exports = connectDB;
