const express = require("express");
const router = express.Router();
const passport = require("passport");
const rateLimit = require("express-rate-limit");
const { signup, login, logout, verifyOTP, refreshToken, forgotPassword, resetPassword } = require("../controllers/authController");

// Rate limiter for Auth routes
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // limit each IP to 10 requests per windowMs
  message: "Too many requests from this IP, please try again after 15 minutes"
});

router.post("/signup", authLimiter, signup);
router.post("/verify-otp", authLimiter, verifyOTP);
router.post("/login", authLimiter, login);
router.post("/logout", logout);
router.post("/refresh-token", refreshToken);
router.post("/forgot-password", authLimiter, forgotPassword);
router.post("/reset-password", authLimiter, resetPassword);

// Google OAuth
router.get("/google", passport.authenticate("google", { scope: ["profile", "email"] }));

router.get(
  "/google/callback",
  passport.authenticate("google", { session: false, failureRedirect: "http://localhost:3000?error=auth_failed" }),
  async (req, res) => {
    const jwt = require("jsonwebtoken");
    const user = req.user;
    
    // Check if maintenance mode is active
    const Settings = require("../models/Settings");
    const settings = await Settings.findOne();
    let isMaintenanceActive = false;
    if (settings && settings.maintenanceMode) {
      const now = new Date();
      const start = settings.maintenanceStartDate ? new Date(settings.maintenanceStartDate) : null;
      const end = settings.maintenanceEndDate ? new Date(settings.maintenanceEndDate) : null;
      if ((!start || now >= start) && (!end || now <= end)) {
        isMaintenanceActive = true;
      }
    }

    if (isMaintenanceActive && user.email.toLowerCase() !== "sailokeshnalabothu@gmail.com") {
      return res.redirect("http://localhost:3000?error=maintenance_active");
    }
    
    const accessToken = jwt.sign(
      { id: user._id, role: user.role, email: user.email },
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

    // Set secure cookies
    const isProd = process.env.NODE_ENV === "production";
    res.cookie("token", accessToken, {
      httpOnly: true,
      secure: isProd,
      sameSite: isProd ? "strict" : "lax",
      maxAge: 15 * 60 * 1000,
    });
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: isProd,
      sameSite: isProd ? "strict" : "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    // Redirect to frontend (no token in URL)
    res.redirect(`http://localhost:3000/dashboard`);
  }
);

module.exports = router;