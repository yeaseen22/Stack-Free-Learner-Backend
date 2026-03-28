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
exports.logout = exports.refresh = exports.login = exports.registerInstructor = exports.registerAdmin = exports.registerVipStudent = exports.registerStudent = void 0;
const UserModel_1 = require("../../models/auth/UserModel");
const hashPassword_1 = require("../../utils/hashPassword");
const deviceTracker_1 = require("../../helpers/deviceTracker");
const jwt_1 = require("../../utils/jwt");
const generateSecureUserId_1 = require("../../helpers/generateSecureUserId");
// register student
const registerStudent = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { name, email, password } = req.body;
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
        const userId = (0, generateSecureUserId_1.generateSecureUserId)("student");
        const newUser = new UserModel_1.User({
            userId,
            name,
            email,
            role: "student",
            password: hashedPassword,
        });
        yield newUser.save();
        return res.status(201).json({
            message: "Student registered successfully",
            user: {
                id: newUser._id,
                name: newUser.name,
                email: newUser.email,
                role: newUser.role,
                userId: newUser.userId,
            },
        });
    }
    catch (error) {
        return res
            .status(500)
            .json({ message: "Student registration failed", error });
    }
});
exports.registerStudent = registerStudent;
// VIP Student registration (admin-managed)
const registerVipStudent = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { name, email, password } = req.body;
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
        const userId = (0, generateSecureUserId_1.generateSecureUserId)("vipstudent");
        const newUser = new UserModel_1.User({
            userId,
            name,
            email,
            role: "student",
            isVipStudent: true,
            password: hashedPassword,
        });
        yield newUser.save();
        return res.status(201).json({
            message: "VIP Student registered successfully",
            user: {
                id: newUser._id,
                name: newUser.name,
                email: newUser.email,
                role: newUser.role,
                isVipStudent: newUser.isVipStudent,
                userId: newUser.userId,
            },
        });
    }
    catch (error) {
        return res
            .status(500)
            .json({ message: "VIP Student registration failed", error });
    }
});
exports.registerVipStudent = registerVipStudent;
// Admin registration
const registerAdmin = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { name, email, password } = req.body;
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
        const userId = (0, generateSecureUserId_1.generateSecureUserId)("admin");
        const newUser = new UserModel_1.User({
            userId,
            name,
            email,
            role: "admin",
            password: hashedPassword,
        });
        yield newUser.save();
        return res.status(201).json({
            message: "Admin registered successfully",
            user: {
                id: newUser._id,
                name: newUser.name,
                email: newUser.email,
                role: newUser.role,
                userId: newUser.userId,
            },
        });
    }
    catch (error) {
        return res
            .status(500)
            .json({ message: "Admin registration failed", error });
    }
});
exports.registerAdmin = registerAdmin;
// Instructor registration
const registerInstructor = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { name, email, password, specialization, qualifications } = req.body;
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
        const userId = (0, generateSecureUserId_1.generateSecureUserId)("instructor");
        const newUser = new UserModel_1.User({
            userId,
            name,
            email,
            role: "instructor",
            password: hashedPassword,
            specialization,
            qualifications,
        });
        yield newUser.save();
        return res.status(201).json({
            message: "Instructor registered successfully",
            user: {
                id: newUser._id,
                name: newUser.name,
                email: newUser.email,
                role: newUser.role,
                userId: newUser.userId,
                specialization: newUser.specialization,
                qualifications: newUser.qualifications,
            },
        });
    }
    catch (error) {
        return res
            .status(500)
            .json({ message: "Instructor registration failed", error });
    }
});
exports.registerInstructor = registerInstructor;
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
                isVipStudent: user.isVipStudent,
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
