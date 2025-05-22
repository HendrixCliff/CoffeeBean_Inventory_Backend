// config/sessionConfig.js
const session = require('express-session');
const pgSession = require('connect-pg-simple')(session);
const dotenv = require('dotenv');
dotenv.config({ path: './config.env' });
const { Pool } = require("pg");

const pgPool = new Pool({
  connectionString: process.env.DATABASE_URL, // from .env or Render
  ssl: {
    rejectUnauthorized: false,
  },
});


const isProduction = process.env.NODE_ENV === 'production';

const sessionMiddleware = session({
  store: new pgSession({
    pool: pgPool,
    tableName: "session", // default name
    createTableIfMissing: true, // ✅ this creates the table if not found
  }),
  secret: process.env.SESSION_SECRET || "super-secret-key", // keep this in env
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: true, // required for HTTPS
    sameSite: "none", // works with cross-origin
    maxAge: 1000 * 60 * 60 * 24 * 7, // 1 week
  },
});

module.exports = sessionMiddleware; // ✅ Make sure this is a function
