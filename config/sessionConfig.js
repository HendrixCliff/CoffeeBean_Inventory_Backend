const session = require('express-session');
const RedisStoreLib = require('connect-redis');
const RedisStore = RedisStoreLib.default;
const Redis = require('ioredis');

// ✅ Use your Upstash Redis connection string directly (no duplicate)
const redisClient = new Redis("rediss://default:AZfPAAIjcDExYTFhMjlmN2JiNWE0NmQ1OWM2MjExZWZkNmYzMWUxYnAxMA@obliging-mouse-38863.upstash.io:443");

const sessionMiddleware = session({
  store: new RedisStore({ client: redisClient }),
  secret: process.env.SESSION_SECRET || 'super-secret-dont-hardcode-me',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production', // 🔐 works with HTTPS
    httpOnly: true,
    sameSite: 'none', // 🌐 needed if frontend is on another domain
    maxAge: 1000 * 60 * 60 * 24 // 1 day
  }
});

module.exports = sessionMiddleware;
