const express = require("express");
const router = express.Router();
const passport = require("passport");
const rateLimit = require("express-rate-limit");
const { signup, login, verifyOTP, refreshToken, forgotPassword, resetPassword } = require("../controllers/authController");

// Rate limiter for Auth routes
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // limit each IP to 10 requests per windowMs
  message: "Too many requests from this IP, please try again after 15 minutes"
});

router.post("/signup", authLimiter, signup);
router.post("/verify-otp", authLimiter, verifyOTP);
router.post("/login", authLimiter, login);
router.post("/refresh-token", refreshToken);
router.post("/forgot-password", authLimiter, forgotPassword);
router.post("/reset-password", authLimiter, resetPassword);

// Google OAuth
router.get("/google", passport.authenticate("google", { scope: ["profile", "email"] }));

router.get(
  "/google/callback",
  passport.authenticate("google", { session: false, failureRedirect: "http://localhost:3000?error=auth_failed" }),
  async (req, res) => {
    // Generate tokens for Google user
    const jwt = require("jsonwebtoken");
    const user = req.user;
    
    const accessToken = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET || "secretkey",
      { expiresIn: "15m" }
    );

    const refreshToken = jwt.sign(
      { id: user._id },
      process.env.REFRESH_TOKEN_SECRET || "refreshsecret",
      { expiresIn: "7d" }
    );

    user.refreshToken = refreshToken;
    await user.save();

    // Redirect to frontend with tokens
    res.redirect(`http://localhost:3000?token=${accessToken}&refreshToken=${refreshToken}`);
  }
);

module.exports = router;