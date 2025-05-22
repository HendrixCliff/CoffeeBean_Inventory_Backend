// app.js
const express = require("express");
const cors = require("cors");
const session = require("./config/sessionConfig");
const passport = require("./config/passport");
const itemRoute = require("./routes/itemRoutes");
const authRoute = require("./routes/userRoutes");

const app = express();

// ✅ Middleware Setup
app.use(cors({
  origin: 'https://coffee-bean-dev-inventory.vercel.app',
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.set('trust proxy', 1); // Required for secure cookies behind proxies like Render

// ✅ Session and Passport
app.use(session);
app.use(passport.initialize());
app.use(passport.session());

// ✅ Health Check Endpoint (Render/Cloud Run/etc need this!)
app.get("/", (req, res) => {
  res.status(200).send("✅ Inventory API is live");
});

// ✅ Routes
app.use("/api/v1/items", itemRoute);
app.use("/api/v1/auth", authRoute);

// ✅ Export app
module.exports = app;
