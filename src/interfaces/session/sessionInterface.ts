import { Document, Types } from "mongoose";

export interface IMaterial {
  title: string;
  url: string;
  type: "pdf" | "video" | "link" | "document";
}

export interface ISession extends Document {
  batchId: Types.ObjectId;
  title: string;
  description?: string;
  sessionType: "live" | "recorded" | "conceptual" | "practical";
  sessionDate: Date;
  duration: number; // in minutes
  meetingLink?: string;
  instructor: Types.ObjectId;
  materials?: IMaterial[];
  status: "scheduled" | "ongoing" | "completed" | "cancelled";
  recordingLink?: string;
  createdAt: Date;
  updatedAt: Date;
}
