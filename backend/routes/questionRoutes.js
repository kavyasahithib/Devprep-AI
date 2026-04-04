const express = require("express");
const router = express.Router();

const {
  addQuestion,
  getQuestions,
  deleteQuestion,
  getQuestionById,
  updateQuestion,
  getDailyQuestion,
  getQuestionsByCompany
} = require("../controllers/questionController");

// 🔐 Import middlewares
const auth = require("../middleware/authMiddleware");
const admin = require("../middleware/admin");


// ================= PUBLIC ROUTES =================
router.get("/", getQuestions);
router.get("/daily", getDailyQuestion);
router.get("/company/:company", getQuestionsByCompany);
router.get("/:id", getQuestionById);



// ================= ADMIN ROUTES =================

// Add question (admin only)
router.post("/add", auth, admin, addQuestion);

// Update question (admin only)
router.put("/:id", auth, admin, updateQuestion);

// Delete question (admin only)
router.delete("/:id", auth, admin, deleteQuestion);


module.exports = router;