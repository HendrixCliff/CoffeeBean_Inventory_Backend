// sessionConfig.js
const session = require('express-session');
const Redis = require('ioredis');
const RedisStore = require('connect-redis').default;
const dotenv = require('dotenv');

dotenv.config();

const redisClient = new Redis(process.env.UPSTASH_REDIS_URL);

const sessionMiddleware = session({
  store: new RedisStore({ client: redisClient }),
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production', // true if deployed on HTTPS
    httpOnly: true,
    sameSite: 'none', // recommended if cross-site cookies (e.g. frontend on Vercel, backend on Render)
    maxAge: 1000 * 60 * 60 * 24, // 1 day
  },
});

module.exports = sessionMiddleware;
