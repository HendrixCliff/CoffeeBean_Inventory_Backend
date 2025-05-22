const session = require('express-session');
const RedisStore = require('connect-redis'); // ✅ connect-redis@7 exports the class directly
const Redis = require('ioredis');
const dotenv = require("dotenv");
dotenv.config({ path: "./config.env" });

// ✅ Use Redis URL from environment (Upstash style)
const redisClient = new Redis(process.env.UPSTASH_REDIS_URL);

// ✅ Create session store instance directly
const store = new RedisStore({
  client: redisClient,
  prefix: 'sess:',
});

// ✅ Create session middleware
const sessionMiddleware = session({
  store,
  secret: process.env.SESSION_SECRET || 'super-secret-dont-hardcode-me',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',  // Use HTTPS
    httpOnly: true,
    sameSite: 'none',                               // Needed for cross-domain cookies
    maxAge: 1000 * 60 * 60 * 24                     // 1 day
  }
});

module.exports = sessionMiddleware;
