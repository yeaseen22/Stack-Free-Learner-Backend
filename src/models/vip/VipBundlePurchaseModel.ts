import { Schema, model } from "mongoose";

const vipBundlePurchaseSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true, unique: true },
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
    assignedBy: { type: Schema.Types.ObjectId, ref: "User" },
    approvedBy: { type: Schema.Types.ObjectId, ref: "User" },
    approvedAt: { type: Date },
    rejectedBy: { type: Schema.Types.ObjectId, ref: "User" },
    rejectedAt: { type: Date },
    rejectionReason: { type: String },
  },
  { timestamps: true }
);

export const VipBundlePurchase = model("VipBundlePurchase", vipBundlePurchaseSchema);
