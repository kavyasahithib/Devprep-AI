const mongoose = require("mongoose");

const questionSchema = new mongoose.Schema({

  title: {
    type: String,
    required: true
  },

  description: {
    type: String,
    required: true
  },

  difficulty: {
    type: String,
    enum: ["Easy", "Medium", "Hard"],
    default: "Easy"
  },
  tags: [String],
  companies: [String],


  // Expected function name for validation
  functionName: {
    type: String,
    default: "solution"
  },

  // NEW FIELD → Test Cases
  testCases: [
    {
      input: {
        type: String,
        required: true
      },
      output: {
        type: String,
        required: true
      }
    }
  ],

  createdAt: {
    type: Date,
    default: Date.now
  }

});

questionSchema.index({ difficulty: 1 });
questionSchema.index({ companies: 1 });

module.exports = mongoose.model("Question", questionSchema);