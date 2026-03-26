"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.VipBundleConfig = void 0;
const mongoose_1 = require("mongoose");
const vipBundleConfigSchema = new mongoose_1.Schema({
    bundleKey: {
        type: String,
        required: true,
        default: "VIP_STUDENT_BUNDLE",
        unique: true,
    },
    title: { type: String, default: "VIP Student Bundle" },
    description: { type: String, default: "Access to all courses and all batches" },
    price: { type: Number, required: true, min: 0 },
    currency: { type: String, default: "BDT" },
    isActive: { type: Boolean, default: true },
    updatedBy: { type: mongoose_1.Schema.Types.ObjectId, ref: "User", required: true },
}, { timestamps: true });
exports.VipBundleConfig = (0, mongoose_1.model)("VipBundleConfig", vipBundleConfigSchema);
