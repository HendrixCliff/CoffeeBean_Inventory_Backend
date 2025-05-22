// app.js
const express = require("express");
const cors = require("cors");
const { createClient } = require("redis");
const session = require('./config/sessionConfig');
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
app.set('trust proxy', 1); // For secure cookies in production on Render

// ✅ Session and Passport
app.use(session);
app.use(passport.initialize());
app.use(passport.session());


// ✅ Routes
app.use("/api/v1/items", itemRoute);
app.use("/api/v1/auth", authRoute);


// ✅ Server listen
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
