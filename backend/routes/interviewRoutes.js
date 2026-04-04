const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const { initializeInterview, handleTurn, completeInterview } = require("../controllers/interviewController");

router.post("/start", authMiddleware, initializeInterview);
router.post("/:interviewId/turn", authMiddleware, handleTurn);
router.post("/:interviewId/complete", authMiddleware, completeInterview);

module.exports = router;
