const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const { getBuggyQuestion, submitDebugFix } = require("../controllers/debugController");

router.get("/system/elite-status", authMiddleware, async (req, res) => {
  const { getCache, checkConnection } = require("../services/cacheService");
  const { generateWithFallback } = require("../services/aiService");
  
  const status = {
    auth: {
        method: req.headers.authorization ? "Bearer Token" : "Secure Cookie",
        userId: req.user.id,
        role: req.user.role
    },
    redis: checkConnection() ? "Online" : "Offline (Caching Disabled)",
    ai: "Checking...",
    sandbox: "Ready"
  };

  try {
    const aiTest = await generateWithFallback("Say 'Elite Ready'", "gemini-2.5-flash");
    status.ai = aiTest.includes("Elite") ? "Online (Gemini Active)" : "Degraded";
  } catch (e) {
    status.ai = "Offline";
  }

  res.json(status);
});

router.get("/:id", authMiddleware, getBuggyQuestion);
router.post("/:id/analyze", authMiddleware, submitDebugFix);


module.exports = router;
