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
exports.instructorDashboardStats = exports.getAssignedCourses = exports.getInstructorDetails = exports.allInstructorInfo = exports.unassignInstructorFromBatch = exports.assignInstructorsToBatch = void 0;
const UserModel_1 = require("../../models/auth/UserModel");
const mongoose_1 = require("mongoose");
const BatchModel_1 = __importDefault(require("../../models/course/BatchModel"));
const EnrollmentModel_1 = require("../../models/course/EnrollmentModel");
const SessionModel_1 = require("../../models/session/SessionModel");
const QuizModel_1 = __importDefault(require("../../models/task/QuizModel"));
const AssignmentSubmission_1 = require("../../models/task/AssignmentSubmission");
const assignInstructorsToBatch = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { batchId } = req.params;
        const { instructorIds, courseId } = req.body;
        // Validation batch ID
        if (!mongoose_1.Types.ObjectId.isValid(batchId)) {
            return res
                .status(400)
                .json({ success: false, message: "Invalid batch ID." });
        }
        // Validate course ID
        if (!mongoose_1.Types.ObjectId.isValid(courseId)) {
            return res
                .status(400)
                .json({ success: false, message: "Invalid course ID." });
        }
        if (!Array.isArray(instructorIds) || instructorIds.length === 0) {
            return res.status(400).json({
                success: false,
                message: "Instructor IDs must be a non-empty array.",
            });
        }
        // Step 1: Check if instructors already assigned
        const existingBatch = yield BatchModel_1.default.findById(batchId).populate("instructors", "name email");
        if (!existingBatch) {
            return res
                .status(404)
                .json({ success: false, message: "Batch not found." });
        }
        if (existingBatch.instructors && existingBatch.instructors.length > 0) {
            return res.status(409).json({
                success: false,
                message: "Instructors are already assigned to this batch.",
                // data: existingBatch,
            });
        }
        // Step 2: Proceed to assign instructors
        const updatedBatch = yield BatchModel_1.default.findByIdAndUpdate(batchId, { instructors: instructorIds }, { new: true })
            .populate("instructors", "name email")
            .populate("course", "title");
        if (!updatedBatch) {
            return res
                .status(404)
                .json({ success: false, message: "Batch not found." });
        }
        return res.status(200).json({
            success: true,
            message: "Instructors assigned successfully.",
            data: updatedBatch,
        });
    }
    catch (error) {
        console.error("Error assigning instructors:", error);
        return res.status(500).json({ success: false, message: "Server error." });
    }
});
exports.assignInstructorsToBatch = assignInstructorsToBatch;
const unassignInstructorFromBatch = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { batchId, instructorId } = req.params;
        // Validate IDs
        if (!mongoose_1.Types.ObjectId.isValid(batchId)) {
            return res.status(400).json({ success: false, message: "Invalid batch ID." });
        }
        if (!mongoose_1.Types.ObjectId.isValid(instructorId)) {
            return res.status(400).json({ success: false, message: "Invalid instructor ID." });
        }
        // Find the batch first
        const batch = yield BatchModel_1.default.findById(batchId);
        if (!batch) {
            return res.status(404).json({ success: false, message: "Batch not found." });
        }
        // Check if instructor is actually assigned
        const isAssigned = batch.instructors.includes(new mongoose_1.Types.ObjectId(instructorId));
        if (!isAssigned) {
            return res.status(400).json({ success: false, message: "Instructor not assigned to this batch." });
        }
        // Remove instructor from the list
        batch.instructors = batch.instructors.filter((id) => id.toString() !== instructorId);
        yield batch.save();
        return res.status(200).json({
            success: true,
            message: "Instructor unassigned successfully.",
            // data: batch
        });
    }
    catch (error) {
        console.error("Error unassigning instructor:", error);
        return res.status(500).json({ success: false, message: "Server error." });
    }
});
exports.unassignInstructorFromBatch = unassignInstructorFromBatch;
const allInstructorInfo = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const instructors = yield UserModel_1.User.aggregate([
            { $match: { role: "instructor" } },
            {
                $lookup: {
                    from: "batches",
                    localField: "_id",
                    foreignField: "instructors",
                    as: "instructorBatches"
                }
            },
            {
                $unwind: {
                    path: "$instructorBatches",
                    preserveNullAndEmptyArrays: true
                }
            },
            {
                $lookup: {
                    from: "courses",
                    localField: "instructorBatches.course",
                    foreignField: "_id",
                    as: "instructorBatches.courseInfo"
                }
            },
            {
                $group: {
                    _id: "$_id",
                    name: { $first: "$name" },
                    email: { $first: "$email" },
                    isBlocked: { $first: "$isBlocked" },
                    phone: { $first: "$phone" },
                    userId: { $first: "$userId" },
                    gender: { $first: "$gender" },
                    district: { $first: "$district" },
                    batches: {
                        $push: {
                            $cond: [
                                { $ifNull: ["$instructorBatches", false] },
                                {
                                    batchId: "$instructorBatches._id",
                                    batchNo: "$instructorBatches.batchNo",
                                    courseName: { $arrayElemAt: ["$instructorBatches.courseInfo.title", 0] }
                                },
                                null
                            ]
                        }
                    }
                }
            },
            {
                $addFields: {
                    batches: {
                        $filter: {
                            input: "$batches",
                            as: "batch",
                            cond: { $ne: ["$$batch", null] }
                        }
                    },
                    batchCount: {
                        $size: {
                            $filter: {
                                input: "$batches",
                                as: "batch",
                                cond: { $ne: ["$$batch", null] }
                            }
                        }
                    }
                }
            },
            {
                $project: {
                    _id: 1,
                    name: 1,
                    email: 1,
                    phone: 1,
                    userId: 1,
                    isBlocked: 1,
                    gender: 1,
                    district: 1,
                    batchCount: 1,
                    batches: 1
                }
            },
            {
                $sort: { name: 1 }
            }
        ]);
        const totalInstructors = yield UserModel_1.User.countDocuments({ role: "instructor" });
        return res.status(200).json({
            success: true,
            message: "All instructor info retrieved successfully",
            data: {
                stats: {
                    totalInstructors,
                },
                instructors: instructors.map(instructor => ({
                    id: instructor._id,
                    name: instructor.name,
                    isBlocked: instructor.isBlocked,
                    email: instructor.email,
                    phone: instructor.phone,
                    regNo: instructor.userId,
                    gender: instructor.gender,
                    district: instructor.district,
                    batchCount: instructor.batchCount,
                    batches: instructor.batches
                }))
            },
        });
    }
    catch (error) {
        return res.status(500).json({
            success: false,
            message: "Error retrieving instructor info",
            error: error instanceof Error ? error.message : "Unknown error",
        });
    }
});
exports.allInstructorInfo = allInstructorInfo;
const getInstructorDetails = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { instructorId } = req.params;
        // Validate instructor ID
        if (!mongoose_1.Types.ObjectId.isValid(instructorId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid instructor ID."
            });
        }
        // Aggregation pipeline to get detailed instructor info
        const instructor = yield UserModel_1.User.aggregate([
            // Stage 1: Match the specific instructor
            {
                $match: {
                    _id: new mongoose_1.Types.ObjectId(instructorId),
                    role: "instructor"
                }
            },
            // Stage 2: Lookup batches assigned to this instructor
            {
                $lookup: {
                    from: "batches",
                    localField: "_id",
                    foreignField: "instructors",
                    as: "batches"
                }
            },
            // Stage 3: Unwind batches array to process each batch
            {
                $unwind: {
                    path: "$batches",
                    preserveNullAndEmptyArrays: true // Keep instructor even if no batches
                }
            },
            // Stage 4: Lookup course info for each batch
            {
                $lookup: {
                    from: "courses",
                    localField: "batches.course",
                    foreignField: "_id",
                    as: "batches.courseInfo"
                }
            },
            {
                $group: {
                    _id: "$_id",
                    name: { $first: "$name" },
                    email: { $first: "$email" },
                    phone: { $first: "$phone" },
                    userId: { $first: "$userId" },
                    address: { $first: "$address" },
                    country: { $first: "$country" },
                    gender: { $first: "$gender" },
                    district: { $first: "$district" },
                    batches: {
                        $push: {
                            $cond: [
                                { $ifNull: ["$batches", false] },
                                {
                                    batchId: "$batches._id",
                                    batchNo: "$batches.batchNo",
                                    batchName: "$batches.name",
                                    startDate: "$batches.startDate",
                                    endDate: "$batches.endDate",
                                    course: {
                                        $arrayElemAt: ["$batches.courseInfo", 0]
                                    }
                                },
                                null
                            ]
                        }
                    }
                }
            },
            // Stage 6: Filter out null batches and add count
            {
                $addFields: {
                    batches: {
                        $filter: {
                            input: "$batches",
                            as: "batch",
                            cond: { $ne: ["$$batch", null] }
                        }
                    },
                    batchCount: { $size: "$batches" }
                }
            },
            // Stage 7: Project final fields
            {
                $project: {
                    _id: 1,
                    name: 1,
                    email: 1,
                    phone: 1,
                    gender: 1,
                    district: 1,
                    userId: 1,
                    address: 1,
                    country: 1,
                    batchCount: 1,
                    batches: {
                        $map: {
                            input: "$batches",
                            as: "batch",
                            in: {
                                batchId: "$$batch.batchId",
                                batchNo: "$$batch.batchNo",
                                batchName: "$$batch.batchName",
                                startDate: "$$batch.startDate",
                                endDate: "$$batch.endDate",
                                courseId: "$$batch.course._id",
                                courseName: "$$batch.course.title",
                                courseCode: "$$batch.course.code"
                            }
                        }
                    }
                }
            }
        ]);
        // Check if instructor was found
        if (!instructor || instructor.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Instructor not found."
            });
        }
        // Return the formatted instructor data
        return res.status(200).json({
            success: true,
            message: "Instructor details retrieved successfully",
            data: instructor[0] // Since aggregate returns an array
        });
    }
    catch (error) {
        console.error("Error fetching instructor details:", error);
        return res.status(500).json({
            success: false,
            message: "Error retrieving instructor details",
            error: error instanceof Error ? error.message : "Unknown error",
        });
    }
});
exports.getInstructorDetails = getInstructorDetails;
const getAssignedCourses = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const instructorId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
        if (!instructorId || !mongoose_1.Types.ObjectId.isValid(instructorId)) {
            return res
                .status(401)
                .json({ success: false, message: "Unauthorized or invalid instructor." });
        }
        const instructorObjectId = new mongoose_1.Types.ObjectId(instructorId);
        // Find all batches where this instructor is assigned
        const batches = yield BatchModel_1.default.find({ instructors: instructorObjectId })
            .populate("course", "_id title code description")
            .sort({ batchNo: 1 })
            .lean();
        // Deduplicate courses and attach their batch list
        const courseMap = {};
        for (const batch of batches) {
            const course = batch.course;
            if (!course)
                continue;
            const cid = course._id.toString();
            if (!courseMap[cid]) {
                courseMap[cid] = {
                    courseId: cid,
                    title: course.title,
                    code: course.code,
                    description: course.description,
                    batches: [],
                };
            }
            courseMap[cid].batches.push({
                batchId: batch._id.toString(),
                batchNo: batch.batchNo,
                status: batch.status,
                startDate: batch.startDate,
                endDate: batch.endDate,
            });
        }
        const courses = Object.values(courseMap);
        return res.status(200).json({
            success: true,
            message: "Assigned courses retrieved successfully",
            data: {
                totalCourses: courses.length,
                totalBatches: batches.length,
                courses,
            },
        });
    }
    catch (error) {
        console.error("Error fetching assigned courses:", error);
        return res.status(500).json({
            success: false,
            message: "Error retrieving assigned courses",
            error: error instanceof Error ? error.message : "Unknown error",
        });
    }
});
exports.getAssignedCourses = getAssignedCourses;
const instructorDashboardStats = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    try {
        const instructorId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
        if (!instructorId) {
            return res.status(401).json({
                success: false,
                message: "Unauthorized access.",
            });
        }
        if (!mongoose_1.Types.ObjectId.isValid(instructorId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid instructor ID.",
            });
        }
        const instructorObjectId = new mongoose_1.Types.ObjectId(instructorId);
        const instructor = yield UserModel_1.User.findOne({
            _id: instructorObjectId,
            role: "instructor",
        }).select("_id name email userId");
        if (!instructor) {
            return res.status(404).json({
                success: false,
                message: "Instructor not found.",
            });
        }
        const assignedBatches = yield BatchModel_1.default.find({
            instructors: instructorObjectId,
        })
            .populate("course", "_id title code")
            .sort({ startDate: -1 });
        const totalAssignedBatches = assignedBatches.length;
        const activeBatches = assignedBatches.filter((batch) => batch.status === "active").length;
        const upcomingBatches = assignedBatches.filter((batch) => batch.status === "upcoming").length;
        const courseBatchPairs = assignedBatches
            .map((batch) => {
            var _a;
            const courseId = ((_a = batch.course) === null || _a === void 0 ? void 0 : _a._id) || batch.course;
            if (!courseId)
                return null;
            return { course: courseId, batch: batch.batchNo };
        })
            .filter((item) => Boolean(item));
        const courseIds = Array.from(new Set(courseBatchPairs.map((item) => item.course.toString()))).map((id) => new mongoose_1.Types.ObjectId(id));
        let totalStudents = 0;
        if (courseBatchPairs.length > 0) {
            const uniqueStudents = yield EnrollmentModel_1.Enrollment.aggregate([
                {
                    $match: {
                        status: "success",
                        $or: courseBatchPairs.map((pair) => ({
                            course: pair.course,
                            batch: pair.batch,
                        })),
                    },
                },
                {
                    $group: {
                        _id: "$user",
                    },
                },
                {
                    $count: "total",
                },
            ]);
            totalStudents = ((_b = uniqueStudents[0]) === null || _b === void 0 ? void 0 : _b.total) || 0;
        }
        const now = new Date();
        const [totalSessions, upcomingSessions, completedSessions] = yield Promise.all([
            SessionModel_1.Session.countDocuments({ instructor: instructorObjectId }),
            SessionModel_1.Session.countDocuments({
                instructor: instructorObjectId,
                status: "scheduled",
                sessionDate: { $gte: now },
            }),
            SessionModel_1.Session.countDocuments({
                instructor: instructorObjectId,
                status: "completed",
            }),
        ]);
        const [totalQuizSubmissions, totalAssignmentSubmissions] = yield Promise.all([
            courseBatchPairs.length > 0
                ? QuizModel_1.default.countDocuments({
                    $or: courseBatchPairs,
                })
                : 0,
            courseBatchPairs.length > 0
                ? AssignmentSubmission_1.AssignmentSubmission.countDocuments({
                    isSubmitted: true,
                    $or: courseBatchPairs,
                })
                : 0,
        ]);
        const upcomingSessionList = yield SessionModel_1.Session.find({
            instructor: instructorObjectId,
            sessionDate: { $gte: now },
            status: { $in: ["scheduled", "ongoing"] },
        })
            .select("title sessionDate duration status batchId")
            .sort({ sessionDate: 1 })
            .limit(5)
            .populate("batchId", "batchNo");
        return res.status(200).json({
            success: true,
            message: "Instructor dashboard stats retrieved successfully",
            data: {
                instructor: {
                    id: instructor._id,
                    name: instructor.name,
                    email: instructor.email,
                    userId: instructor.userId,
                },
                stats: {
                    totalAssignedBatches,
                    activeBatches,
                    upcomingBatches,
                    totalCourses: courseIds.length,
                    totalStudents,
                    totalSessions,
                    upcomingSessions,
                    completedSessions,
                    totalQuizSubmissions,
                    totalAssignmentSubmissions,
                },
                upcomingSessions: upcomingSessionList,
            },
        });
    }
    catch (error) {
        console.error("Error fetching instructor dashboard stats:", error);
        return res.status(500).json({
            success: false,
            message: "Error retrieving instructor dashboard stats",
            error: error instanceof Error ? error.message : "Unknown error",
        });
    }
});
exports.instructorDashboardStats = instructorDashboardStats;
