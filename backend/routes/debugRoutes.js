const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const { getBuggyQuestion, submitDebugFix } = require("../controllers/debugController");

router.get("/:id", authMiddleware, getBuggyQuestion);
router.post("/:id/analyze", authMiddleware, submitDebugFix);

module.exports = router;
