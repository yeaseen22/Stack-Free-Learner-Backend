import {  Types } from "mongoose";

export interface Videos {
  title: string;
  url: string;
}

export interface IAssignment {
  title: string;
  description?: string;
  submissionDate: Date;
}

export interface SingleQuestion {
  question: string;
  options: string[];
  correctAnswer: string;
}

export interface QuizQuestion {
  question: string;
  options: string[];
  correctAnswer: string;
}

export interface IQuiz {
  title: string, 
  questions: SingleQuestion[];
  submissionDate: Date;
}

export interface IVideo {
  moduleId: Types.ObjectId;
  videos: Videos[];
  isCompleted: boolean;
  assignments: IAssignment[];
  quizzes: IQuiz[];
}
