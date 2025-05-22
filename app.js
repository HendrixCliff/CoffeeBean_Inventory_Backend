const express = require("express");
const cors = require("cors");
const sessionMiddleware = require("./config/sessionConfig");
const passport = require("./config/passport");
const itemRoute = require("./routes/itemRoutes");
const authRoute = require("./routes/userRoutes");

const app = express();

// ✅ Dynamic CORS origin checking (supports multiple domains + tools like Postman)
const allowedOrigins = [
  "https://coffee-bean-dev-inventory.vercel.app",
  "http://localhost:5173/" // optional for local dev/testing
];

const corsOptions = {
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
};

app.use(cors(corsOptions)); // ✅ Use only this CORS setup!

// Middleware Setup
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.set("trust proxy", 1);

// Session and Passport
app.use(sessionMiddleware);
app.use(passport.initialize());
app.use(passport.session());

// Health Check
app.get("/", (req, res) => {
  res.status(200).send("✅ Inventory API is live");
});

// Routes
app.use("/api/v1/items", itemRoute);
app.use("/api/v1/auth", authRoute);

module.exports = app;
