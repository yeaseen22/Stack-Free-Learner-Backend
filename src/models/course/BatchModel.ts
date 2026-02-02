import mongoose, { Schema } from "mongoose";
import { IBatch } from "../../interfaces/course/batchInterface";

const batchSchema = new mongoose.Schema<IBatch>({
  course: {
    type: Schema.Types.ObjectId,
    ref: "Course",
    required: true,
  },
  batchNo: { type: Number, required: true },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  orientationDate: { type: Date, required: true },
  classStartDate: { type: Date, required: true },
  enrolledStudents: [{ type: Schema.Types.ObjectId, ref: "Enrollment" }],
  instructors: [
    {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  ],
  status: {
    type: String,
    enum: ["active", "completed", "upcoming"],
    default: "upcoming",
  },
});

const Batch = mongoose.model("Batch", batchSchema);
export default Batch;
