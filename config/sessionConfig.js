const session = require('express-session');
const RedisStoreFactory = require('connect-redis').default;
const Redis = require('ioredis');
const dotenv = require('dotenv');

dotenv.config({ path: './config.env' });

const redisClient = new Redis(process.env.UPSTASH_REDIS_URL);

const RedisStore = RedisStoreFactory(session);

const sessionMiddleware = session({
  store: new RedisStore({ client: redisClient, prefix: 'sess:' }),
  secret: process.env.SESSION_SECRET || 'fallback-secret',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    sameSite: 'none',
    maxAge: 1000 * 60 * 60 * 24, // 1 day
  },
});

module.exports = sessionMiddleware;
