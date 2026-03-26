"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.User = void 0;
const mongoose_1 = require("mongoose");
const userSchema = new mongoose_1.Schema({
    name: { type: String, required: true },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
        match: [
            /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
            "Please provide a valid email address",
        ],
    },
    password: { type: String, required: true },
    phone: { type: String },
    country: { type: String },
    profileImage: { type: String },
    district: { type: String },
    address: { type: String },
    gender: { type: String },
    isBlocked: { type: Boolean, default: false },
    userId: { type: String, required: true },
    enrolledCourses: [{ type: mongoose_1.Schema.Types.ObjectId, ref: "Course" }],
    role: {
        type: String,
        enum: ["admin", "instructor", "student"],
        default: "student",
    },
    isVipStudent: { type: Boolean, default: false },
    // Instructor-specific fields
    specialization: { type: String },
    qualifications: { type: [String] },
    batchWisePerformance: {
        type: [
            {
                course: { type: mongoose_1.Schema.Types.ObjectId, ref: "Course" },
                batch: { type: Number },
                progress: { type: Number },
                startedAt: { type: Date },
                stone: { type: Number },
                quiz: { type: [Number] },
                assignment: { type: [Number] },
                totalMark: { type: Number },
                profileType: { type: String },
                isUnlock: { type: Boolean, default: false },
            },
        ],
    },
});
exports.User = (0, mongoose_1.model)("User", userSchema);
