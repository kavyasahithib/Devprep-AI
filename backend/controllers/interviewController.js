const Interview = require("../models/Interview");
const Question = require("../models/Question");
const { startInterview, processInterviewTurn, generateFinalAssessment } = require("../services/interviewService");

exports.initializeInterview = async (req, res) => {
  try {
    const { questionId } = req.body;
    const question = await Question.findById(questionId);
    
    if (!question) return res.status(404).json({ message: "Question not found" });

    const initialMessage = await startInterview(question);

    const interview = new Interview({
      userId: req.user.id,
      questionId,
      chatHistory: [{ role: "interviewer", content: initialMessage }]
    });

    await interview.save();
    res.status(201).json(interview);
  } catch (error) {
    res.status(500).json({ message: "Failed to start interview" });
  }
};

exports.handleTurn = async (req, res) => {
  try {
    const { interviewId } = req.params;
    const { message, code } = req.body;
    
    const interview = await Interview.findById(interviewId).populate("questionId");
    if (!interview) return res.status(404).json({ message: "Interview not found" });

    if (message) {
      interview.chatHistory.push({ role: "user", content: message });
    }

    const nextInterviewerMessage = await processInterviewTurn(
      interview.chatHistory, 
      code, 
      interview.questionId, 
      message
    );

    interview.chatHistory.push({ role: "interviewer", content: nextInterviewerMessage });
    
    if (code) interview.codeAtCompletion = code;
    await interview.save();

    res.json(interview);
  } catch (error) {
    res.status(500).json({ message: "Failed to process turn" });
  }
};

exports.completeInterview = async (req, res) => {
  try {
    const { interviewId } = req.params;
    const { code } = req.body;

    const interview = await Interview.findById(interviewId).populate("questionId");
    if (!interview) return res.status(404).json({ message: "Interview not found" });

    const assessment = await generateFinalAssessment(interview.chatHistory, code, interview.questionId);

    interview.status = "completed";
    interview.codeAtCompletion = code;
    interview.feedback = assessment;
    interview.endTime = Date.now();

    await interview.save();
    res.json(interview);
  } catch (error) {
    res.status(500).json({ message: "Failed to complete interview" });
  }
};
