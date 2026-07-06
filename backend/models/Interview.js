const mongoose = require("mongoose");

const interviewSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  questionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Question"
  },
  topic: {
    type: String,
    default: null
  },
  status: {
    type: String,
    enum: ["ongoing", "completed", "absent"],
    default: "ongoing"
  },
  chatHistory: [
    {
      role: { type: String, enum: ["interviewer", "user", "system"] },
      content: { type: String },
      timestamp: { type: Date, default: Date.now }
    }
  ],
  codeAtCompletion: {
    type: String
  },
  feedback: {
    score: Number,
    technical: String,
    behavioral: String,
    confidence: Number
  },
  startTime: {
    type: Date,
    default: Date.now
  },
  endTime: {
    type: Date
  }
});

module.exports = mongoose.model("Interview", interviewSchema);
