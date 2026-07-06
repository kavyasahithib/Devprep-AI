const Submission = require("../models/Submission");
const User = require("../models/User");

exports.getLeaderboard = async (req, res) => {

  try {

    // get accepted submissions
    const submissions = await Submission.find({
      status: "Accepted"
    });

    const userSolvedMap = {};

    submissions.forEach(sub => {

      const userId = sub.userId.toString();
      const questionId = sub.questionId.toString();

      if (!userSolvedMap[userId]) {
        userSolvedMap[userId] = new Set();
      }

      userSolvedMap[userId].add(questionId);

    });

    const leaderboard = [];

    for (const userId in userSolvedMap) {

      const user = await User.findById(userId);
      if (user) {
        leaderboard.push({
          user: user.name || (user.email ? user.email.split('@')[0] : "Anonymous"),
          solved: userSolvedMap[userId].size
        });
      }

    }

    leaderboard.sort((a, b) => b.solved - a.solved);

    res.json(leaderboard);

  } catch (error) {

    console.error(error);

    res.status(500).json({
      message: "Server error"
    });

  }

};