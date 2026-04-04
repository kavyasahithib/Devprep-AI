const Question = require("../models/Question");


// ================= ADD QUESTION =================
exports.addQuestion = async (req, res) => {

  try {

    const { title, description, difficulty, testCases, functionName } = req.body;

    const question = new Question({
      title,
      description,
      difficulty,
      testCases,
      functionName: functionName || "solution",
      tags: req.body.tags || [],
      companies: req.body.companies || []
    });

    await question.save();

    console.log("✅ Question Added:", question._id);

    res.status(201).json({
      message: "Question added successfully",
      question
    });

  } catch (error) {

    console.error("❌ ADD ERROR:", error);

    res.status(500).json({
      message: "Server error"
    });

  }

};


// ================= GET ALL QUESTIONS =================
exports.getQuestions = async (req, res) => {

  try {

    const questions = await Question.find();

    console.log("📦 Total Questions:", questions.length);

    res.json(questions);

  } catch (error) {

    console.error("❌ FETCH ERROR:", error);

    res.status(500).json({
      message: "Server error"
    });

  }

};


// ================= DELETE QUESTION =================
exports.deleteQuestion = async (req, res) => {

  try {

    const { id } = req.params;

    console.log("🗑 DELETE REQUEST ID:", id);

    const deletedQuestion = await Question.findByIdAndDelete(id);

    if (!deletedQuestion) {

      console.log("⚠️ Question not found");

      return res.status(404).json({
        message: "Question not found"
      });

    }

    console.log("✅ Question Deleted:", deletedQuestion._id);

    res.json({
      message: "Question deleted successfully",
      deletedQuestion
    });

  } catch (error) {

    console.error("❌ DELETE ERROR:", error);

    res.status(500).json({
      message: "Server error"
    });

  }

};
// ================= UPDATE QUESTION =================
exports.updateQuestion = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, difficulty, testCases, tags, companies } = req.body;
    const updated = await Question.findByIdAndUpdate(
      id,
      { title, description, difficulty, testCases, tags, companies },
      { new: true }
    );
    if (!updated) return res.status(404).json({ message: "Question not found" });
    res.json({ message: "Question updated successfully", updated });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

// ================= GET QUESTION BY ID =================
exports.getQuestionById = async (req, res) => {
  try {
    const question = await Question.findById(req.params.id);
    if (!question) return res.status(404).json({ message: "Question not found" });
    res.json(question);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

// ================= GET DAILY QUESTION =================
exports.getDailyQuestion = async (req, res) => {
  try {
    const questions = await Question.find();
    if (questions.length === 0) return res.status(404).json({ message: "No questions available" });

    // Use date string as seed: "2026-03-25"
    const dateStr = new Date().toISOString().split('T')[0];
    let hash = 0;
    for (let i = 0; i < dateStr.length; i++) {
        hash = ((hash << 5) - hash) + dateStr.charCodeAt(i);
        hash |= 0; // Convert to 32bit integer
    }

    const index = Math.abs(hash) % questions.length;
    res.json(questions[index]);

  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

exports.getQuestionsByCompany = async (req, res) => {
  try {
    const { company } = req.params;
    const questions = await Question.find({ 
      companies: { $in: [new RegExp(company, 'i')] } 
    });
    res.json(questions);
  } catch (error) {
    res.status(500).json({ message: "Error fetching company questions" });
  }
};