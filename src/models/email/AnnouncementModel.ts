import mongoose, { Schema } from "mongoose";
import { IAnnouncement } from "../../interfaces/email/emailAnnouncementInterface";

const AnnouncementSchema: Schema<IAnnouncement> = new Schema({
  course: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Course",
    required: true,
  },
  batch: {
    type: String,
    required: true,
  },
  announcementTitle: {
    type: String,
    required: true,
  },
  announcementContent: {
    type: String,
    required: true,
  },
  instructorName: {
    type: String,
    default: "Course Instructor",
  },
  recipients: [
    {
      email: { type: String, required: true },
      name: { type: String, required: true },
      success: { type: Boolean, default: true },
      error: { type: String },
    },
  ],
  totalRecipients: {
    type: Number,
    required: true,
  },
  successful: {
    type: Number,
    required: true,
  },
  failed: {
    type: Number,
    required: true,
  },
  date: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.model<IAnnouncement>(
  "Announcement",
  AnnouncementSchema
);
