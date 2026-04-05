const Interview = require("../models/Interview");
const Question = require("../models/Question");
const User = require("../models/User");
const { startInterview, processInterviewTurn, generateFinalAssessment, streamInterviewTurn } = require("../services/interviewService");

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
    const { message, code, stream = false } = req.body;
    
    const interview = await Interview.findById(interviewId).populate("questionId");
    if (!interview) return res.status(404).json({ message: "Interview not found" });

    // Fetch user mistakes for AI memory
    const user = await User.findById(req.user.id).select('lastMistakes');
    const userMistakes = user ? user.lastMistakes : [];

    if (message) {
      interview.chatHistory.push({ role: "user", content: message });
    }

    if (!stream) {
      // Standard non-streaming response
      const nextInterviewerMessage = await processInterviewTurn(
        interview.chatHistory, 
        code, 
        interview.questionId, 
        message,
        userMistakes
      );
      interview.chatHistory.push({ role: "interviewer", content: nextInterviewerMessage });
      if (code) interview.codeAtCompletion = code;
      await interview.save();
      return res.json(interview);
    }

    // SSE Streaming Logic
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    const assistantStream = await streamInterviewTurn(
      interview.chatHistory,
      code,
      interview.questionId,
      message,
      userMistakes
    );

    let fullContent = "";
    for await (const chunk of assistantStream) {
      const content = chunk.text();
      fullContent += content;
      res.write(`data: ${JSON.stringify({ chunk: content })}\n\n`);
    }

    // After stream ends, save to DB and send technical completion
    interview.chatHistory.push({ role: "interviewer", content: fullContent });
    if (code) interview.codeAtCompletion = code;
    await interview.save();

    res.write(`data: ${JSON.stringify({ done: true, interview: interview })}\n\n`);
    res.end();

  } catch (error) {
    console.error("Turn Error:", error);
    if (!res.headersSent) {
      res.status(500).json({ message: "Failed to process turn" });
    } else {
      res.write(`data: ${JSON.stringify({ error: "Stream interrupted" })}\n\n`);
      res.end();
    }
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
