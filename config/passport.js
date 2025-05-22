const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const User = require('../models/userSchema');
const bcrypt = require('bcryptjs');

// 🔒 Local Strategy (Authentication Logic)
passport.use(new LocalStrategy(async (username, password, done) => {
  try {
    console.log("🔍 Authenticating user:", username);
    const user = await User.findOne({ username });

    if (!user) {
      console.warn("❌ User not found");
      return done(null, false, { message: 'User not found' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      console.warn("❌ Incorrect password");
      return done(null, false, { message: 'Incorrect password' });
    }

    console.log("✅ User authenticated:", user._id);
    return done(null, user);
  } catch (err) {
    console.error("Error in authentication:", err);
    return done(err);
  }
}));

// 🛠 Serialize User (Store user ID in session)
passport.serializeUser((user, done) => {
  done(null, user._id); // Store only the ID in session
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id); // 🔥 fetch full user doc
    done(null, user); // ➕ attaches user to req.user
  } catch (err) {
    done(err);
  }
});

module.exports = passport;
