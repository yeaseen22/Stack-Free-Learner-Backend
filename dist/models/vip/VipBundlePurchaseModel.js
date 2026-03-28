"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.VipBundlePurchase = void 0;
const mongoose_1 = require("mongoose");
const vipBundlePurchaseSchema = new mongoose_1.Schema({
    user: { type: mongoose_1.Schema.Types.ObjectId, ref: "User", required: true, unique: true },
    amount: { type: Number, required: true, min: 0 },
    currency: { type: String, default: "BDT" },
    status: {
        type: String,
        enum: ["pending", "success", "admin-assigned", "rejected", "revoked"],
        default: "pending",
    },
    paymentMethod: { type: String, default: "manual" },
    transactionId: { type: String },
    paymentReference: { type: String },
    paymentScreenshot: { type: String },
    purchasedAt: { type: Date, default: Date.now },
    assignedBy: { type: mongoose_1.Schema.Types.ObjectId, ref: "User" },
    approvedBy: { type: mongoose_1.Schema.Types.ObjectId, ref: "User" },
    approvedAt: { type: Date },
    rejectedBy: { type: mongoose_1.Schema.Types.ObjectId, ref: "User" },
    rejectedAt: { type: Date },
    rejectionReason: { type: String },
}, { timestamps: true });
exports.VipBundlePurchase = (0, mongoose_1.model)("VipBundlePurchase", vipBundlePurchaseSchema);
