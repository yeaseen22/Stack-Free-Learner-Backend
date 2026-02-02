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
exports.getMyAssignmentSubmissions = exports.updateAssignmentMark = exports.getUserSubmissions = exports.getAllSubmissions = exports.submitAssignment = void 0;
const AssignmentSubmission_1 = require("../../models/task/AssignmentSubmission");
const UserModel_1 = require("../../models/auth/UserModel");
// Submit an assignment
const submitAssignment = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const { 
        // assignmentId,
        assignmentNo, assignmentTitle, submissionLink, batch, assignmentId, course, } = req.body;
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
        if (!userId) {
            return res.status(400).json({ message: "User ID not found in token" });
        }
        const userData = yield UserModel_1.User.findById(userId);
        if (!userData) {
            return res.status(404).json({ message: "User not found" });
        }
        // Check if the assignment is already submitted by this user
        const existingSubmission = yield AssignmentSubmission_1.AssignmentSubmission.findOne({
            // assignmentId,
            user: userData._id,
            assignmentNo: assignmentNo,
            assignmentTitle: assignmentTitle,
            batch: batch,
            assignmentId: assignmentId,
            isSubmitted: true,
        });
        if (existingSubmission) {
            return res.status(400).json({
                message: "Assignment already submitted. Duplicate submission not allowed.",
            });
        }
        const newSubmission = new AssignmentSubmission_1.AssignmentSubmission({
            // assignmentId,
            assignmentNo,
            assignmentTitle,
            submissionLink,
            assignmentId,
            user: userId,
            batch,
            course,
            isSubmitted: true,
            submittedAt: new Date(),
        });
        yield newSubmission.save();
        res.status(201).json({
            message: "Assignment submitted successfully",
            data: newSubmission,
        });
    }
    catch (error) {
        res.status(500).json({ message: "Failed to submit assignment", error });
    }
});
exports.submitAssignment = submitAssignment;
// Get all submissions
const getAllSubmissions = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const submissions = yield AssignmentSubmission_1.AssignmentSubmission.find()
            .populate("user", "name -_id")
            .populate("course", "title -_id")
            .sort({
            submittedAt: -1,
        });
        res.status(200).json(submissions);
    }
    catch (error) {
        console.error("Fetch Error:", error);
        res.status(500).json({
            message: "Failed to fetch submissions",
            error: error.message || "Unknown error",
        });
    }
});
exports.getAllSubmissions = getAllSubmissions;
// Get my submissions
const getUserSubmissions = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
        const { assignmentId } = req.params;
        if (!userId) {
            return res.status(400).json({ message: "User ID not found in token" });
        }
        const user = yield UserModel_1.User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        const submissions = yield AssignmentSubmission_1.AssignmentSubmission.find({
            assignmentId: assignmentId,
            user: user._id,
            isSubmitted: true,
        }).sort({ submittedAt: -1 });
        res.status(200).json({ submissions });
    }
    catch (error) {
        res
            .status(500)
            .json({ message: "Failed to fetch user submissions", error });
    }
});
exports.getUserSubmissions = getUserSubmissions;
// Update mark
const updateAssignmentMark = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const { mark } = req.body;
        const updatedSubmission = yield AssignmentSubmission_1.AssignmentSubmission.findByIdAndUpdate(id, { mark }, { new: true });
        if (!updatedSubmission) {
            return res.status(404).json({ message: "Submission not found" });
        }
        res.status(200).json({ message: "Mark updated", data: updatedSubmission });
    }
    catch (error) {
        res.status(500).json({ message: "Failed to update mark", error });
    }
});
exports.updateAssignmentMark = updateAssignmentMark;
const getMyAssignmentSubmissions = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
        if (!userId) {
            return res.status(400).json({ message: "User ID not found in token" });
        }
        const submissions = yield AssignmentSubmission_1.AssignmentSubmission.find({
            user: userId,
            isSubmitted: true,
        }).sort({ submittedAt: -1 });
        res.status(200).json({ submissions });
    }
    catch (error) {
        res
            .status(500)
            .json({ message: "Failed to fetch user submissions", error });
    }
});
exports.getMyAssignmentSubmissions = getMyAssignmentSubmissions;
