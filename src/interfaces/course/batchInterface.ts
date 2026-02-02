import { Types } from "mongoose";

export interface IBatch {
  _id?: Types.ObjectId;
  course: Types.ObjectId;
  batchNo: number;
  startDate: Date;
  endDate: Date;
  orientationDate: Date;
  classStartDate: Date;
  enrolledStudents: Types.ObjectId[];
  instructors: Types.ObjectId[];
  status: "active" | "completed" | "upcoming";
}
