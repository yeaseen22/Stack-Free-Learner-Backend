import mongoose from "mongoose";

export interface IAnnouncement extends Document {
  course: mongoose.Types.ObjectId;
  courseName: string;
  batch: string;
  announcementTitle: string;
  announcementContent: string;
  instructorName: string;
  recipients: {
    email: string;
    name: string;
    success: boolean;
    error?: string;
  }[];
  totalRecipients: number; 
  successful: number;      
  failed: number;
  date: Date;
}

type TEmailSuccess = {
  success: true;
  email: string;
};

type TEmailFailure = {
  success: false;
  email: string;
  error: any;
};

export type TEmailResult = TEmailSuccess | TEmailFailure;
