// app.js
const express = require("express");
const cors = require("cors");
const { createClient } = require("redis");
const sessionMiddleware = require('./config/sessionConfig');
const passport = require("./config/passport");
const itemRoute = require("./routes/itemRoutes");
const authRoute = require("./routes/userRoutes");

const app = express();

// ✅ Redis Client for Counter
const redisClient = createClient({
  url: process.env.REDIS_URL,
  socket: {
    tls: true,
    rejectUnauthorized: false, // ⚠️ Only for Upstash or Fly.io
  },
});

redisClient.on("error", (err) => console.error("❌ Redis Client Error", err));

(async () => {
  try {
    await redisClient.connect();
    console.log("✅ Connected to Redis!");
  } catch (err) {
    console.error("🚨 Redis connection failed:", err);
  }
})();

// ✅ Middleware Setup
app.use(cors({
  origin: 'https://coffee-bean-dev-inventory.vercel.app',
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.set('trust proxy', 1); // For secure cookies in production on Render

// ✅ Session and Passport
app.use(sessionMiddleware); // uses Upstash/Fly.io Redis store inside
app.use(passport.initialize());
app.use(passport.session());

// ✅ Routes
app.use("/api/v1/items", itemRoute);
app.use("/api/v1/auth", authRoute);

// ✅ Counter route (Example usage of redisClient)
app.get("/", async (req, res) => {
  try {
    const value = parseInt(await redisClient.get("counter")) || 0;
    const newValue = value + 1;
    await redisClient.set("counter", newValue);
    res.send(`👋 Hello, visitor number ${newValue}!`);
  } catch (err) {
    console.error("Redis error:", err);
    res.status(500).send("Something went wrong 😵‍💫");
  }
});

// ✅ Server listen
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
