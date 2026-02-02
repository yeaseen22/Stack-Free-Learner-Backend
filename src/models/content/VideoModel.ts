import mongoose, { Schema, model } from "mongoose";
import { IAssignment, IQuiz, IVideo, Videos } from "../../interfaces/content/videoInterface";


const videoSchema = new Schema<Videos>({
  title: { type: String, required: true },
  url: { type: String, required: true },
});

const assignmentSchema = new Schema<IAssignment>({
  title: { type: String, required: true },
  description: { type: String },
  submissionDate: { type: Date },
});


const singleQuestionSchema = new Schema({
  question: { type: String, required: true },
  options: [{ type: String, required: true }],
  correctAnswer: { type: String, required: true },
});

const quizSchema = new Schema<IQuiz>({
  title:{type: String},
  questions: [singleQuestionSchema],
  submissionDate: { type: Date, required: true },
});

const moduleContentSchema = new Schema<IVideo>(
  {
    moduleId: { type: Schema.Types.ObjectId, ref: "Module", required: true },
    videos: [videoSchema],
    assignments: [assignmentSchema],
    quizzes: [quizSchema],
    isCompleted: { type: Boolean, default: false },
  },
  { timestamps: true }
);

const ModuleContent = model("ModuleContent", moduleContentSchema);
export default ModuleContent;
