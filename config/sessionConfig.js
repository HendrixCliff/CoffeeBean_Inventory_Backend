const session = require('express-session');
const RedisStoreFactory = require('connect-redis'); // 👈 this is a function in v5
const Redis = require('ioredis');
const dotenv = require("dotenv");
dotenv.config({ path: "./config.env" });

// ✅ Initialize Redis client with Upstash
const redisClient = new Redis(process.env.UPSTASH_REDIS_URL);

// ✅ Pass express-session into RedisStoreFactory to get RedisStore
const RedisStore = RedisStoreFactory(session);

// ✅ Create session middleware
const sessionMiddleware = session({
  store: new RedisStore({
    client: redisClient,
    prefix: 'sess:',
  }),
  secret: process.env.SESSION_SECRET || 'super-secret-dont-hardcode-me',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    sameSite: 'none',
    maxAge: 1000 * 60 * 60 * 24,
  }
});

module.exports = sessionMiddleware;
