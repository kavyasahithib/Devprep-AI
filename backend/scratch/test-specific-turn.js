const mongoose = require("mongoose");
require("dotenv").config({ path: "../.env" });

const Interview = require("../models/Interview");
const Question = require("../models/Question");
const { processInterviewTurn } = require("../services/interviewService");

async function run() {
  try {
    console.log("Connecting to MongoDB...");
    await mongoose.connect(process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/devprepAI");
    console.log("Connected.");

    const interviewId = "6a47d16f727715d6ab31bafd";
    const interview = await Interview.findById(interviewId).populate("questionId");
    if (!interview) {
      console.log("Interview not found!");
      return;
    }

    console.log("Found interview:", interview._id);
    console.log("History length:", interview.chatHistory.length);
    console.log("Topic:", interview.topic);

    const message = "I think client-side rendering is better for interactive dashboards because it provides a smooth experience after initial load.";
    
    // Mimic handleTurn logic:
    interview.chatHistory.push({ role: "user", content: message });
    
    console.log("Calling processInterviewTurn...");
    const response = await processInterviewTurn(
      interview.chatHistory,
      "",
      interview.questionId,
      message,
      [],
      interview.topic
    );
    
    console.log("AI Response successfully generated:", response);

  } catch (error) {
    console.error("FAILED TURN ERROR:", error);
  } finally {
    await mongoose.disconnect();
  }
}

run();
