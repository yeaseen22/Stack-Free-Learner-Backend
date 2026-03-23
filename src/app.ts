import express from "express";
import cors from "cors";
import authRoutes from "./routes/auth/authRoutes";
import courseRoutes from "./routes/course/courseRoutes";
import enrollRoutes from "./routes/course/enrollRoutes";
import videosRoutes from "./routes/content/unlockedContentRoutes";
import batchRoutes from "./routes/course/batchRoutes";
import quizRoutes from "./routes/task/quizRoutes";
import blogRoutes from "./routes/admin/blogRoutes";
import performanceRoutes from "./routes/performance/performanceRoutes";
import leaderboardRoutes from "./routes/dashboard/leaderboard";
import forgetPassRoutes from "./routes/forget-password/forgetPass";
import deviceRoutes from "./routes/auth/device";
import assignmentSubmissionRoutes from "./routes/task/assignmentSubmissionRoutes";
import adminDashboardRoutes from "./routes/admin/adminDashboardRoutes";
import instructorRoutes from "./routes/instructor/instructorRoutes";
import manualPaymentRoutes from "./routes/payment/manualPaymentRoutes";
import sessionRoutes from "./routes/session/sessionRoutes";
import vipRoutes from "./routes/vip/vipRoutes";
import bodyParser from "body-parser";
import cookieParser from "cookie-parser";
import mongoose from "mongoose";

const app = express();

// Middleware
app.use(cors({
  origin: ["http://localhost:3000", "http://localhost:8000"],
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));

app.use(express.json());
app.use(bodyParser.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.get("/", (req, res) => {
  const dbStatus = mongoose.connection.readyState === 1 ? "Connected" : "Disconnected";
  res.json({
    message: "Server is running for Programming Fighter",
    status: "OK",
    database: {
      status: dbStatus,
      name: mongoose.connection.name || "Not connected"
    },
    timestamp: new Date().toISOString()
  });
});


// Routes
app.use("/api/auth", authRoutes);
app.use("/api/courses", courseRoutes);
app.use("/api/enroll", enrollRoutes);
app.use("/api/videos", videosRoutes);
app.use("/api/batch", batchRoutes);
app.use("/api/quiz", quizRoutes);
app.use("/api/blog", blogRoutes);
app.use("/api/performance", performanceRoutes);
app.use("/api/device", deviceRoutes);
app.use("/api/assignment", assignmentSubmissionRoutes);
app.use("/api/leaderboard", leaderboardRoutes);
app.use("/api/forgot", forgetPassRoutes);
app.use("/api/admin", adminDashboardRoutes)
app.use("/api/instructor", instructorRoutes)
app.use("/api/payment", manualPaymentRoutes)
app.use("/api/sessions", sessionRoutes)
app.use("/api/vip", vipRoutes)

export default app;
