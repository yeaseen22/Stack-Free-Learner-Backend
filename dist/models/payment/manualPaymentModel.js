"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ManualPayment = void 0;
const mongoose_1 = require("mongoose");
const manualPaymentSchema = new mongoose_1.Schema({
    paymentPhoneNumber: {
        type: String,
        required: true,
    },
    transactionId: {
        type: String,
        required: true,
    },
    amount: {
        type: Number,
        required: true,
    },
    method: {
        type: String,
        enum: ["bkash", "nagad", "rocket"],
        // required: true,
    },
    status: {
        type: String,
        enum: ["pending", "approved", "rejected"],
        default: "pending",
    },
    user: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    course: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "Course",
        required: true,
    },
    batchNo: {
        type: Number,
        required: true,
    },
    enrolledAt: { type: Date, default: Date.now },
});
exports.ManualPayment = (0, mongoose_1.model)("ManualPayment", manualPaymentSchema);
