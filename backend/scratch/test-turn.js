const mongoose = require("mongoose");
require("dotenv").config({ path: "../.env" });

const Interview = require("../models/Interview");
const Question = require("../models/Question");
const { startInterview, processInterviewTurn } = require("../services/interviewService");

async function test() {
  try {
    console.log("Connecting to MongoDB...");
    await mongoose.connect(process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/devprepAI");
    console.log("Connected.");

    const topic = "Python Engineering";
    console.log("Initializing interview for topic:", topic);
    const initialMessage = await startInterview(null, topic);
    console.log("Initial Message from AI:", initialMessage);

    const chatHistory = [{ role: "interviewer", content: initialMessage }];
    const lastUserMessage = "Hello, I am ready for the Python interview.";
    
    console.log("Sending turn message...");
    const nextMsg = await processInterviewTurn(
      chatHistory,
      "",
      null,
      lastUserMessage,
      [],
      topic
    );
    console.log("Response from AI:", nextMsg);

  } catch (err) {
    console.error("Test Error:", err);
  } finally {
    await mongoose.disconnect();
  }
}

test();
