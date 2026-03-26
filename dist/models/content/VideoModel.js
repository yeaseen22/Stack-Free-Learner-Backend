"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const videoSchema = new mongoose_1.Schema({
    title: { type: String, required: true },
    videoId: { type: String, required: false },
    thumbnail: { type: String, required: false },
    url: { type: String, required: false },
});
const assignmentSchema = new mongoose_1.Schema({
    title: { type: String, required: true },
    description: { type: String },
    submissionDate: { type: Date },
});
const singleQuestionSchema = new mongoose_1.Schema({
    question: { type: String, required: true },
    options: [{ type: String, required: true }],
    correctAnswer: { type: String, required: true },
});
const quizSchema = new mongoose_1.Schema({
    title: { type: String },
    questions: [singleQuestionSchema],
    submissionDate: { type: Date, required: true },
});
const moduleContentSchema = new mongoose_1.Schema({
    moduleId: { type: mongoose_1.Schema.Types.ObjectId, ref: "Module", required: true },
    videos: [videoSchema],
    assignments: [assignmentSchema],
    quizzes: [quizSchema],
    isCompleted: { type: Boolean, default: false },
}, { timestamps: true });
const ModuleContent = (0, mongoose_1.model)("ModuleContent", moduleContentSchema);
exports.default = ModuleContent;
