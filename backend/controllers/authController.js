const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { sendOTPEmail, sendWelcomeEmail } = require("../services/nodeMailerService");

// Helper: Generate Tokens
const generateTokens = (user) => {
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
      // Update existing unverified user
      user.name = name;
      user.password = await bcrypt.hash(password, 10);
      user.otp = otp;
      user.otpExpires = otpExpires;
    } else {
      // Create new unverified user
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
    
    try {
        await sendOTPEmail(email, otp);
    } catch (mailError) {
        console.error("Mail Error:", mailError.message);
        // We still return success for signup, but notify about email delay if needed
    }

    res.status(201).json({
      message: "OTP sent to your email. Please verify to complete registration.",
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

    await sendWelcomeEmail(user.email, user.name);

    const { accessToken, refreshToken } = generateTokens(user);
    user.refreshToken = refreshToken;
    await user.save();

    res.json({
      message: "Email verified successfully!",
      token: accessToken,
      refreshToken,
      user: { id: user._id, name: user.name, email: user.email, role: user.role }
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

    res.json({
      message: "Login successful",
      token: accessToken,
      refreshToken,
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
    const { refreshToken } = req.body;
    if (!refreshToken) return res.status(401).json({ message: "Refresh token required" });

    const user = await User.findOne({ refreshToken });
    if (!user) return res.status(403).json({ message: "Invalid refresh token" });

    jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET || "refreshsecret", (err, decoded) => {
      if (err) return res.status(403).json({ message: "Expired refresh token" });
      
      const accessToken = jwt.sign(
        { id: user._id, role: user.role },
        process.env.JWT_SECRET || "secretkey",
        { expiresIn: "15m" }
      );

      res.json({ token: accessToken });
    });
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
    await sendResetEmail(email, resetToken);

    res.json({ message: "Password reset link sent to your email." });
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