const express = require("express")
const cors = require("cors")
const dotenv = require("dotenv")
dotenv.config({path: "./config.env"})
const sessionMiddleware = require('./config/sessionConfig');
const passport = require("./config/passport")
const itemRoute = require("./routes/itemRoutes")
const authRoute = require("./routes/userRoutes")
const app = express();


// ✅ Apply CORS First

app.use(cors({
  origin: 'https://coffee-bean-dev-inventory.vercel.app',
  credentials: true
}));

// ✅ THEN parse body
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


app.set('trust proxy', 1);  // Important for Render HTTPS

app.use(sessionMiddleware);     // Uses your Upstash Redis config
app.use(passport.initialize());
app.use(passport.session());

app.use("/api/v1/items", itemRoute)
app.use("/api/v1/auth", authRoute)


module.exports = app