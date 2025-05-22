const express = require("express")
const cors = require("cors")
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
  secret: 'yourSecretKey',
  resave: false,
  saveUninitialized: false,
  cookie: {
    sameSite: 'none', // <- if frontend is on a different domain
    secure: true,     // <- true if you're using HTTPS (Render = yes)
    maxAge: 1000 * 60 * 60 * 48 // 2 day
  }
}));

app.use(passport.initialize());
app.use(passport.session());

app.use("/api/v1/items", itemRoute)
app.use("/api/v1/auth", authRoute)


module.exports = app