const express = require("express")
const cors = require("cors")
const session = require('express-session');
const passport = require("./config/passport")
const itemRoute = require("./routes/itemRoutes")
const authRoute = require("./routes/userRoutes")
const app = express();

// ✅ Apply CORS First

app.use(cors({
  origin: ['http://localhost:5173', 'https://coffee-bean-dev-inventory.vercel.app'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
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

app.get("/api/v1/whoami", (req, res) => {
  if (req.isAuthenticated()) {
    res.json({ user: req.user });
  } else {
    res.status(401).json({ message: "Not logged in" });
  }
});
module.exports = app