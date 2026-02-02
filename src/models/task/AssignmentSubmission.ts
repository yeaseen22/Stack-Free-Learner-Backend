import mongoose, { Schema } from "mongoose";
import { IAssignmentSubmission } from "../../interfaces/task/assignmentSubmission";

const AssignmentSubmissionSchema: Schema = new Schema<IAssignmentSubmission>({
  assignmentNo: {
    type: Number,
    required: true,
  },
  assignmentTitle: {
    type: String,
    required: true,
  },
  submissionLink: {
    type: String,
    required: true,
  },
  assignmentId:{
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: "Assignment",
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: "User",
  },
  batch: {
    type: Number,
    required: true,
  },
  course: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: "Course"
  },
  submittedAt: {
    type: Date,
    default: Date.now,
  },
  isSubmitted: {
    type: Boolean,
    default: false,
  },
  mark: {
    type: Number,
    default: 0,
  },
});

export const AssignmentSubmission = mongoose.model<IAssignmentSubmission>(
  "AssignmentSubmission",
  AssignmentSubmissionSchema
);
