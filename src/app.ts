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
import bodyParser from "body-parser";
import cookieParser from "cookie-parser";

const app = express();

// Middleware
app.use(
  cors({
    origin: ["https://www.programming-fighter.com", "http://localhost:3000"],
    credentials: true,
  })
);

app.use(express.json());
app.use(bodyParser.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.get("/", (req, res) => {
  res.send("Server is running for Programming Fighter");
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

export default app;
