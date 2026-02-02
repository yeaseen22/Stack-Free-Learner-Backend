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
Object.defineProperty(exports, "__esModule", { value: true });
exports.blockStudent = exports.deleteUser = exports.updatePassword = exports.updateUser = exports.getMe = exports.updateUserPerformanceByBatchId = exports.getUserById = exports.getAllUsers = exports.logout = exports.refresh = exports.login = exports.register = void 0;
const UserModel_1 = require("../models/UserModel");
const hashPassword_1 = require("../utils/hashPassword");
const EnrollmentModel_1 = require("../models/EnrollmentModel");
const jwt_1 = require("../utils/jwt");
const getProfileTypeWithUnlock_1 = require("../helpers/getProfileTypeWithUnlock");
const deviceTracker_1 = require("../helpers/deviceTracker");
const register = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { name, email, password, role } = req.body;
        if (!name || !email || !password) {
            return res.status(400).json({ message: "All fields are required" });
        }
        if (!/\S+@\S+\.\S+/.test(email)) {
            return res.status(400).json({ message: "Invalid email format" });
        }
        const existingUser = yield UserModel_1.User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: "User already exists" });
        }
        const hashedPassword = yield (0, hashPassword_1.hashPassword)(password, 10);
        // Generate a random 10-character alphanumeric userId
        const userId = Array.from({ length: 10 }, () => Math.random().toString(36)[2]).join("");
        const newUser = new UserModel_1.User({
            userId,
            name,
            email,
            role,
            password: hashedPassword,
        });
        yield newUser.save();
        return res.status(201).json({
            message: "User registered successfully",
            user: {
                id: newUser._id,
                name: newUser.name,
                email: newUser.email,
                role: newUser === null || newUser === void 0 ? void 0 : newUser.role,
                userId: newUser === null || newUser === void 0 ? void 0 : newUser.userId,
            },
        });
    }
    catch (error) {
        return res.status(500).json({ message: "Registration failed", error });
    }
});
exports.register = register;
const login = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const { email, password } = req.body;
        // Input validation
        if (!email || !password) {
            return res
                .status(400)
                .json({ message: "Email and password are required" });
        }
        if (!/\S+@\S+\.\S+/.test(email)) {
            return res.status(400).json({ message: "Invalid email format" });
        }
        // Find user
        const user = yield UserModel_1.User.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        // Verify password
        const isMatch = yield (0, hashPassword_1.comparePassword)(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: "Invalid credentials" });
        }
        //device tracking
        if (user === null || user === void 0 ? void 0 : user._id) {
            (0, deviceTracker_1.trackDevice)(user._id.toString(), req);
        }
        // Create user payload
        const userPayload = {
            id: user._id.toString(),
            email: user.email,
            role: (_a = user.role) !== null && _a !== void 0 ? _a : "",
        };
        // Generate token
        const accessToken = (0, jwt_1.generateAccessToken)(userPayload);
        const refreshToken = (0, jwt_1.generateRefreshToken)(userPayload);
        const isProd = process.env.NODE_ENV === "production";
        res.cookie("accessToken", accessToken, {
            httpOnly: true,
            secure: isProd,
            sameSite: isProd ? "none" : "lax",
            maxAge: 60 * 60 * 1000,
            path: "/",
        });
        res.cookie("refreshToken", refreshToken, {
            httpOnly: true,
            secure: isProd,
            sameSite: isProd ? "none" : "lax",
            maxAge: 7 * 24 * 60 * 60 * 1000,
            path: "/",
        });
        // Return response
        return res.status(201).json({
            message: "Login successful",
            accessToken,
            refreshToken,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
            },
        });
    }
    catch (error) {
        console.error("Login failed:", error);
        return res.status(500).json({ message: "Login failed", error });
    }
});
exports.login = login;
const refresh = (req, res) => {
    const refreshToken = req.cookies.refreshToken;
    if (!refreshToken) {
        res.status(401).json({ message: "No refresh token provided" });
        return;
    }
    const decoded = (0, jwt_1.verifyToken)(refreshToken, "refresh");
    if (!decoded) {
        res.status(403).json({
            message: "Invalid or expired refresh token. Please log in again.",
        });
        return;
    }
    // Generate a new access token
    const newAccessToken = (0, jwt_1.generateAccessToken)({
        id: decoded.id,
        email: decoded.email,
        role: decoded.role,
    });
    const isProd = process.env.NODE_ENV === "production";
    res.cookie("accessToken", newAccessToken, {
        httpOnly: true,
        secure: isProd,
        sameSite: isProd ? "none" : "lax",
        maxAge: 60 * 60 * 1000,
        path: "/",
    });
    res.status(200).json({ message: "Access token refreshed" });
};
exports.refresh = refresh;
const logout = (req, res) => {
    const isProd = process.env.NODE_ENV === "production";
    res.clearCookie("accessToken", {
        httpOnly: true,
        secure: isProd,
        sameSite: isProd ? "none" : "lax",
        path: "/",
    });
    res.clearCookie("refreshToken", {
        httpOnly: true,
        secure: isProd,
        sameSite: isProd ? "none" : "lax",
        path: "/",
    });
    res.status(200).json({ message: "Logout successful" });
};
exports.logout = logout;
const getAllUsers = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const users = yield UserModel_1.User.find().select("-password");
        if (!users || users.length === 0) {
            return res.status(404).json({ message: "No users found" });
        }
        // সব ইউজারের জন্য Enrollments খুঁজে বের করা
        const userIds = users.map((user) => user._id);
        const enrollments = yield EnrollmentModel_1.Enrollment.find({
            user: { $in: userIds },
        }).populate({
            path: "course",
        });
        // ইউজারভিত্তিক এনরোলমেন্ট সাজানো
        const enrollmentMap = new Map();
        for (const enrollment of enrollments) {
            const uid = enrollment.user.toString();
            if (!enrollmentMap.has(uid)) {
                enrollmentMap.set(uid, []);
            }
            enrollmentMap.get(uid).push({
                enrollmentId: enrollment._id,
                course_title: enrollment.course &&
                    typeof enrollment.course === "object" &&
                    "title" in enrollment.course
                    ? enrollment.course.title
                    : undefined,
                course_fee: enrollment === null || enrollment === void 0 ? void 0 : enrollment.amount,
                batch: enrollment.batch,
                enrollDate: enrollment.enrolledAt,
            });
        }
        return res.status(200).json({
            success: true,
            users: users.map((user) => ({
                id: user._id,
                name: user.name,
                email: user.email,
                reg_no: user.userId,
                gender: user === null || user === void 0 ? void 0 : user.gender,
                phone: user.phone,
                country: user.country,
                district: user.district,
                address: user.address,
                enrolledCourses: enrollmentMap.get(user._id.toString()) || [],
            })),
        });
    }
    catch (error) {
        return res.status(500).json({
            success: false,
            message: "Error fetching users",
            error: error instanceof Error ? error.message : "Unknown error",
        });
    }
});
exports.getAllUsers = getAllUsers;
const getUserById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.query;
        if (!id || typeof id !== "string") {
            return res.status(400).json({ message: "User ID is required" });
        }
        const user = yield UserModel_1.User.findById(id).select("-password");
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        // Fetch enrollments and populate course data
        const enrollments = yield EnrollmentModel_1.Enrollment.find({ user: user._id }).populate({
            path: "course",
            populate: {
                path: "batchData",
            },
        });
        const enrolledCourses = enrollments.map((enrollment) => {
            var _a, _b, _c, _d;
            return ({
                enrollmentId: enrollment._id,
                course_title: ((_a = enrollment.course) === null || _a === void 0 ? void 0 : _a.title) || "N/A",
                course_fee: enrollment.amount,
                batch: ((_d = (_c = (_b = enrollment.course) === null || _b === void 0 ? void 0 : _b.batchData) === null || _c === void 0 ? void 0 : _c[0]) === null || _d === void 0 ? void 0 : _d.batchNo) || "N/A",
                enrollDate: enrollment.enrolledAt,
            });
        });
        // Extract performance data if available
        const performances = user.batchWisePerformance || [];
        const performanceData = performances.map((perf) => ({
            course: perf === null || perf === void 0 ? void 0 : perf.course,
            batch: perf === null || perf === void 0 ? void 0 : perf.batch,
            assignment: perf.assignment,
            quiz: perf.quiz,
            stone: perf.stone,
            totalMarks: perf.totalMark,
        }));
        return res.status(200).json({
            success: true,
            user: {
                id: user._id,
                profileImage: user.profileImage,
                role: user.role,
                isBlocked: user.isBlocked,
                name: user.name,
                email: user.email,
                reg_no: user.userId,
                gender: user.gender,
                phone: user.phone,
                country: user.country,
                district: user.district,
                address: user.address,
                performance: performanceData,
                enrolledCourses,
            },
        });
    }
    catch (error) {
        return res.status(500).json({
            success: false,
            message: "Error fetching user",
            error: error instanceof Error ? error.message : "Unknown error",
        });
    }
});
exports.getUserById = getUserById;
const updateUserPerformanceByBatchId = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const { id, batchId } = req.params;
    const { assignment, quiz, stone } = req.body;
    try {
        // Fetch the user first
        const user = yield UserModel_1.User.findById(id);
        if (!user) {
            return res.status(404).json({ message: "User not found." });
        }
        const perf = (_a = user.batchWisePerformance) === null || _a === void 0 ? void 0 : _a.find((p) => p._id == batchId);
        if (!perf) {
            return res
                .status(404)
                .json({ message: "No matching performance found for that batchId." });
        }
        // Update stone (sum with previous)
        if (typeof stone === "number") {
            perf.stone = (perf.stone || 0) + stone;
        }
        // Push assignment and quiz if provided and are arrays
        if (Array.isArray(assignment)) {
            perf.assignment = [...(perf.assignment || []), ...assignment];
        }
        else if (assignment !== undefined) {
            perf.assignment = [...(perf.assignment || []), assignment];
        }
        if (Array.isArray(quiz)) {
            perf.quiz = [...(perf.quiz || []), ...quiz];
        }
        else if (quiz !== undefined) {
            perf.quiz = [...(perf.quiz || []), quiz];
        }
        // Optionally recalculate totalMark if needed
        if (typeof perf.stone === "number" &&
            Array.isArray(perf.assignment) &&
            Array.isArray(perf.quiz)) {
            perf.totalMark =
                perf.stone +
                    perf.assignment.reduce((a, b) => a + (typeof b === "number" ? b : 0), 0) +
                    perf.quiz.reduce((a, b) => a + (typeof b === "number" ? b : 0), 0);
        }
        yield user.save();
        res.status(200).json({ message: "Performance updated successfully." });
    }
    catch (err) {
        console.error("Update error:", err);
        res.status(500).json({ message: "Internal server error." });
    }
});
exports.updateUserPerformanceByBatchId = updateUserPerformanceByBatchId;
const getMe = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    try {
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
        if (!userId) {
            return res.status(400).json({ message: "User ID not found in token" });
        }
        const user = yield UserModel_1.User.findById(userId)
            .populate({
            path: "batchWisePerformance.course",
            select: "title",
        })
            .populate({
            path: "enrolledCourses",
            select: "title",
        })
            .lean();
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        const getPercentageChange = (current, previous) => {
            if (previous === 0) {
                if (current === 0)
                    return "0%";
                return "New";
            }
            const change = ((current - previous) / previous) * 100;
            const sign = change >= 0 ? "+" : "-";
            return `${sign}${Math.abs(change).toFixed(0)}%`;
        };
        const enrichedBatchPerformance = (_b = user.batchWisePerformance) === null || _b === void 0 ? void 0 : _b.map((batch) => {
            var _a, _b, _c, _d, _e;
            const quizTotal = ((_a = batch.quiz) === null || _a === void 0 ? void 0 : _a.reduce((a, b) => a + b, 0)) || 0;
            const assignmentTotal = ((_b = batch.assignment) === null || _b === void 0 ? void 0 : _b.reduce((a, b) => a + b, 0)) || 0;
            const totalMark = quizTotal + assignmentTotal;
            const currentDate = new Date(batch.startedAt);
            const previousWeekDate = new Date(currentDate);
            previousWeekDate.setDate(previousWeekDate.getDate() - 7);
            if (!user.batchWisePerformance) {
                user.batchWisePerformance = [];
            }
            // 🔄 Find previous week's performance for same course + previous batch
            const previous = user.batchWisePerformance.find((p) => {
                var _a, _b, _c, _d;
                return ((_b = (_a = p.course) === null || _a === void 0 ? void 0 : _a._id) === null || _b === void 0 ? void 0 : _b.toString()) === ((_d = (_c = batch.course) === null || _c === void 0 ? void 0 : _c._id) === null || _d === void 0 ? void 0 : _d.toString()) &&
                    p.batch === batch.batch - 1;
            });
            const prevQuiz = ((_c = previous === null || previous === void 0 ? void 0 : previous.quiz) === null || _c === void 0 ? void 0 : _c.reduce((a, b) => a + b, 0)) || 0;
            const prevAssignment = ((_d = previous === null || previous === void 0 ? void 0 : previous.assignment) === null || _d === void 0 ? void 0 : _d.reduce((a, b) => a + b, 0)) || 0;
            const prevTotalMark = prevQuiz + prevAssignment;
            const prevStone = (previous === null || previous === void 0 ? void 0 : previous.stone) || 0;
            const comparison = {
                assignment: getPercentageChange(assignmentTotal, prevAssignment),
                quiz: getPercentageChange(quizTotal, prevQuiz),
                stone: getPercentageChange(batch.stone, prevStone),
                totalMark: getPercentageChange(totalMark, prevTotalMark),
            };
            return Object.assign(Object.assign({}, batch), { courseTitle: ((_e = batch.course) === null || _e === void 0 ? void 0 : _e.title) || "Unknown Course", totalMark, profileLevels: (0, getProfileTypeWithUnlock_1.getAllProfileLevels)(totalMark), comparison });
        });
        return res.status(200).json({
            success: true,
            user: Object.assign(Object.assign({}, user), { batchWisePerformance: enrichedBatchPerformance }),
        });
    }
    catch (error) {
        console.error("Error fetching user profile:", error);
        return res.status(500).json({
            success: false,
            message: "Error fetching user profile",
            error: error instanceof Error ? error.message : "Unknown error",
        });
    }
});
exports.getMe = getMe;
const updateUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { userId } = req.params;
        if (!userId) {
            return res.status(400).json({ message: "User ID is required" });
        }
        const { name, phone, country, district, address, gender, profileImage } = req.body;
        const user = yield UserModel_1.User.findOne({ userId });
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        if (name !== undefined)
            user.name = name;
        if (phone !== undefined)
            user.phone = phone;
        if (country !== undefined)
            user.country = country;
        if (district !== undefined)
            user.district = district;
        if (address !== undefined)
            user.address = address;
        if (gender !== undefined)
            user.gender = gender;
        if (profileImage !== undefined)
            user.profileImage = profileImage;
        yield user.save();
        return res.status(200).json({
            success: true,
            message: "User updated successfully",
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                phone: user.phone,
                country: user.country,
                district: user.district,
                address: user.address,
                gender: user.gender,
                profileImage: user.profileImage,
            },
        });
    }
    catch (error) {
        return res.status(500).json({
            success: false,
            message: "Error updating user",
            error: error instanceof Error ? error.message : "Unknown error",
        });
    }
});
exports.updateUser = updateUser;
const updatePassword = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { userId } = req.params;
        if (!userId) {
            return res.status(400).json({ message: "User ID is required" });
        }
        const { oldPass, password } = req.body;
        if (!oldPass || !password) {
            return res
                .status(400)
                .json({ message: "Old password and new password are required" });
        }
        const user = yield UserModel_1.User.findOne({ userId });
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        // Verify old password
        const isMatch = yield (0, hashPassword_1.comparePassword)(oldPass, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: "Old password is incorrect" });
        }
        // Hash new password and update
        user.password = yield (0, hashPassword_1.hashPassword)(password, 10);
        yield user.save();
        return res.status(200).json({
            success: true,
            message: "Password updated successfully",
        });
    }
    catch (error) {
        return res.status(500).json({
            success: false,
            message: "Error updating password",
            error: error instanceof Error ? error.message : "Unknown error",
        });
    }
});
exports.updatePassword = updatePassword;
const deleteUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { userId } = req.params;
        if (!userId) {
            return res.status(400).json({ message: "User ID is required" });
        }
        const user = yield UserModel_1.User.findByIdAndDelete(userId);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        return res.status(200).json({
            success: true,
            message: "User deleted successfully",
        });
    }
    catch (error) {
        return res.status(500).json({
            success: false,
            message: "Error deleting user",
            error: error instanceof Error ? error.message : "Unknown error",
        });
    }
});
exports.deleteUser = deleteUser;
const blockStudent = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { studentId } = req.params;
        if (!studentId) {
            return res.status(400).json({ message: "Student ID is required" });
        }
        const user = yield UserModel_1.User.findById(studentId);
        if (!user) {
            return res.status(404).json({ message: "Student not found" });
        }
        user.isBlocked = !user.isBlocked;
        yield user.save();
        return res.status(200).json({
            success: true,
            message: `Student has been ${user.isBlocked ? "blocked" : "unblocked"} successfully`,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                isBlocked: user.isBlocked,
            },
        });
    }
    catch (error) {
        return res.status(500).json({
            success: false,
            message: "Error toggling student block status",
            error: error instanceof Error ? error.message : "Unknown error",
        });
    }
});
exports.blockStudent = blockStudent;
