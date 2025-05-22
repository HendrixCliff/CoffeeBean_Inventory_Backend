const session = require('express-session');
const pgSession = require('connect-pg-simple')(session);
const dotenv = require('dotenv');
dotenv.config({ path: './config.env' });

const isProduction = process.env.NODE_ENV === 'production';

const sessionMiddleware = session({
  store: new pgSession({
    conString: process.env.DATABASE_URL,
    tableName: 'session',
    createTableIfMissing: !isProduction, // Auto-create only in dev
  }),
  secret: process.env.SESSION_SECRET || 'super-secret',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: isProduction,        // True in prod (HTTPS), false in dev (HTTP)
    httpOnly: true,
    sameSite: isProduction ? 'none' : 'lax',  // Cross-origin only if in prod
    maxAge: 1000 * 60 * 60 * 24  // 1 day
  }
});

module.exports = sessionMiddleware;
