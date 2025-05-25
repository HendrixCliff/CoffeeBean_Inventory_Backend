const util = require("util")
//const validator = require("validator")
const jwt = require("jsonwebtoken")
const User = require("./../models/userSchema")
const asyncErrorHandler = require("./../utils/asyncErrorHandler")
const dotenv = require("dotenv")
const CustomError = require("./../utils/customError")
const { sendForgotPasswordEmail } = require('./../utils/sendForgotPasswordEmail');
dotenv.config({path: "./config.env"})
const bcrypt = require("bcryptjs");
const crypto = require("crypto");
// const passport = require("passport");
const { createSendResponse } = require("../config/createSendResponse");




exports.signup = asyncErrorHandler(async (req, res, next) => {
  const { name, email, password, confirmPassword } = req.body;

  if (!name || !email || !password || !confirmPassword) {
    return res.status(400).json({ message: "All fields are required!" });
  }

  if (password !== confirmPassword) {
    return res.status(400).json({ message: "Passwords do not match" });
  }

  try {
    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      console.warn("⚠️ Email already in use:", email);
      return next(new CustomError("Email is already in use", 409));
    }

     if (!name || typeof name !== 'string' || name.trim().length === 0) {
      console.warn("⚠️ Invalid username submitted:", name);
      return next(new CustomError("Username is required and cannot be empty", 400));
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create the new user
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      date: new Date(),
    });

    console.log("✅ New user created:", user._id);

    // Automatically log the user in after signup
    req.login(user, (err) => {
      if (err) {
        console.error("❌ Login error after signup:", err);
        return next(new CustomError("Login after signup failed", 500));
      }

      console.log("✅ User logged in after signup:", user._id);
      createSendResponse(user, 201, req, res);
    });

  } catch (error) {
    console.error("❌ Error during signup:", error.message);
    return next(new CustomError("Signup failed", 500));
  }
});


   
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    const user = await User.findOne({ email }).select("+password");
    if (!user) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid email or password" });
    }


    req.login(user, (err) => {
      if (err) {
        console.error("Login error:", err);
        return res.status(500).json({ message: "Login failed" });
      }

      console.log("✅ User logged in, session ID:", req.sessionID);

      createSendResponse(user, 200, req, res);
    });

  } catch (err) {
    console.error("Login Error:", err);
    next(err);
  }
};
    
exports.protect = (req, res, next) => {
  if (req.isAuthenticated && req.isAuthenticated()) {
    console.log("✅ Authenticated user:", req.user); // <-- Add this
    return next();
  }

  console.log("❌ Unauthorized request");
  return res.status(401).json({ message: "Unauthorized" });
};


exports.restrict = (role) => {
    return (req, res, next) => {
        if (req.user.role !== role) {       
            return next(new CustomError("You do not have permission to perform this action", 403))
        }
        next()
    }
}

    exports.forgotPassword = asyncErrorHandler(async (req, res, next) => {
      const user = await User.findOne({ email: req.body.email });
      if (!user) {
          return next(new CustomError("There is no user with this email address", 404));
      }
  
     const resetToken = user.createResetPasswordToken();
    await user.save({ validateBeforeSave: false });

    const frontendBaseUrl = 'https://coffee-bean-dev-inventory.vercel.app';
    const resetUrl = `${frontendBaseUrl}/reset-password/${resetToken}`;

      try {
          // Send the password reset email
          await sendForgotPasswordEmail(user.email, resetUrl);
  
          res.status(200).json({
              status: "success",
              message: "Password reset link sent to the user's email",
          });
      } catch (err) {
          // Reset token fields in case of an email failure
          user.passwordResetToken = undefined;
          user.passwordResetTokenExpires = undefined;
          await user.save({ validateBeforeSave: false });
  
          console.log(err);
          return next(
              new CustomError("There was an error sending the email. Try again later", 500)
          );
      }
  });

  exports.resetPassword = asyncErrorHandler(async (req, res, next) => {
    // 1. Hash the token from the URL
  const hashedToken = crypto
    .createHash("sha256")
    .update(req.params.token)
    .digest("hex");

  // 2. Find the user based on token and expiration
  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() }
  });

  // 3. Handle invalid or expired token
  if (!user) {
    return next(new CustomError("Token is invalid or has expired", 400));
  }

  // 4. Set new password fields
  user.password = req.body.password;
  user.confirmPassword = req.body.confirmPassword;

  // 5. Clear reset fields
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  user.passwordChangedAt = Date.now();

  // 6. Save updated user
  await user.save();

  // 7. Respond without helper
  res.status(200).json({
    status: "success",
    message: "Password reset successful. You can now log in with your new password.",
    data: {
      id: user._id,
      email: user.email,
      name: user.name
    }
  });
  });

