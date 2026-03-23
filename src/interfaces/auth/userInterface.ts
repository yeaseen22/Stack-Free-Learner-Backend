import { Schema, Types } from "mongoose";

export interface IBatchPerformance {
  course: Types.ObjectId | string ,
  batch: number;
  progress: number;
  startedAt: Date;
  stone: number;
  quiz: number[];
  assignment: number[];
  totalMark: number;
  profileType?: string;
  isUnlock?: boolean;
}

export type UserRole = "admin" | "instructor" | "student";

export interface IUser {
 _id: Types.ObjectId;
  name: string;
  email: string;
  password: string;
  phone: string;
  country: string;
  profileImage: string;
  district: string;
  address: string;
  isBlocked?: boolean;
  gender: string;
  userId: string;
  enrolledCourses: Schema.Types.ObjectId[];
  role?: UserRole;
  isVipStudent?: boolean;
  batchWisePerformance?: IBatchPerformance[];
  // New instructor-specific fields
  specialization?: string;
  qualifications?: string[];
}
