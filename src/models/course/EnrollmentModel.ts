import { Schema, model } from "mongoose";
import { IEnrollment } from "../../interfaces/course/entrollmentInterface";

const enrollmentSchema = new Schema<IEnrollment>({
  user: { type: Schema.Types.ObjectId, ref: "User", required: true },
  course: { type: Schema.Types.ObjectId, ref: "Course", required: true },
  status: {
    type: String,
    enum: ["pending", "success", "failed"],
    default: "pending",
  },
  payment_method: {
    type: String,
    enum: ["bkash", "nagad", "rocket", "sslcommerz"],
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

export const Enrollment = model<IEnrollment>("Enrollment", enrollmentSchema);
