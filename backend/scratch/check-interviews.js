const mongoose = require("mongoose");
require("dotenv").config({ path: "../.env" });

const Interview = require("../models/Interview");
const Question = require("../models/Question");

async function check() {
  try {
    console.log("Connecting to MongoDB...");
    await mongoose.connect(process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/devprepAI");
    console.log("Connected.");

    console.log("Fetching latest interviews...");
    const latestInterviews = await Interview.find()
      .sort({ startTime: -1 })
      .limit(3)
      .populate("questionId")
      .lean();

    console.log("Latest 3 interviews in DB:");
    latestInterviews.forEach((item, index) => {
      console.log(`\n--- [${index + 1}] ID: ${item._id} ---`);
      console.log("User ID:", item.userId);
      console.log("Topic:", item.topic);
      console.log("Question title:", item.questionId ? item.questionId.title : "None");
      console.log("Status:", item.status);
      console.log("Chat History Length:", item.chatHistory ? item.chatHistory.length : 0);
      console.log("Last Message:", item.chatHistory && item.chatHistory.length > 0 ? item.chatHistory[item.chatHistory.length - 1] : "None");
    });

  } catch (err) {
    console.error("Error checking database:", err);
  } finally {
    await mongoose.disconnect();
  }
}

check();
