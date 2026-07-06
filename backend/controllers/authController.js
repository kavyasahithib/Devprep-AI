const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { sendOTPEmail, sendWelcomeEmail } = require("../services/nodeMailerService");

// Helper: Generate Tokens
const generateTokens = (user) => {
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

  return { accessToken, refreshToken };
};

// Helper: Password Validation
const validatePasswordStrength = (password, email, name) => {
    const minLength = 8;
    const maxLength = 12;
    const hasUpper = /[A-Z]/.test(password);
    const hasLower = /[a-z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(password);
    
    if (password.length < minLength || password.length > maxLength) {
        return "Password must be between 8 and 12 characters.";
    }
    if (!hasUpper || !hasLower || !hasNumber || !hasSpecial) {
        return "Password must include uppercase, lowercase, number, and special character.";
    }
    
    const lowerPass = password.toLowerCase();
    const lowerEmail = email.toLowerCase().split('@')[0];
    const lowerName = name ? name.toLowerCase() : "";
    
    if (lowerPass.includes(lowerEmail) || (lowerName && lowerPass.includes(lowerName))) {
        return "Password cannot contain your name or email.";
    }
    
    const commonPasswords = ["password123", "12345678", "admin123", "password!"];
    if (commonPasswords.includes(lowerPass)) {
        return "This password is too common. Please try a more unique one.";
    }
    
    return null;
};

// Helper: Set Cookie
const setTokenCookies = (res, accessToken, refreshToken) => {
  const isProd = process.env.NODE_ENV === "production";
  
  res.cookie("token", accessToken, {
    httpOnly: true,
    secure: isProd, // Disable secure on localhost to allow cookies over HTTP
    sameSite: isProd ? "strict" : "lax", // Lax is necessary for redirects to work on local dev
    path: "/",
    maxAge: 15 * 60 * 1000, // 15 mins
  });

  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    secure: isProd,
    sameSite: isProd ? "strict" : "lax",
    path: "/",
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  });
};

// ================= SIGNUP =================
exports.signup = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Password Policy Check
    const passwordError = validatePasswordStrength(password, email, name);
    if (passwordError) {
        return res.status(400).json({ message: passwordError });
    }

    let user = await User.findOne({ email });

    if (user && user.isVerified) {
      return res.status(400).json({ message: "User already exists and is verified." });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 mins

    if (user) {
      user.name = name;
      user.password = await bcrypt.hash(password, 10);
      user.otp = otp;
      user.otpExpires = otpExpires;
    } else {
      const hashedPassword = await bcrypt.hash(password, 10);
      user = new User({
        name,
        email,
        password: hashedPassword,
        otp,
        otpExpires,
      });
    }

    await user.save();
    
    console.log("\x1b[33m%s\x1b[0m", `[OTP DEVELOPER ALERT] Generated OTP for ${email} is: ${otp}`);
    
    try {
        await sendOTPEmail(email, otp);
    } catch (mailError) {
        console.error("Mail Error: Failed to transmit OTP email. Connection rejected by SMTP provider. Details:", mailError.message);
    }

    res.status(201).json({
      message: "OTP sent to your email. Please verify to complete registration. (For development, check the backend console log for the code)",
      email
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// ================= VERIFY OTP =================
exports.verifyOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;
    const user = await User.findOne({ email, otp, otpExpires: { $gt: Date.now() } });

    if (!user) {
      return res.status(400).json({ message: "Invalid or expired OTP." });
    }

    user.isVerified = true;
    user.otp = undefined;
    user.otpExpires = undefined;
    await user.save();

    try {
        await sendWelcomeEmail(user.email, user.name);
    } catch (mailError) {
        console.error("Welcome email failed to send:", mailError.message);
    }

    res.json({
      message: "Email verified successfully! Please log in to continue."
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// ================= LOGIN =================
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

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

    if (isMaintenanceActive && email.toLowerCase() !== "sailokeshnalabothu@gmail.com") {
      return res.status(403).json({ message: "Platform is currently under maintenance. Only the administrator can log in." });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({ message: "Invalid credentials." });
    }

    if (!user.isVerified) {
      return res.status(401).json({ message: "Email not verified.", email });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials." });
    }

    const { accessToken, refreshToken } = generateTokens(user);
    user.refreshToken = refreshToken;
    await user.save();

    setTokenCookies(res, accessToken, refreshToken);

    res.json({
      message: "Login successful",
      user: { id: user._id, name: user.name, email: user.email, role: user.role }
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// ================= REFRESH TOKEN =================
exports.refreshToken = async (req, res) => {
  try {
    const refreshToken = req.cookies.refreshToken;
    if (!refreshToken) return res.status(401).json({ message: "Refresh token required" });

    // Find user by refresh token (for rotation detection)
    const user = await User.findOne({ refreshToken });
    
    // IF REFRESH TOKEN IS NOT FOUND: It might be a reuse of an old token (stolen!)
    if (!user) {
        // Find if any user has this token in their history (if we tracked history)
        // For now, if current token doesn't match, we assume it's invalid.
        return res.status(403).json({ message: "Invalid refresh token" });
    }

    jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET || "refreshsecret", async (err, decoded) => {
      if (err) return res.status(403).json({ message: "Expired or invalid refresh token" });
      
      // ROTATION: Generate NEW tokens
      const { accessToken: newAccessToken, refreshToken: newRefreshToken } = generateTokens(user);
      
      // Update DB with NEW refresh token
      user.refreshToken = newRefreshToken;
      await user.save();

      // Set NEW cookies
      setTokenCookies(res, newAccessToken, newRefreshToken);

      res.json({ message: "Token refreshed" });
    });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

// ================= LOGOUT =================
exports.logout = async (req, res) => {
  try {
    const refreshToken = req.cookies.refreshToken;
    if (refreshToken) {
        await User.findOneAndUpdate({ refreshToken }, { refreshToken: null });
    }
    
    res.clearCookie("token");
    res.clearCookie("refreshToken");
    res.json({ message: "Logged out successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

// ================= FORGOT PASSWORD =================
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: "User with this email does not exist." });
    }

    // Generate random hex token
    const crypto = require("crypto");
    const resetToken = crypto.randomBytes(20).toString("hex");
    
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = Date.now() + 10 * 60 * 1000; // 10 mins
    await user.save();

    const { sendResetEmail } = require("../services/nodeMailerService");
    const resetUrl = `http://localhost:3000/reset-password?token=${resetToken}`;
    console.log("\x1b[33m%s\x1b[0m", `[PASSWORD RESET DEVELOPER ALERT] Reset Link for ${email} is: ${resetUrl}`);
    
    try {
        await sendResetEmail(email, resetToken);
    } catch (mailError) {
        console.error("Mail Error: Failed to transmit password reset email. Connection rejected by SMTP provider. Details:", mailError.message);
    }

    res.json({ message: "Password reset link sent to your email. (For development, check the backend console log for the link)" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// ================= RESET PASSWORD =================
exports.resetPassword = async (req, res) => {
  try {
    const { token, password } = req.body;
    
    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({ message: "Invalid or expired reset token." });
    }

    // Password Policy Check
    const passwordError = validatePasswordStrength(password, user.email, user.name);
    if (passwordError) {
        return res.status(400).json({ message: passwordError });
    }

    user.password = await bcrypt.hash(password, 10);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    res.json({ message: "Password has been reset successfully. You can now login." });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};