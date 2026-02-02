"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Enrollment = void 0;
const mongoose_1 = require("mongoose");
const enrollmentSchema = new mongoose_1.Schema({
    user: { type: mongoose_1.Schema.Types.ObjectId, ref: "User", required: true },
    course: { type: mongoose_1.Schema.Types.ObjectId, ref: "Course", required: true },
    status: {
        type: String,
        enum: ["pending", "success", "failed"],
        default: "pending",
    },
    payment_method: {
        type: String,
        enum: ["manual", "sslcommerz"],
        default: "sslcommerz",
    },
    amount: { type: Number },
    batch: { type: Number },
    student_name: { type: String },
    transactionId: { type: String, unique: true },
    isComplete: { type: Boolean, default: false },
    enrolledAt: { type: Date, default: Date.now },
});
enrollmentSchema.index({ user: 1, course: 1, batch: 1 }, { unique: true });
exports.Enrollment = (0, mongoose_1.model)("Enrollment", enrollmentSchema);
