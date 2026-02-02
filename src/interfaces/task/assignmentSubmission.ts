import { PopulatedDoc, Types } from "mongoose";

export interface ICourse {
  _id: Types.ObjectId;
  title: string;
}

export interface IAssignmentSubmission extends Document {
  assignmentNo: number;
  assignmentTitle: string;
  submissionLink: string;
  user: Types.ObjectId;
  assignmentId: Types.ObjectId;
  batch: number;
  course: Types.ObjectId | PopulatedDoc<ICourse>;
  submittedAt: Date;
  isSubmitted: boolean;
  mark?: number;
}