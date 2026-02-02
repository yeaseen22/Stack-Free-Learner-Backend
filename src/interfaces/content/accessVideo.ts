import { Types } from "mongoose";

export interface IUnlockedContent {
  userId: Types.ObjectId;
  courseId: Types.ObjectId;
  contentId: Types.ObjectId;
  contentType: "video" | "assignment" | "quiz";
  unlockedAt?: Date;
}
