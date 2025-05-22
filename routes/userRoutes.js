const express = require("express");
const router = express.Router();

const {
  login,
  signup,
  forgotPassword,
  resetPassword
} = require("../controllers/authController");

router.post("/login", login);
router.post("/signup", signup);
router.post("/forgotPassword", forgotPassword);
router.patch("/resetPassword/:token", resetPassword);

module.exports = router;
