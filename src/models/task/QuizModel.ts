import mongoose, { model, Schema } from "mongoose";
import { IQuizSubmission } from "../../interfaces/task/quizSubmission";

const quizSubmissionSchema = new Schema<IQuizSubmission>({
  quizId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: "Quiz",
  },
  quizTitle: {
    type: String,
    required: true,
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: "User",
  },
  course: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: "Course",
  },
  batch: {
    type: Number,
    required: true,
  },
  answers: {
    type: Map,
    of: String,
    required: true,
  },
  correctAnswers: {
    type: Number,
    required: true,
  },
  totalQuestions: {
    type: Number,
    required: true,
  },
  score: {
    type: Number,
    required: true,
  },
  submittedAt: {
    type: Date,
    default: Date.now,
  },
});

const QuizSubmission = model("QuizSubmission", quizSubmissionSchema);
export default QuizSubmission;
