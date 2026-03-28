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
exports.joinSession = exports.getMyEnrolledSessions = exports.getUpcomingSessions = exports.addRecordingLink = exports.updateSessionStatus = exports.deleteSession = exports.updateSession = exports.getSessionById = exports.getSessionsByBatch = exports.createSession = void 0;
const SessionModel_1 = require("../../models/session/SessionModel");
const isValidObjectId_1 = require("../../helpers/isValidObjectId");
const EnrollmentModel_1 = require("../../models/course/EnrollmentModel");
const BatchModel_1 = __importDefault(require("../../models/course/BatchModel"));
// Create a new session
const createSession = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const { batchId, title, description, sessionType, sessionDate, duration, meetingLink, instructor, materials, status, } = req.body;
        // Validate required fields
        if (!batchId || !title || !sessionDate || !duration) {
            return res.status(400).json({
                success: false,
                message: "Missing required fields: batchId, title, sessionDate, duration",
            });
        }
        // Validate ObjectIds
        if (!(0, isValidObjectId_1.isValidObjectId)(batchId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid batchId",
            });
        }
        const instructorId = instructor || ((_a = req.user) === null || _a === void 0 ? void 0 : _a.id);
        if (!(0, isValidObjectId_1.isValidObjectId)(instructorId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid instructor ID",
            });
        }
        const newSession = yield SessionModel_1.Session.create({
            batchId,
            title,
            description,
            sessionType: sessionType || "live",
            sessionDate: new Date(sessionDate),
            duration,
            meetingLink,
            instructor: instructorId,
            materials: materials || [],
            status: status || "scheduled",
        });
        const populatedSession = yield SessionModel_1.Session.findById(newSession._id)
            .populate("instructor", "name email profileImage")
            .populate("batchId", "batchNo course");
        return res.status(201).json({
            success: true,
            message: "Session created successfully",
            data: populatedSession,
        });
    }
    catch (error) {
        console.error("Create session error:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to create session",
            error: error instanceof Error ? error.message : "Unknown error",
        });
    }
});
exports.createSession = createSession;
// Get all sessions for a specific batch
const getSessionsByBatch = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    try {
        const { batchId } = req.params;
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
        const userRole = (_b = req.user) === null || _b === void 0 ? void 0 : _b.role;
        if (!(0, isValidObjectId_1.isValidObjectId)(batchId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid batch ID",
            });
        }
        // If user is a student, verify they are enrolled in this batch
        if (userRole === "student") {
            // Get the batch to find its batchNo
            const batch = yield BatchModel_1.default.findById(batchId).select("batchNo");
            if (!batch) {
                return res.status(404).json({
                    success: false,
                    message: "Batch not found",
                });
            }
            // Check if student is enrolled in this batch
            const enrollment = yield EnrollmentModel_1.Enrollment.findOne({
                user: userId,
                batch: batch.batchNo,
                status: "success",
            });
            if (!enrollment) {
                return res.status(403).json({
                    success: false,
                    message: "You are not enrolled in this batch",
                });
            }
        }
        const sessions = yield SessionModel_1.Session.find({ batchId })
            .populate("instructor", "name email profileImage")
            .populate("batchId", "batchNo course")
            .sort({ sessionDate: 1 });
        return res.status(200).json({
            success: true,
            count: sessions.length,
            data: sessions,
        });
    }
    catch (error) {
        console.error("Get sessions by batch error:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to fetch sessions",
            error: error instanceof Error ? error.message : "Unknown error",
        });
    }
});
exports.getSessionsByBatch = getSessionsByBatch;
// Get single session by ID
const getSessionById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        if (!(0, isValidObjectId_1.isValidObjectId)(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid session ID",
            });
        }
        const session = yield SessionModel_1.Session.findById(id)
            .populate("instructor", "name email profileImage")
            .populate("batchId", "batchNo course");
        if (!session) {
            return res.status(404).json({
                success: false,
                message: "Session not found",
            });
        }
        return res.status(200).json({
            success: true,
            data: session,
        });
    }
    catch (error) {
        console.error("Get session by ID error:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to fetch session",
            error: error instanceof Error ? error.message : "Unknown error",
        });
    }
});
exports.getSessionById = getSessionById;
// Update session
const updateSession = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const updateData = req.body;
        if (!(0, isValidObjectId_1.isValidObjectId)(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid session ID",
            });
        }
        // Validate date if provided
        if (updateData.sessionDate) {
            updateData.sessionDate = new Date(updateData.sessionDate);
        }
        const updatedSession = yield SessionModel_1.Session.findByIdAndUpdate(id, { $set: updateData }, { new: true, runValidators: true })
            .populate("instructor", "name email profileImage")
            .populate("batchId", "batchNo course");
        if (!updatedSession) {
            return res.status(404).json({
                success: false,
                message: "Session not found",
            });
        }
        return res.status(200).json({
            success: true,
            message: "Session updated successfully",
            data: updatedSession,
        });
    }
    catch (error) {
        console.error("Update session error:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to update session",
            error: error instanceof Error ? error.message : "Unknown error",
        });
    }
});
exports.updateSession = updateSession;
// Delete session
const deleteSession = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        if (!(0, isValidObjectId_1.isValidObjectId)(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid session ID",
            });
        }
        const deletedSession = yield SessionModel_1.Session.findByIdAndDelete(id);
        if (!deletedSession) {
            return res.status(404).json({
                success: false,
                message: "Session not found",
            });
        }
        return res.status(200).json({
            success: true,
            message: "Session deleted successfully",
            data: deletedSession,
        });
    }
    catch (error) {
        console.error("Delete session error:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to delete session",
            error: error instanceof Error ? error.message : "Unknown error",
        });
    }
});
exports.deleteSession = deleteSession;
// Update session status
const updateSessionStatus = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const { status } = req.body;
        if (!(0, isValidObjectId_1.isValidObjectId)(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid session ID",
            });
        }
        const validStatuses = ["scheduled", "ongoing", "completed", "cancelled"];
        if (!status || !validStatuses.includes(status)) {
            return res.status(400).json({
                success: false,
                message: "Invalid status. Must be one of: scheduled, ongoing, completed, cancelled",
            });
        }
        const updatedSession = yield SessionModel_1.Session.findByIdAndUpdate(id, { $set: { status } }, { new: true })
            .populate("instructor", "name email profileImage")
            .populate("batchId", "batchNo course");
        if (!updatedSession) {
            return res.status(404).json({
                success: false,
                message: "Session not found",
            });
        }
        return res.status(200).json({
            success: true,
            message: "Session status updated successfully",
            data: updatedSession,
        });
    }
    catch (error) {
        console.error("Update session status error:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to update session status",
            error: error instanceof Error ? error.message : "Unknown error",
        });
    }
});
exports.updateSessionStatus = updateSessionStatus;
// Add recording link to session
const addRecordingLink = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const { recordingLink } = req.body;
        if (!(0, isValidObjectId_1.isValidObjectId)(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid session ID",
            });
        }
        if (!recordingLink) {
            return res.status(400).json({
                success: false,
                message: "Recording link is required",
            });
        }
        const updatedSession = yield SessionModel_1.Session.findByIdAndUpdate(id, {
            $set: {
                recordingLink,
                status: "completed" // Automatically mark as completed when recording is added
            }
        }, { new: true })
            .populate("instructor", "name email profileImage")
            .populate("batchId", "batchNo course");
        if (!updatedSession) {
            return res.status(404).json({
                success: false,
                message: "Session not found",
            });
        }
        return res.status(200).json({
            success: true,
            message: "Recording link added successfully",
            data: updatedSession,
        });
    }
    catch (error) {
        console.error("Add recording link error:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to add recording link",
            error: error instanceof Error ? error.message : "Unknown error",
        });
    }
});
exports.addRecordingLink = addRecordingLink;
// Get upcoming sessions for logged-in student
const getUpcomingSessions = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
        if (!userId) {
            return res.status(401).json({
                success: false,
                message: "Unauthorized: User not found",
            });
        }
        // Find all enrollments for this user
        const enrollments = yield EnrollmentModel_1.Enrollment.find({
            user: userId,
            status: "success",
        }).select("batch course");
        if (enrollments.length === 0) {
            return res.status(200).json({
                success: true,
                count: 0,
                data: [],
                message: "No enrollments found",
            });
        }
        // Extract batch numbers
        const batchNumbers = enrollments.map((enrollment) => enrollment.batch);
        // Find batch documents by batch number
        const batches = yield BatchModel_1.default.find({
            batchNo: { $in: batchNumbers },
        }).select("_id");
        if (batches.length === 0) {
            return res.status(200).json({
                success: true,
                count: 0,
                data: [],
                message: "No batches found",
            });
        }
        // Extract batch ObjectIds
        const batchIds = batches.map((batch) => batch._id);
        // Find upcoming sessions for these batches
        const currentDate = new Date();
        const upcomingSessions = yield SessionModel_1.Session.find({
            batchId: { $in: batchIds },
            sessionDate: { $gte: currentDate },
            status: { $in: ["scheduled", "ongoing"] },
        })
            .populate("instructor", "name email profileImage")
            .populate("batchId", "batchNo course")
            .sort({ sessionDate: 1 })
            .limit(20);
        return res.status(200).json({
            success: true,
            count: upcomingSessions.length,
            data: upcomingSessions,
        });
    }
    catch (error) {
        console.error("Get upcoming sessions error:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to fetch upcoming sessions",
            error: error instanceof Error ? error.message : "Unknown error",
        });
    }
});
exports.getUpcomingSessions = getUpcomingSessions;
// Get all sessions for student's enrolled batches
const getMyEnrolledSessions = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
        if (!userId) {
            return res.status(401).json({
                success: false,
                message: "Unauthorized: User not found",
            });
        }
        // Find all enrollments for this user
        const enrollments = yield EnrollmentModel_1.Enrollment.find({
            user: userId,
            status: "success",
        }).select("batch course");
        if (enrollments.length === 0) {
            return res.status(200).json({
                success: true,
                count: 0,
                data: [],
                message: "No enrollments found",
            });
        }
        // Extract batch numbers
        const batchNumbers = enrollments.map((enrollment) => enrollment.batch);
        // Find batch documents by batch number
        const batches = yield BatchModel_1.default.find({
            batchNo: { $in: batchNumbers },
        }).select("_id batchNo");
        if (batches.length === 0) {
            return res.status(200).json({
                success: true,
                count: 0,
                data: [],
                message: "No batches found",
            });
        }
        // Extract batch ObjectIds
        const batchIds = batches.map((batch) => batch._id);
        // Find all sessions for these batches
        const sessions = yield SessionModel_1.Session.find({
            batchId: { $in: batchIds },
        })
            .populate("instructor", "name email profileImage")
            .populate("batchId", "batchNo course")
            .sort({ sessionDate: -1 }); // Most recent first
        return res.status(200).json({
            success: true,
            count: sessions.length,
            data: sessions,
        });
    }
    catch (error) {
        console.error("Get enrolled sessions error:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to fetch enrolled sessions",
            error: error instanceof Error ? error.message : "Unknown error",
        });
    }
});
exports.getMyEnrolledSessions = getMyEnrolledSessions;
// Join session - Get meeting link for enrolled student
const joinSession = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    try {
        const { id } = req.params;
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
        const userRole = (_b = req.user) === null || _b === void 0 ? void 0 : _b.role;
        if (!(0, isValidObjectId_1.isValidObjectId)(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid session ID",
            });
        }
        // Get the session
        const session = yield SessionModel_1.Session.findById(id)
            .populate("instructor", "name email profileImage")
            .populate("batchId", "batchNo course");
        if (!session) {
            return res.status(404).json({
                success: false,
                message: "Session not found",
            });
        }
        // If user is a student, verify enrollment
        if (userRole === "student") {
            const batchId = session.batchId;
            const batchNo = batchId === null || batchId === void 0 ? void 0 : batchId.batchNo;
            if (!batchNo) {
                return res.status(400).json({
                    success: false,
                    message: "Batch information not found",
                });
            }
            // Check if student is enrolled
            const enrollment = yield EnrollmentModel_1.Enrollment.findOne({
                user: userId,
                batch: batchNo,
                status: "success",
            });
            if (!enrollment) {
                return res.status(403).json({
                    success: false,
                    message: "You must be enrolled in this batch to join the session",
                });
            }
        }
        // Check if session has started or is ongoing
        const now = new Date();
        const sessionDate = new Date(session.sessionDate);
        const sessionEndTime = new Date(sessionDate.getTime() + session.duration * 60000);
        if (now < sessionDate) {
            return res.status(400).json({
                success: false,
                message: "Session has not started yet",
                sessionDate: session.sessionDate,
            });
        }
        if (now > sessionEndTime && session.status === "completed") {
            return res.status(400).json({
                success: false,
                message: "Session has ended. Please check the recording if available.",
                recordingLink: session.recordingLink || null,
            });
        }
        if (!session.meetingLink) {
            return res.status(400).json({
                success: false,
                message: "Meeting link not available for this session",
            });
        }
        return res.status(200).json({
            success: true,
            message: "Session ready to join",
            data: {
                sessionId: session._id,
                title: session.title,
                description: session.description,
                sessionType: session.sessionType,
                meetingLink: session.meetingLink,
                instructor: session.instructor,
                sessionDate: session.sessionDate,
                duration: session.duration,
                status: session.status,
                materials: session.materials,
            },
        });
    }
    catch (error) {
        console.error("Join session error:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to join session",
            error: error instanceof Error ? error.message : "Unknown error",
        });
    }
});
exports.joinSession = joinSession;
