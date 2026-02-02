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
exports.getUnlockedContentCounts = exports.accessVideo = exports.unlockContent = void 0;
const UnlockedContent_1 = __importDefault(require("../../models/content/UnlockedContent"));
const UserModel_1 = require("../../models/auth/UserModel");
const unlockContent = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { userId, courseId, contentId, batch } = req.body;
    if (!userId || !courseId || !contentId) {
        return res.status(400).json({ message: "Missing required fields" });
    }
    try {
        // Check if already unlocked
        const existing = yield UnlockedContent_1.default.findOne({
            userId,
            courseId,
            batch,
            unlockedContents: { $in: [contentId] },
        });
        if (existing) {
            return res.status(200).json({
                message: "Content already unlocked",
                data: existing,
            });
        }
        // Unlock content
        const updated = yield UnlockedContent_1.default.findOneAndUpdate({ userId, courseId, batch }, {
            $addToSet: { unlockedContents: contentId },
            $setOnInsert: { userId, courseId, batch },
        }, {
            new: true,
            upsert: true,
        });
        console.log(updated, "un");
        return res.status(201).json({
            message: "Content unlocked successfully",
            data: updated,
        });
    }
    catch (error) {
        console.error("Unlock error:", error);
        const errorMessage = error instanceof Error ? error.message : String(error);
        return res
            .status(500)
            .json({ message: "Server error", error: errorMessage });
    }
});
exports.unlockContent = unlockContent;
const accessVideo = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { courseId, userId, batch } = req.query;
    if (!courseId || !userId) {
        return res.status(400).json({ message: "Missing required fields" });
    }
    try {
        const unlocked = yield UnlockedContent_1.default.findOne({ courseId, userId, batch });
        if (!unlocked) {
            return res.status(200).json({ unlockedContents: [] });
        }
        // Ensure only _id array is returned
        return res.status(200).json({
            message: "Access granted",
            unlockedContents: unlocked.unlockedContents.map((c) => c.toString()),
        });
    }
    catch (error) {
        return res.status(500).json({
            message: "Server error",
            error: error instanceof Error ? error.message : String(error),
        });
    }
});
exports.accessVideo = accessVideo;
const getUnlockedContentCounts = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    try {
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
        const courseId = req.params.courseId;
        if (!userId) {
            return res.status(400).json({ message: "User ID is required" });
        }
        // Get user with their batchWisePerformance
        const user = yield UserModel_1.User.findById(userId)
            .select("userId batchWisePerformance")
            .populate({
            path: "batchWisePerformance.course",
            select: "title",
        })
            .lean();
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        // Get all unlocked contents for this user
        const unlockedContents = yield UnlockedContent_1.default.find({ courseId, userId })
            .select("courseId unlockedContents")
            .lean();
        // Process each batch performance to add unlocked content count
        const batchPerformanceWithCounts = (_b = user.batchWisePerformance) === null || _b === void 0 ? void 0 : _b.map((batch) => {
            var _a, _b;
            // Find unlocked contents for this course
            const courseUnlocked = unlockedContents.find((uc) => { var _a, _b; return uc.courseId.toString() === ((_b = (_a = batch.course) === null || _a === void 0 ? void 0 : _a._id) === null || _b === void 0 ? void 0 : _b.toString()); });
            const unlockedContentCount = ((_a = courseUnlocked === null || courseUnlocked === void 0 ? void 0 : courseUnlocked.unlockedContents) === null || _a === void 0 ? void 0 : _a.length) || 0;
            return {
                courseId: ((_b = batch.course) === null || _b === void 0 ? void 0 : _b._id) || courseId,
                batch: batch.batch,
                unlockedContentCount,
            };
        });
        return res.status(200).json({
            success: true,
            data: batchPerformanceWithCounts,
        });
    }
    catch (error) {
        console.error("Error fetching unlocked content counts:", error);
        return res.status(500).json({
            success: false,
            message: "Error fetching unlocked content counts",
            error: error instanceof Error ? error.message : "Unknown error",
        });
    }
});
exports.getUnlockedContentCounts = getUnlockedContentCounts;
