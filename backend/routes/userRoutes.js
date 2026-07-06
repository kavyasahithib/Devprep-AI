const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");

router.get("/profile", authMiddleware, async (req, res) => {
  try {
    const User = require("../models/User");
    const user = await User.findById(req.user.id).select("-password").lean();
    if (user) {
      const userIndex = await User.countDocuments({ createdAt: { $lt: user.createdAt } }) + 1;
      const createdYear = new Date(user.createdAt).getFullYear();
      const paddedIndex = String(userIndex).padStart(4, "0");
      user.enrollmentId = `${createdYear}${paddedIndex}`;
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

router.put("/profile", authMiddleware, async (req, res) => {
  try {
    const User = require("../models/User");
    const { 
      name, dob, gender, college, summary, permAddress, currAddress,
      educationList, experienceList, projectsList, accomplishmentsList, avatar
    } = req.body;

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (name !== undefined) user.name = name;
    if (dob !== undefined) user.dob = dob;
    if (gender !== undefined) user.gender = gender;
    if (college !== undefined) user.college = college;
    if (summary !== undefined) user.summary = summary;
    if (permAddress !== undefined) user.permAddress = permAddress;
    if (currAddress !== undefined) user.currAddress = currAddress;
    if (educationList !== undefined) user.educationList = educationList;
    if (experienceList !== undefined) user.experienceList = experienceList;
    if (projectsList !== undefined) user.projectsList = projectsList;
    if (accomplishmentsList !== undefined) user.accomplishmentsList = accomplishmentsList;
    if (avatar !== undefined) user.avatar = avatar;

    await user.save();

    const updatedUser = await User.findById(req.user.id).select("-password").lean();
    if (updatedUser) {
      const userIndex = await User.countDocuments({ createdAt: { $lt: updatedUser.createdAt } }) + 1;
      const createdYear = new Date(updatedUser.createdAt).getFullYear();
      const paddedIndex = String(userIndex).padStart(4, "0");
      updatedUser.enrollmentId = `${createdYear}${paddedIndex}`;
    }

    res.json(updatedUser);
  } catch (error) {
    console.error("Profile update error:", error);
    res.status(500).json({ message: "Server error" });
  }
});
const githubService = require("../services/githubService");
const User = require("../models/User");
const admin = require("../middleware/admin");

// Admin: Get All Users
router.get("/", authMiddleware, admin, async (req, res) => {
  try {
    const users = await User.find().select("-password").sort({ createdAt: -1 });
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

// Admin: Update User Role
router.put("/:id/role", authMiddleware, admin, async (req, res) => {
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
router.delete("/:id", authMiddleware, admin, async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.json({ message: "User removed" });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});


// 1. Redirect to GitHub
router.get("/github/auth", authMiddleware, (req, res) => {
  const crypto = require("crypto");
  const state = crypto.randomBytes(16).toString("hex");
  const isProd = process.env.NODE_ENV === "production";

  // Store state and userId in secure HTTP-only cookies
  res.cookie("github_state", state, {
    httpOnly: true,
    secure: isProd,
    sameSite: "lax",
    maxAge: 10 * 60 * 1000 // 10 minutes
  });
  res.cookie("github_user_id", req.user.id, {
    httpOnly: true,
    secure: isProd,
    sameSite: "lax",
    maxAge: 10 * 60 * 1000 // 10 minutes
  });

  const url = githubService.getAuthUrl();
  res.redirect(`${url}&state=${state}`);
});

// 2. Callback from GitHub
router.get("/github/callback", async (req, res) => {
  const { code, state } = req.query; 
  const savedState = req.cookies?.github_state;
  const savedUserId = req.cookies?.github_user_id;

  // Clear state cookies immediately
  res.clearCookie("github_state");
  res.clearCookie("github_user_id");

  // Validate state to prevent CSRF / session hijacking
  if (!state || state !== savedState || !savedUserId) {
    console.warn("[OAuth Alert] CSRF check failed or session expired during GitHub callback");
    return res.redirect("http://localhost:3000/profile?github=error");
  }

  try {
    const { token, username } = await githubService.exchangeCodeForToken(code);
    
    // Encrypt token before persisting it in database
    const { encrypt } = require("../services/cryptoService");
    const encryptedToken = encrypt(token);
    
    await User.findByIdAndUpdate(savedUserId, { 
      githubToken: encryptedToken, 
      githubUsername: username 
    });
    
    res.redirect("http://localhost:3000/profile?github=success");
  } catch (error) {
    console.error("GitHub Callback Error:", error.message);
    res.redirect("http://localhost:3000/profile?github=error");
  }
});

// Admin: Get specific user stats
router.get("/:id/stats", authMiddleware, admin, async (req, res) => {
  try {
    const { id } = req.params;
    const targetUser = await User.findById(id).select("-password").lean();
    if (!targetUser) {
      return res.status(404).json({ message: "User not found" });
    }

    const { analyzeUserPerformance } = require("../services/analysisService");
    const Submission = require("../models/Submission");
    
    // We can run the analysis service for the target user ID
    let performanceAnalysis = null;
    try {
      performanceAnalysis = await analyzeUserPerformance(id);
    } catch (err) {
      console.error("Failed to analyze user performance:", err.message);
    }

    // Let's compute more detailed statistics from submissions
    const submissions = await Submission.find({ userId: id }).populate("questionId");
    
    // 1. Solved problems count by difficulty
    const solvedSet = new Set();
    const difficultyStats = { Easy: 0, Medium: 0, Hard: 0 };
    const topicStats = {};
    const timeComplexityStats = {};
    const spaceComplexityStats = {};
    const languageStats = {};
    
    submissions.forEach(s => {
      // track language stats
      if (s.language) {
        languageStats[s.language] = (languageStats[s.language] || 0) + 1;
      }
      
      if (s.status === "Accepted" && s.questionId) {
        const qIdStr = s.questionId._id.toString();
        if (!solvedSet.has(qIdStr)) {
          solvedSet.add(qIdStr);
          
          const diff = s.questionId.difficulty || "Easy";
          difficultyStats[diff]++;
          
          // track topics (tags)
          if (s.questionId.tags && Array.isArray(s.questionId.tags)) {
            s.questionId.tags.forEach(tag => {
              topicStats[tag] = (topicStats[tag] || 0) + 1;
            });
          }
        }
        
        // track time and space complexity distribution for successful submissions
        if (s.timeComplexity && s.timeComplexity !== "Unknown") {
          timeComplexityStats[s.timeComplexity] = (timeComplexityStats[s.timeComplexity] || 0) + 1;
        }
        if (s.spaceComplexity && s.spaceComplexity !== "Unknown") {
          spaceComplexityStats[s.spaceComplexity] = (spaceComplexityStats[s.spaceComplexity] || 0) + 1;
        }
      }
    });

    // 2. Submission history for timeline graph (past 30 days)
    const mongoose = require("mongoose");
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const activity = await Submission.aggregate([
      {
        $match: {
          userId: new mongoose.Types.ObjectId(id),
          createdAt: { $gte: thirtyDaysAgo }
        }
      },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    res.json({
      user: targetUser,
      solvedCount: solvedSet.size,
      totalSubmissions: submissions.length,
      difficultyStats,
      topicStats,
      timeComplexityStats,
      spaceComplexityStats,
      languageStats,
      activityTimeline: activity,
      coachAnalysis: performanceAnalysis ? performanceAnalysis.analysis : "No analysis available yet."
    });
  } catch (error) {
    console.error("Admin user stats error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Admin: Get specific user submissions
router.get("/:id/submissions", authMiddleware, admin, async (req, res) => {
  try {
    const { id } = req.params;
    const Submission = require("../models/Submission");
    const submissions = await Submission.find({ userId: id })
      .populate("questionId", "title difficulty")
      .sort({ createdAt: -1 });
    res.json(submissions);
  } catch (error) {
    console.error("Admin user submissions error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;