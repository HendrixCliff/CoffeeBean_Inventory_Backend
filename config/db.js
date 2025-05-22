const mongoose = require("mongoose");
const winston = require("winston");
const dotenv = require("dotenv")
dotenv.config({path: "./config.env"});

const connectDB = async () => {
  const MONGO_URI = process.env.MONGO_URI;
  if (!MONGO_URI) {
    throw new Error("MONGO_URI is not defined in environment");
  }

  try {
    await mongoose.connect(MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    winston.info("✅ MongoDB connected successfully");
  } catch (err) {
    winston.error(`❌ MongoDB connection error: ${err.message}`);
    throw err;
  }
};

module.exports = connectDB;
