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
exports.getStudentPerformance = exports.compareWeeklyPerformance = void 0;
const UserModel_1 = require("../../models/auth/UserModel");
const AssignmentSubmission_1 = require("../../models/task/AssignmentSubmission");
const QuizModel_1 = __importDefault(require("../../models/task/QuizModel"));
const calculatePercentageChange_1 = require("../../helpers/calculatePercentageChange");
const getProfileTypeWithUnlock_1 = require("../../helpers/getProfileTypeWithUnlock");
const getPercentageChange_1 = require("../../helpers/getPercentageChange");
const mongoose_1 = __importDefault(require("mongoose"));
const compareWeeklyPerformance = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { userId } = req.params;
        const user = yield UserModel_1.User.findById(userId);
        if (!user ||
            !user.batchWisePerformance ||
            user.batchWisePerformance.length === 0) {
            return res
                .status(404)
                .json({ message: "Performance data not found for this user" });
        }
        const performances = user.batchWisePerformance;
        // Get the last two records
        const sorted = performances.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
        if (sorted.length < 2) {
            return res
                .status(400)
                .json({ message: "Not enough performance data to compare" });
        }
        const currentWeek = sorted[0];
        const lastWeek = sorted[1];
        // Helper to sum array or return number as is
        const getNumber = (val) => Array.isArray(val) ? val.reduce((a, b) => a + b, 0) : val;
        const comparison = {
            assignment: (0, calculatePercentageChange_1.calculatePercentageChange)(getNumber(currentWeek.assignment), getNumber(lastWeek.assignment)),
            quiz: (0, calculatePercentageChange_1.calculatePercentageChange)(getNumber(currentWeek.quiz), getNumber(lastWeek.quiz)),
            stone: (0, calculatePercentageChange_1.calculatePercentageChange)(getNumber(currentWeek.stone), getNumber(lastWeek.stone)),
            totalMark: (0, calculatePercentageChange_1.calculatePercentageChange)(getNumber(currentWeek.totalMark), getNumber(lastWeek.totalMark)),
        };
        res.status(200).json({
            message: "Weekly performance comparison fetched",
            currentWeek,
            lastWeek,
            comparison,
        });
    }
    catch (error) {
        console.error("Error in weekly performance comparison:", error);
        res.status(500).json({ message: "Server error", error });
    }
});
exports.compareWeeklyPerformance = compareWeeklyPerformance;
const getStudentPerformance = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
        if (!userId) {
            return res.status(400).json({ message: "User ID not found in token" });
        }
        // Get user with enrolled courses
        const user = yield UserModel_1.User.findById(userId)
            .populate({
            path: "enrolledCourses",
            select: "title",
        })
            .lean();
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        // Get all assignment submissions for the user
        const assignmentSubmissions = yield AssignmentSubmission_1.AssignmentSubmission.find({
            user: userId,
        }).lean();
        // Get all quiz submissions for the user
        const quizSubmissions = yield QuizModel_1.default.find({
            user: userId,
        }).lean();
        // Group submissions by course and batch
        const performanceMap = new Map();
        // Process assignment submissions
        assignmentSubmissions.forEach((submission) => {
            const key = `${submission.course}_${submission.batch}`;
            if (!performanceMap.has(key)) {
                performanceMap.set(key, {
                    _id: new mongoose_1.default.Types.ObjectId(),
                    course: submission.course,
                    batch: submission.batch,
                    assignmentSubmissionIds: [],
                    quizSubmissionIds: [],
                    assignmentTotal: 0,
                    quizTotal: 0,
                    stone: 0, // TODO: Caluculate Added stone
                    totalMark: 0,
                });
            }
            const performance = performanceMap.get(key);
            performance.assignmentSubmissionIds.push(submission._id);
            performance.assignmentTotal += submission.mark || 0;
            performance.totalMark += submission.mark || 0;
        });
        // Process quiz submissions
        quizSubmissions.forEach((submission) => {
            const key = `${submission.course}_${submission.batch}`;
            if (!performanceMap.has(key)) {
                performanceMap.set(key, {
                    _id: new mongoose_1.default.Types.ObjectId(),
                    course: submission.course,
                    batch: submission.batch,
                    assignmentSubmissionIds: [],
                    quizSubmissionIds: [],
                    assignmentTotal: 0,
                    quizTotal: 0,
                    stone: 0, // TODO: Caluculate Added stone
                    totalMark: 0,
                });
            }
            const performance = performanceMap.get(key);
            performance.quizSubmissionIds.push(submission._id);
            performance.quizTotal += submission.score;
            performance.totalMark += submission.score;
        });
        // Convert map to array and populate course titles
        const performanceData = Array.from(performanceMap.values()).map((item) => {
            const course = user.enrolledCourses.find((c) => c._id.toString() === item.course.toString());
            return {
                course: {
                    _id: item.course,
                    title: (course === null || course === void 0 ? void 0 : course.title) || "Unknown Course",
                },
                batch: item.batch,
                assignmentSubmissionIds: item.assignmentSubmissionIds,
                quizSubmissionIds: item.quizSubmissionIds,
                assignmentTotal: item.assignmentTotal,
                quizTotal: item.quizTotal,
                stone: item.stone,
                totalMark: item.totalMark,
                profileLevels: (0, getProfileTypeWithUnlock_1.getAllProfileLevels)(item.totalMark),
            };
        });
        // Sort by course and batch
        performanceData.sort((a, b) => {
            if (a.course._id.toString() === b.course._id.toString()) {
                return a.batch.number - b.batch.number;
            }
            return a.course._id.toString().localeCompare(b.course._id.toString());
        });
        // Add comparison data between batches
        for (let i = 1; i < performanceData.length; i++) {
            const current = performanceData[i];
            const previous = performanceData[i - 1];
            // Only compare if it's the same course and consecutive batches
            if (current.course._id.toString() === previous.course._id.toString() &&
                current.batch.number === previous.batch.number + 1) {
                current.comparison = {
                    assignment: (0, getPercentageChange_1.getPercentageChange)(current.assignmentTotal, previous.assignmentTotal),
                    quiz: (0, getPercentageChange_1.getPercentageChange)(current.quizTotal, previous.quizTotal),
                    stone: (0, getPercentageChange_1.getPercentageChange)(current.stone, previous.stone),
                    totalMark: (0, getPercentageChange_1.getPercentageChange)(current.totalMark, previous.totalMark),
                };
            }
            else {
                // Add default comparison for first batch
                current.comparison = {
                    assignment: (0, getPercentageChange_1.getPercentageChange)(current.assignmentTotal, 0),
                    quiz: (0, getPercentageChange_1.getPercentageChange)(current.quizTotal, 0),
                    stone: (0, getPercentageChange_1.getPercentageChange)(current.stone, 0),
                    totalMark: (0, getPercentageChange_1.getPercentageChange)(current.totalMark, 0),
                };
            }
        }
        // Ensure first item has comparison data
        if (performanceData.length > 0 && !performanceData[0].comparison) {
            performanceData[0].comparison = {
                assignment: (0, getPercentageChange_1.getPercentageChange)(performanceData[0].assignmentTotal, 0),
                quiz: (0, getPercentageChange_1.getPercentageChange)(performanceData[0].quizTotal, 0),
                stone: (0, getPercentageChange_1.getPercentageChange)(performanceData[0].stone, 0),
                totalMark: (0, getPercentageChange_1.getPercentageChange)(performanceData[0].totalMark, 0),
            };
        }
        return res.status(200).json({
            success: true,
            data: performanceData,
        });
    }
    catch (error) {
        console.error("Failed to fetch performance:", error);
        res.status(500).json({ message: "Failed to fetch performance", error });
    }
});
exports.getStudentPerformance = getStudentPerformance;
