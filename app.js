// app.js
const express = require("express");
const cors = require("cors");
const sessionMiddleware = require("./config/sessionConfig");
const passport = require("./config/passport");
const itemRoute = require("./routes/itemRoutes");
const authRoute = require("./routes/userRoutes");

const app = express();

// ✅ Middleware Setup
const corsOptions = {
  origin: "https://coffee-bean-dev-inventory.vercel.app",
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
};

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.set("trust proxy", 1); // Required behind proxies (e.g. Render/Vercel)

// ✅ Session and Passport
app.use(sessionMiddleware);
app.use(passport.initialize());
app.use(passport.session());

// ✅ Health Check Endpoint (Render/Cloud Run/etc need this!)
app.get("/", (req, res) => {
  res.status(200).send("✅ Inventory API is live");
});

// ✅ Routes
app.use(cors(corsOptions));
app.use("/api/v1/items", itemRoute);
app.use("/api/v1/auth", authRoute);

// ✅ Export app
module.exports = app;
