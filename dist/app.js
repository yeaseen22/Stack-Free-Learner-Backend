"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const authRoutes_1 = __importDefault(require("./routes/auth/authRoutes"));
const courseRoutes_1 = __importDefault(require("./routes/course/courseRoutes"));
const enrollRoutes_1 = __importDefault(require("./routes/course/enrollRoutes"));
const unlockedContentRoutes_1 = __importDefault(require("./routes/content/unlockedContentRoutes"));
const batchRoutes_1 = __importDefault(require("./routes/course/batchRoutes"));
const quizRoutes_1 = __importDefault(require("./routes/task/quizRoutes"));
const blogRoutes_1 = __importDefault(require("./routes/admin/blogRoutes"));
const performanceRoutes_1 = __importDefault(require("./routes/performance/performanceRoutes"));
const leaderboard_1 = __importDefault(require("./routes/dashboard/leaderboard"));
const forgetPass_1 = __importDefault(require("./routes/forget-password/forgetPass"));
const device_1 = __importDefault(require("./routes/auth/device"));
const assignmentSubmissionRoutes_1 = __importDefault(require("./routes/task/assignmentSubmissionRoutes"));
const adminDashboardRoutes_1 = __importDefault(require("./routes/admin/adminDashboardRoutes"));
const instructorRoutes_1 = __importDefault(require("./routes/instructor/instructorRoutes"));
const manualPaymentRoutes_1 = __importDefault(require("./routes/payment/manualPaymentRoutes"));
const body_parser_1 = __importDefault(require("body-parser"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const app = (0, express_1.default)();
// Middleware
app.use((0, cors_1.default)({
    origin: ["https://www.programming-fighter.com", "http://localhost:3000"],
    credentials: true,
}));
app.use(express_1.default.json());
app.use(body_parser_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
app.use((0, cookie_parser_1.default)());
app.get("/", (req, res) => {
    res.send("Server is running for Programming Fighter");
});
// Routes
app.use("/api/auth", authRoutes_1.default);
app.use("/api/courses", courseRoutes_1.default);
app.use("/api/enroll", enrollRoutes_1.default);
app.use("/api/videos", unlockedContentRoutes_1.default);
app.use("/api/batch", batchRoutes_1.default);
app.use("/api/quiz", quizRoutes_1.default);
app.use("/api/blog", blogRoutes_1.default);
app.use("/api/performance", performanceRoutes_1.default);
app.use("/api/device", device_1.default);
app.use("/api/assignment", assignmentSubmissionRoutes_1.default);
app.use("/api/leaderboard", leaderboard_1.default);
app.use("/api/forgot", forgetPass_1.default);
app.use("/api/admin", adminDashboardRoutes_1.default);
app.use("/api/instructor", instructorRoutes_1.default);
app.use("/api/payment", manualPaymentRoutes_1.default);
exports.default = app;
