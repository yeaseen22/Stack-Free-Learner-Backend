"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAllQuizLeaderboards = exports.getMyQuiz = exports.getMyQuizSubmissions = exports.submitQuiz = void 0;
const QuizModel_1 = __importDefault(require("../../models/task/QuizModel"));
const UserModel_1 = require("../../models/auth/UserModel");
const submitQuiz = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const { quizId, quizTitle, batch, course, answers, correctAnswers, totalQuestions, score, submittedAt, } = req.body;
        // Validation
        if (!quizId ||
            !quizTitle ||
            !batch ||
            !course ||
            !answers ||
            !correctAnswers ||
            !totalQuestions ||
            !score ||
            !submittedAt) {
            return res.status(400).json({ message: "All fields are required" });
        }
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
        // Check if already submitted
        const existingSubmission = yield QuizModel_1.default.findOne({
            quizId: quizId,
            user: userId,
            course: course,
            batch: batch,
        });
        if (existingSubmission) {
            return res.status(409).json({ message: "Quiz already submitted" });
        }
        // Save new submission
        const newSubmission = new QuizModel_1.default({
            quizId,
            quizTitle,
            user: userId,
            batch,
            course,
            answers,
            correctAnswers,
            totalQuestions,
            score,
            submittedAt,
        });
        yield newSubmission.save();
        res.status(200).json({
            message: "Quiz submitted and performance updated successfully",
            submission: newSubmission,
        });
    }
    catch (error) {
        console.error("Error submitting quiz:", error);
        res.status(500).json({ message: "Server Error" });
    }
});
exports.submitQuiz = submitQuiz;
// Get my submissions
const getMyQuizSubmissions = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
        const quizId = req.params.quizId;
        if (!userId) {
            return res.status(400).json({ message: "User ID not found in token" });
        }
        const submissions = yield QuizModel_1.default.find({
            user: userId,
            quizId,
        });
        res.status(200).json({ submissions });
    }
    catch (error) {
        res
            .status(500)
            .json({ message: "Failed to fetch user submissions", error });
    }
});
exports.getMyQuizSubmissions = getMyQuizSubmissions;
const getMyQuiz = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
        if (!userId) {
            return res.status(400).json({ message: "User ID not found in token" });
        }
        const submissions = (yield QuizModel_1.default.find({ user: userId })
            .populate("course", "title")
            .lean());
        const user = yield UserModel_1.User.findOne({ _id: userId }).lean();
        const name = (user === null || user === void 0 ? void 0 : user.name) || "N/A";
        const formatted = submissions.map((sub) => {
            return {
                id: sub._id,
                courseName: sub.course.title || "N/A",
                studentName: name || "N/A",
                quizTitle: sub.quizTitle,
                batch: sub.batch,
                answers: sub.answers.length,
                correctAnswers: sub.correctAnswers,
                totalQuestions: sub.totalQuestions,
                score: sub.score,
                submittedAt: sub.submittedAt,
                isSubmitted: true,
            };
        });
        res.status(200).json({ quizData: formatted });
    }
    catch (error) {
        console.error("Quiz fetch error:", error);
        res
            .status(500)
            .json({ message: "Failed to fetch user submissions", error });
    }
});
exports.getMyQuiz = getMyQuiz;
const getAllQuizLeaderboards = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const submissions = (yield QuizModel_1.default.find({})
            .populate("user", "name")
            .populate("course", "title")
            .lean());
        const grouped = {};
        submissions.forEach((sub) => {
            const key = `${sub.user._id}-${sub.course._id}-${sub.batch}`;
            if (!grouped[key]) {
                grouped[key] = {
                    name: sub.user.name,
                    courseName: sub.course.title,
                    batch: sub.batch,
                    totalScore: 0,
                    totalMarks: 0,
                    percentage: 0,
                };
            }
            grouped[key].totalScore += sub.score;
            grouped[key].totalMarks += sub.totalQuestions * 1;
        });
        // Calculate percentage
        const result = Object.values(grouped).map((entry) => {
            entry.percentage = (entry.totalMarks / entry.totalScore) * 100;
            return entry;
        });
        // Sort by percentage descending
        result.sort((a, b) => b.percentage - a.percentage);
        const finalResult = result.map((entry, index) => ({
            rank: index + 1,
            name: entry.name,
            courseName: entry.courseName,
            quiz: `${entry.totalMarks}/${entry.totalScore}`,
            percentage: entry.percentage.toFixed(2) + "%",
            batch: `${entry.batch}`,
        }));
        res.status(200).json({
            success: true,
            message: "All quiz data retrieved",
            data: finalResult,
        });
    }
    catch (error) {
        console.error("Leaderboard fetch error:", error);
        res.status(500).json({ message: "Server Error" });
    }
});
exports.getAllQuizLeaderboards = getAllQuizLeaderboards;
