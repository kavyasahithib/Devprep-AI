require("dotenv").config();
const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");
const userRoutes = require("./routes/userRoutes");
const authRoutes = require("./routes/authRoutes");
const questionRoutes = require("./routes/questionRoutes");
const submissionRoutes = require("./routes/submissionRoutes");
const leaderboardRoutes = require("./routes/leaderboardRoutes");
const interviewRoutes = require("./routes/interviewRoutes");
const debugRoutes = require("./routes/debugRoutes");
const passport = require("passport");
require("./config/passportConfig");

const app = express();

// Global Logger (Top-level)
app.use((req, res, next) => {
  console.log(`[${new Date().toLocaleTimeString()}] ${req.method} ${req.url} - Auth: ${req.headers.authorization ? 'Present' : 'MISSING'}`);
  next();
});

connectDB();

app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/questions", questionRoutes);
app.use("/api/submissions", submissionRoutes);
app.use("/api/leaderboard", leaderboardRoutes);
app.use("/api/interview", interviewRoutes);
app.use("/api/debug", debugRoutes);




app.get("/", (req, res) => {
  res.send("DevPrep AI Backend Running");
});

const PORT = 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});