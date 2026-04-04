const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");

const {
  runCodeOnly,
  submitCode,
  getUserSubmissions,
  generateHints,
  generateExplanation,
  analyzeComplexity,
  getSolvedQuestions,
  syncSubmissionToGithub,
  getSubmissionActivity
} = require("../controllers/submissionController");


router.post("/run", authMiddleware, runCodeOnly);

router.post("/submit", authMiddleware, submitCode);

router.post("/sync/:submissionId", authMiddleware, syncSubmissionToGithub);

router.get("/my-submissions", authMiddleware, getUserSubmissions);

router.get("/solved", authMiddleware, getSolvedQuestions);
router.get("/activity", authMiddleware, getSubmissionActivity);
router.get("/hints/:questionId", authMiddleware, generateHints);

router.post("/explanation", authMiddleware, generateExplanation);

router.post("/complexity", authMiddleware, analyzeComplexity);

router.get("/analyze", authMiddleware, async (req, res) => {
  try {
    const { analyzeUserPerformance } = require("../services/analysisService");
    const result = await analyzeUserPerformance(req.user.id);
    res.json(result);
  } catch (error) {
    res.status(500).json({ message: "Error analyzing performance" });
  }
});


module.exports = router;