const Question = require("../models/Question");
const { generateBuggyCode, analyzeDebugAttempt } = require("../services/debugService");

exports.getBuggyQuestion = async (req, res) => {
  try {
    const { id } = req.params;
    const { language = 'javascript' } = req.query;
    const question = await Question.findById(id);
    if (!question) return res.status(404).json({ message: "Question not found" });

    const buggyCode = await generateBuggyCode(question, language);
    res.json({ question, buggyCode, language });
  } catch (error) {
    res.status(500).json({ message: "Failed to generate buggy code" });
  }
};

exports.submitDebugFix = async (req, res) => {
  try {
    const { id } = req.params;
    const { buggyCode, fixedCode, language } = req.body;
    const question = await Question.findById(id);
    if (!question) return res.status(404).json({ message: "Question not found" });

    const analysis = await analyzeDebugAttempt(buggyCode, fixedCode, question, language);
    res.json({ analysis });
  } catch (error) {
    res.status(500).json({ message: "Failed to analyze debug attempt" });
  }
};
