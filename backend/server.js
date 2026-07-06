require("dotenv").config();

// Environment Validation
const requiredEnv = ["MONGODB_URI", "JWT_SECRET", "REFRESH_TOKEN_SECRET", "EMAIL_USER", "EMAIL_PASS"];
const missingEnv = requiredEnv.filter(env => !process.env[env]);
const aiKeyMissing = !process.env.GOOGLE_API_KEY && !process.env.GEMINI_API_KEY;

if (missingEnv.length > 0 || aiKeyMissing) {
  console.error("\x1b[31m%s\x1b[0m", "CRITICAL ERROR: Missing required environment variables:");
  missingEnv.forEach(env => console.error("- %s", env));
  if (aiKeyMissing) console.error("- GOOGLE_API_KEY (or GEMINI_API_KEY)");
  process.exit(1);
}
const http = require("http");
const { Server } = require("socket.io");
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

const helmet = require("helmet");
const mongoSanitize = require("./middleware/mongoSanitize");
const rateLimit = require("express-rate-limit");
const cookieParser = require("cookie-parser");

const app = express();

connectDB();

const { createAdapter } = require("@socket.io/redis-adapter");
const { createClient } = require("redis");

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    methods: ["GET", "POST"],
    credentials: true
  }
});

// Redis Adapter setup
const pubClient = createClient({ url: process.env.REDIS_URL || 'redis://127.0.0.1:6379' });
const subClient = pubClient.duplicate();

Promise.all([pubClient.connect(), subClient.connect()]).then(() => {
  io.adapter(createAdapter(pubClient, subClient));
  console.log("Redis Adapter Connected horizontally scaling Socket.io!");
}).catch(err => console.error("Redis Adapter Connection Error:", err));

// Real-time Events
io.on("connection", (socket) => {
  console.log("A user connected:", socket.id);

  socket.on("join-interview", (interviewId) => {
    socket.join(interviewId);
    console.log(`Socket ${socket.id} joined interview ${interviewId}`);
  });

  socket.on("typing", ({ interviewId, role }) => {
    socket.to(interviewId).emit("user-typing", { role });
  });

  socket.on("disconnect", () => {
    console.log("User disconnected");
  });
});

// Core Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || "http://localhost:3000",
  credentials: true,
}));
app.use(express.json());
app.use(cookieParser());
app.use(helmet());
app.use(mongoSanitize({
  allowDots: true,
  replaceWith: '_',
}));

const csrfMiddleware = require("./middleware/csrfMiddleware");
app.use(csrfMiddleware);

// Elite Logger (Consolidated)
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    const hasAuth = req.headers.authorization || (req.cookies && req.cookies.token);
    console.log(`[${new Date().toLocaleTimeString()}] ${req.method} ${req.originalUrl} ${res.statusCode} (${duration}ms) - Auth: ${hasAuth ? 'Present' : 'MISSING'}`);
  });
  next();
});


// Global Rate Limiting
const isDev = process.env.NODE_ENV === "development" || !process.env.NODE_ENV;
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: isDev ? 10000 : 100,
  message: "Too many requests from this IP, please try again later.",
  standardHeaders: true,
  legacyHeaders: false,
});
app.use(limiter);

const settingsRoutes = require("./routes/settingsRoutes");
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/questions", questionRoutes);
app.use("/api/submissions", submissionRoutes);
app.use("/api/leaderboard", leaderboardRoutes);
app.use("/api/interview", interviewRoutes);
app.use("/api/debug", debugRoutes);
app.use("/api/settings", settingsRoutes);

// Global Error Handler
app.use((err, req, res, next) => {
  console.error("\x1b[31m%s\x1b[0m", `[ERROR] ${err.stack || err.message}`);
  
  const statusCode = err.status || 500;
  res.status(statusCode).json({
    message: statusCode === 500 ? "Internal Server Error" : err.message,
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});




app.get("/", (req, res) => {
  res.send("DevPrep AI Backend Running");
});

const PORT = process.env.PORT || 5000;

server.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on port ${PORT}`);
});