// sessionConfig.js
const session = require('express-session');
const RedisStoreLib = require('connect-redis');
const Redis = require('ioredis');

const RedisStore = RedisStoreLib(session);

// ✅ Using your provided secure Redis URL from Upstash
const redisClient = new Redis("rediss://default:AZfPAAIjcDExYTFhMjlmN2JiNWE0NmQ1OWM2MjExZWZkNmYzMWUxYnAxMA@obliging-mouse-38863.upstash.io:443");

const sessionMiddleware = session({
  store: new RedisStore({ client: redisClient }),
  secret: process.env.SESSION_SECRET || 'super-secret-dont-hardcode-me',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    sameSite: 'none', // Cross-site cookies (for frontend-backend on diff domains)
    maxAge: 1000 * 60 * 60 * 24 // 1 day
  }
});

module.exports = sessionMiddleware;
