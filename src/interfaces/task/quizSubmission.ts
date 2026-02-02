import { Types } from "mongoose";

export interface IQuizSubmission {
  courseName: string;
  studentName: string;
  quizId: Types.ObjectId;
  quizTitle: string;
  user: Types.ObjectId;
  course: Types.ObjectId;
  batch: number;
  answers: {
    [questionId: string]: string;
  };
  correctAnswers: number;
  totalQuestions: number;
  score: number;
  submittedAt: Date;
}

export interface PopulatedCourse {
  _id: Types.ObjectId;
  title: string;
}

export interface PopulatedSubmission {
  _id: Types.ObjectId;
  course: PopulatedCourse;
  user: Types.ObjectId;
  quizTitle: string;
  batch: number;
  answers: Record<string, string>;
  correctAnswers: number;
  totalQuestions: number;
  score: number;
  submittedAt: Date;
}

export interface IPopulatedSubmission {
  user: {
    _id: string;
    name: string;
  };
  course: {
    _id: string;
    title: string;
  };
  batch: number;
  score: number;
  totalQuestions: number;
}

export type TLeaderboardEntry = {
  name: string;
  courseName: string;
  batch: number;
  totalScore: number;
  totalMarks: number;
  percentage: number;
};
