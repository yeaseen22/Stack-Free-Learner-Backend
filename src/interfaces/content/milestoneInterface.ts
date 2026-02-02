import { Types } from "mongoose";

export interface IMilestone {
  _id?: Types.ObjectId;
  courseId: Types.ObjectId;
  title: string;
  order?: number;
  duration: number;
  modules: Types.ObjectId[];
  createdAt?: Date;
  updatedAt?: Date;
}
