const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");

router.get("/profile", authMiddleware, async (req, res) => {
  try {
    const User = require("../models/User");
    const user = await User.findById(req.user.id).select("-password");
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});
const githubService = require("../services/githubService");
const User = require("../models/User");

// Admin: Get All Users
router.get("/", authMiddleware, async (req, res) => {
  if (req.user.role !== "admin") return res.status(403).json({ message: "Admin only" });
  try {
    const users = await User.find().select("-password").sort({ createdAt: -1 });
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

// Admin: Update User Role
router.put("/:id/role", authMiddleware, async (req, res) => {
  if (req.user.role !== "admin") return res.status(403).json({ message: "Admin only" });
  try {
    const { role } = req.body;
    if (!["user", "admin"].includes(role)) return res.status(400).json({ message: "Invalid role" });
    const user = await User.findByIdAndUpdate(req.params.id, { role }, { new: true }).select("-password");
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

// Admin: Delete User
router.delete("/:id", authMiddleware, async (req, res) => {
  if (req.user.role !== "admin") return res.status(403).json({ message: "Admin only" });
  try {
    await User.findByIdAndDelete(req.params.id);
    res.json({ message: "User removed" });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});


// 1. Redirect to GitHub
router.get("/github/auth", authMiddleware, (req, res) => {
  const url = githubService.getAuthUrl();
  res.redirect(`${url}&state=${req.user.id}`);
});

// 2. Callback from GitHub
router.get("/github/callback", async (req, res) => {
  const { code, state } = req.query; 
  try {
    const { token, username } = await githubService.exchangeCodeForToken(code);
    await User.findByIdAndUpdate(state, { githubToken: token, githubUsername: username });
    res.redirect("http://localhost:3000/profile?github=success");
  } catch (error) {
    console.error(error);
    res.redirect("http://localhost:3000/profile?github=error");
  }
});

module.exports = router;