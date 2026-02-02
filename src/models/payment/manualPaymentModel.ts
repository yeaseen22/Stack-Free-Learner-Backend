import { Schema, model } from "mongoose";
import { IManualPaymentInfo } from "../../interfaces/payment/manualPaymentInterface";

const manualPaymentSchema = new Schema<IManualPaymentInfo>({
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
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  course: {
    type: Schema.Types.ObjectId,
    ref: "Course",
    required: true,
  },
  batchNo: {
    type: Number,
    required: true,
  },
  enrolledAt: { type: Date, default: Date.now },
});

export const ManualPayment = model<IManualPaymentInfo>(
  "ManualPayment",
  manualPaymentSchema
);
