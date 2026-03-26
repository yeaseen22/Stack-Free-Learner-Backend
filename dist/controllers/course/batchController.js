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
exports.deleteBatch = exports.updateBatch = exports.getBatchById = exports.getAllBatches = exports.createBatch = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const BatchModel_1 = __importDefault(require("../../models/course/BatchModel"));
const CourseModel_1 = require("../../models/course/CourseModel");
// ✅ Create a new batch
const createBatch = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { course, batchNo, startDate, endDate, status, orientationDate, classStartDate, enrolledStudents, } = req.body;
        const newBatch = new BatchModel_1.default({
            course,
            batchNo,
            startDate,
            endDate,
            orientationDate,
            classStartDate,
            status,
            enrolledStudents,
        });
        const savedBatch = yield newBatch.save();
        // ✅ Update Course's batchData array with new batch ID
        yield CourseModel_1.Course.findByIdAndUpdate(course, { $push: { batchData: savedBatch._id } }, { new: true, useFindAndModify: false });
        res.status(201).json({
            success: true,
            message: "Batch created and course updated successfully",
            data: savedBatch,
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: "Batch creation failed",
            error: error.message,
        });
    }
});
exports.createBatch = createBatch;
// ✅ Get all batches
const getAllBatches = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const batches = yield BatchModel_1.default.find()
            .populate("course")
            .populate("enrolledStudents");
        res.status(200).json({
            success: true,
            message: "All batches fetched successfully",
            batches
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to fetch batches",
            error: error.message,
        });
    }
});
exports.getAllBatches = getAllBatches;
// ✅ Get single batch by ID
const getBatchById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        if (!mongoose_1.default.Types.ObjectId.isValid(id)) {
            res.status(400).json({
                success: false,
                message: "Invalid batch ID",
            });
            return;
        }
        const batch = yield BatchModel_1.default.findById(id)
            .populate("course")
            .populate("enrolledStudents");
        if (!batch) {
            res.status(404).json({
                success: false,
                message: "Batch not found",
            });
            return;
        }
        res.status(200).json({
            success: true,
            message: "Batch fetched successfully",
            data: batch,
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to fetch batch",
            error: error.message,
        });
    }
});
exports.getBatchById = getBatchById;
// ✅ Update a batch
const updateBatch = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        if (!mongoose_1.default.Types.ObjectId.isValid(id)) {
            res.status(400).json({
                success: false,
                message: "Invalid batch ID",
            });
            return;
        }
        const updatedBatch = yield BatchModel_1.default.findByIdAndUpdate(id, req.body, {
            new: true,
            runValidators: true,
        });
        if (!updatedBatch) {
            res.status(404).json({
                success: false,
                message: "Batch not found",
            });
            return;
        }
        res.status(200).json({
            success: true,
            message: "Batch updated successfully",
            data: updatedBatch,
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to update batch",
            error: error.message,
        });
    }
});
exports.updateBatch = updateBatch;
// ✅ Delete a batch
const deleteBatch = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        if (!mongoose_1.default.Types.ObjectId.isValid(id)) {
            res.status(400).json({
                success: false,
                message: "Invalid batch ID",
            });
            return;
        }
        const deletedBatch = yield BatchModel_1.default.findByIdAndDelete(id);
        if (!deletedBatch) {
            res.status(404).json({
                success: false,
                message: "Batch not found",
            });
            return;
        }
        res.status(200).json({
            success: true,
            message: "Batch deleted successfully",
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to delete batch",
            error: error.message,
        });
    }
});
exports.deleteBatch = deleteBatch;
