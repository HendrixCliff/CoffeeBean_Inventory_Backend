// config/sessionConfig.js
const session = require('express-session');
const RedisStore = require('connect-redis');
const Redis = require('ioredis');
const dotenv = require("dotenv");

dotenv.config({ path: "./config.env" });

// Initialize Redis client
const redisClient = new Redis(process.env.UPSTASH_REDIS_URL);

// Create Redis store
const store = new RedisStore({
  client: redisClient,
  prefix: 'sess:',
});

// Create session middleware
const sessionMiddleware = session({
  store,
  secret: process.env.SESSION_SECRET || 'super-secret-dont-hardcode-me',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    sameSite: 'none',
    maxAge: 1000 * 60 * 60 * 24, // 1 day
  }
});

module.exports = sessionMiddleware;
