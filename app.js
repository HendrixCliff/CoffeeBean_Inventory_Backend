const express = require("express")
const cors = require("cors")
const dotenv = require("dotenv")
dotenv.config({path: "./config.env"})
const session = require('express-session');
const passport = require("./config/passport")
const itemRoute = require("./routes/itemRoutes")
const authRoute = require("./routes/userRoutes")
const app = express();

// ✅ Apply CORS First

app.use(cors({
  origin:  'https://coffee-bean-dev-inventory.vercel.app',
  methods: ['GET', 'POST',  'DELETE', 'PATCH'],
  credentials: true
}));

// ✅ THEN parse body
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ✅ THEN session and passport
// 💾 Required for Passport sessions
app.use(session({
  name: 'sid',
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: true,           // MUST be true in production (HTTPS)
    sameSite: 'none',       // Allows cross-origin cookie sharing
    httpOnly: true
  }
}));

app.use(passport.initialize());
app.use(passport.session());

app.use("/api/v1/items", itemRoute)
app.use("/api/v1/auth", authRoute)


module.exports = app