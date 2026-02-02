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
exports.getSpecificSubmission = exports.changeUserRole = exports.allStudentInfo = exports.getAllTransactions = exports.adminStats = void 0;
const UserModel_1 = require("../../models/auth/UserModel");
const EnrollmentModel_1 = require("../../models/course/EnrollmentModel");
const CourseModel_1 = require("../../models/course/CourseModel");
const BatchModel_1 = __importDefault(require("../../models/course/BatchModel"));
const formatDate_1 = require("../../helpers/formatDate");
const AssignmentSubmission_1 = require("../../models/task/AssignmentSubmission");
const QuizModel_1 = __importDefault(require("../../models/task/QuizModel"));
const adminStats = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const totalStudents = yield UserModel_1.User.countDocuments({ role: "student" });
        const totalActiveStudents = yield UserModel_1.User.countDocuments({
            role: "student",
            isBlocked: false,
            enrolledCourses: { $exists: true, $not: { $size: 0 } },
        });
        const totalPayments = yield EnrollmentModel_1.Enrollment.countDocuments({
            status: "success",
        });
        const totalInstructors = yield UserModel_1.User.countDocuments({ role: "instructor" });
        const totalCourses = yield CourseModel_1.Course.countDocuments();
        const activeBatchs = yield BatchModel_1.default.countDocuments({ status: "active" });
        const certificates = yield EnrollmentModel_1.Enrollment.countDocuments({
            isComplete: "true",
        });
        const revenue = yield EnrollmentModel_1.Enrollment.aggregate([
            {
                $match: { status: "success" },
            },
            {
                $group: { _id: null, total: { $sum: "$amount" } },
            },
        ]);
        const totalRevenue = ((_a = revenue[0]) === null || _a === void 0 ? void 0 : _a.total) || 0;
        // Monthy Growth calculation
        const currentDate = new Date();
        const firstDayOfThisMonth = new Date(Date.UTC(currentDate.getFullYear(), currentDate.getMonth(), 1));
        const firstDayOfLastMonth = new Date(Date.UTC(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
        const lastDayOfLastMonth = new Date(Date.UTC(currentDate.getFullYear(), currentDate.getMonth(), 0));
        const thisMonthEnrollments = yield EnrollmentModel_1.Enrollment.find({
            status: "success",
            enrolledAt: { $gte: firstDayOfThisMonth, $lte: currentDate },
        });
        const lastMonthEnrollments = yield EnrollmentModel_1.Enrollment.find({
            status: "success",
            enrolledAt: { $gte: firstDayOfLastMonth, $lte: lastDayOfLastMonth },
        });
        const thisMonthRevenue = thisMonthEnrollments.reduce((sum, item) => sum + (item.amount || 0), 0);
        const lastMonthRevenue = lastMonthEnrollments.reduce((sum, item) => sum + (item.amount || 0), 0);
        let revenueGrowthPercentage = 0;
        if (lastMonthRevenue > 0) {
            revenueGrowthPercentage =
                (thisMonthRevenue - lastMonthRevenue) / lastMonthRevenue;
        }
        // If growth is negative, set it to 0
        const displayGrowthPercentage = Math.max(0, revenueGrowthPercentage);
        // Revenue Trend Data (Jan to Dec of current year)
        const currentYear = currentDate.getFullYear();
        const startDate = new Date(Date.UTC(currentYear, 0, 1)); // Jan 1st
        const endDate = new Date(Date.UTC(currentYear, 11, 31)); // Dec 31st
        const revenueTrend = yield EnrollmentModel_1.Enrollment.aggregate([
            {
                $match: {
                    status: "success",
                    enrolledAt: { $gte: startDate, $lte: endDate },
                },
            },
            {
                $group: {
                    _id: { $month: "$enrolledAt" },
                    revenue: { $sum: "$amount" },
                    payments: { $sum: 1 },
                    students: { $addToSet: "$user" },
                },
            },
            {
                $sort: { _id: 1 },
            },
            {
                $project: {
                    month: {
                        $arrayElemAt: [
                            [
                                "",
                                "Jan",
                                "Feb",
                                "Mar",
                                "Apr",
                                "May",
                                "Jun",
                                "Jul",
                                "Aug",
                                "Sep",
                                "Oct",
                                "Nov",
                                "Dec",
                            ],
                            "$_id",
                        ],
                    },
                    revenue: 1,
                    payments: 1,
                    students: { $size: "$students" },
                },
            },
        ]);
        // Initialize revenueData with all months (Jan to Dec)
        const months = [
            "Jan",
            "Feb",
            "Mar",
            "Apr",
            "May",
            "Jun",
            "Jul",
            "Aug",
            "Sep",
            "Oct",
            "Nov",
            "Dec",
        ];
        const revenueData = months.map((month) => ({
            month,
            revenue: 0,
            payments: 0,
            students: 0,
        }));
        // Populate revenueData with actual values
        revenueTrend.forEach((item) => {
            const monthIndex = months.indexOf(item.month);
            if (monthIndex !== -1) {
                revenueData[monthIndex] = {
                    month: item.month,
                    revenue: item.revenue,
                    payments: item.payments,
                    students: item.students,
                };
            }
        });
        return res.status(200).json({
            success: true,
            message: "Admin stats retrieved successfully",
            data: {
                stats: {
                    totalStudents,
                    totalActiveStudents,
                    totalInstructors,
                    totalCourses,
                    activeBatchs,
                    certificates,
                    totalPayments,
                    totalRevenue,
                    thisMonthRevenue,
                    revenueGrowthPercentage: parseFloat(displayGrowthPercentage.toFixed(2)),
                    revenueData,
                },
            },
        });
    }
    catch (error) {
        return res.status(500).json({
            success: false,
            message: "Error to fetch data",
            error: error instanceof Error ? error.message : "Unknown error",
        });
    }
});
exports.adminStats = adminStats;
const getAllTransactions = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const transactions = yield EnrollmentModel_1.Enrollment.find({ status: "success" })
            .populate({
            path: "course",
            select: "title",
        })
            .sort({ enrolledAt: -1 });
        const formatted = transactions.map((txn) => {
            var _a;
            return ({
                transactionId: txn.transactionId || txn._id.toString(),
                student: txn.student_name,
                course: (_a = txn.course) === null || _a === void 0 ? void 0 : _a.title,
                amount: txn.amount,
                method: txn === null || txn === void 0 ? void 0 : txn.payment_method,
                status: txn.status,
                date: (0, formatDate_1.formatDate)(txn.enrolledAt),
                batch: txn.batch,
            });
        });
        return res.status(200).json({
            success: true,
            message: "Transactions retrieved successfully",
            data: formatted,
        });
    }
    catch (error) {
        return res.status(500).json({
            success: false,
            message: "Error retrieving transactions",
            error: error instanceof Error ? error.message : "Unknown error",
        });
    }
});
exports.getAllTransactions = getAllTransactions;
const allStudentInfo = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const totalStudents = yield UserModel_1.User.countDocuments({ role: "student" });
        const totalCourses = yield CourseModel_1.Course.countDocuments();
        const courses = yield CourseModel_1.Course.find({}, "title enrolledCount");
        // Fetch enrollments
        const enrollments = yield EnrollmentModel_1.Enrollment.find({})
            .populate({
            path: "course",
            select: "title",
        })
            .populate({
            path: "user",
            select: "_id name userId gender district",
        })
            .sort({ enrolledAt: -1 });
        // build course -> batch mapping
        const courseBatchesMap = {};
        enrollments.forEach((enroll) => {
            var _a;
            const courseTitle = (_a = enroll.course) === null || _a === void 0 ? void 0 : _a.title;
            const batch = enroll.batch;
            if (courseTitle && batch) {
                if (!courseBatchesMap[courseTitle]) {
                    courseBatchesMap[courseTitle] = new Set();
                }
                courseBatchesMap[courseTitle].add(batch);
            }
        });
        const courseData = courses.map((course) => ({
            courseName: course.title,
            enrolledCount: course.enrolledCount || 0,
            batches: Array.from(courseBatchesMap[course.title] || []),
        }));
        // Map all student info
        const allInfo = enrollments.map((enroll) => {
            var _a, _b, _c, _d, _e, _f;
            return ({
                id: ((_a = enroll.user) === null || _a === void 0 ? void 0 : _a._id) || "N/A",
                name: ((_b = enroll.user) === null || _b === void 0 ? void 0 : _b.name) || "N/A",
                regNo: ((_c = enroll.user) === null || _c === void 0 ? void 0 : _c.userId) || "N/A",
                gender: ((_d = enroll.user) === null || _d === void 0 ? void 0 : _d.gender) || "N/A",
                district: ((_e = enroll.user) === null || _e === void 0 ? void 0 : _e.district) || "N/A",
                course: ((_f = enroll.course) === null || _f === void 0 ? void 0 : _f.title) || "N/A",
                enrollDate: (0, formatDate_1.formatDate)(enroll.enrolledAt),
                fee: enroll.amount || 0,
                batch: enroll.batch || "N/A",
            });
        });
        return res.status(200).json({
            success: true,
            message: "All student info retrieved successfully",
            data: {
                stats: {
                    totalStudents,
                    totalCourses,
                    courseData,
                },
                allInfo,
            },
        });
    }
    catch (error) {
        return res.status(500).json({
            success: false,
            message: "Error retrieving student info",
            error: error instanceof Error ? error.message : "Unknown error",
        });
    }
});
exports.allStudentInfo = allStudentInfo;
const changeUserRole = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const { userId, newRole } = req.body;
        if (!userId || !newRole) {
            return res.status(400).json({
                success: false,
                message: "userId and newRole are required",
            });
        }
        const loggedInUserId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
        if (!loggedInUserId) {
            return res.status(400).json({ message: "User ID not found in token" });
        }
        // Prevent logged-in user from changing their own role
        if (loggedInUserId === userId) {
            return res.status(403).json({
                success: false,
                message: "You cannot change your own role",
            });
        }
        const user = yield UserModel_1.User.findById(userId);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found",
            });
        }
        // Check if the user already has the same role
        if (user.role === newRole) {
            return res.status(400).json({
                success: false,
                message: "User already has this role",
            });
        }
        user.role = newRole;
        yield user.save();
        return res.status(200).json({
            success: true,
            message: "User role updated successfully",
        });
    }
    catch (error) {
        return res.status(500).json({
            success: false,
            message: "Error updating user role",
            error: error instanceof Error ? error.message : "Unknown error",
        });
    }
});
exports.changeUserRole = changeUserRole;
const getSpecificSubmission = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = req.params.id;
        if (!userId) {
            return res.status(400).json({ message: "User ID not provided" });
        }
        const assignmentSubmissions = yield AssignmentSubmission_1.AssignmentSubmission.find({
            user: userId,
            isSubmitted: true,
        }).populate({
            path: "course",
            select: "title",
        });
        const quizSubmissions = yield QuizModel_1.default.find({
            user: userId,
        }).populate({
            path: "course",
            select: "title",
        });
        // Calculate total counts
        const totalAssignments = assignmentSubmissions.length;
        const totalQuizzes = quizSubmissions.length;
        // Group assignments by course + batch
        const groupedAssignments = {};
        assignmentSubmissions.forEach((submission) => {
            const course = submission.course;
            const key = `${course === null || course === void 0 ? void 0 : course.title}__${submission.batch}`;
            if (!groupedAssignments[key]) {
                groupedAssignments[key] = [];
            }
            groupedAssignments[key].push({
                assignmentTitle: submission.assignmentTitle || "Untitled",
                assignmentId: submission._id || "N/A",
                assignmentNo: submission.assignmentNo || "N/A",
                assignmentMark: submission.mark,
            });
        });
        // Group quizzes by course + batch
        const groupedQuizzes = {};
        quizSubmissions.forEach((submission) => {
            const course = submission.course;
            const key = `${course === null || course === void 0 ? void 0 : course.title}__${submission.batch}`;
            if (!groupedQuizzes[key]) {
                groupedQuizzes[key] = [];
            }
            groupedQuizzes[key].push({
                quizTitle: submission.quizTitle || "Untitled",
                quizScore: submission.score || "N/A",
            });
        });
        // Combine course + batch-wise results
        const mergedSubmissions = [];
        const allKeys = new Set([
            ...Object.keys(groupedAssignments),
            ...Object.keys(groupedQuizzes),
        ]);
        allKeys.forEach((key) => {
            var _a, _b;
            const [courseTitle, batch] = key.split("__");
            mergedSubmissions.push({
                courseTitle,
                batch,
                assignments: groupedAssignments[key] || [],
                quizzes: groupedQuizzes[key] || [],
                assignmentCount: ((_a = groupedAssignments[key]) === null || _a === void 0 ? void 0 : _a.length) || 0,
                quizCount: ((_b = groupedQuizzes[key]) === null || _b === void 0 ? void 0 : _b.length) || 0,
            });
        });
        return res.status(200).json({
            success: true,
            message: "Submission summary retrieved",
            totalAssignments,
            totalQuizzes,
            submissions: mergedSubmissions,
        });
    }
    catch (error) {
        console.error("Error fetching submissions:", error);
        return res.status(500).json({
            success: false,
            message: "Server error while fetching submissions",
            error: error instanceof Error ? error.message : "Unknown error",
        });
    }
});
exports.getSpecificSubmission = getSpecificSubmission;
