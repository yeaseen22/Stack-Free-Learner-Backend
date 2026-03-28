import { Schema, model } from "mongoose";

const vipBundleConfigSchema = new Schema(
  {
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
    updatedBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true }
);

export const VipBundleConfig = model("VipBundleConfig", vipBundleConfigSchema);
