import mongoose, { Schema, model } from "mongoose";
import { ISession } from "../../interfaces/session/sessionInterface";

const materialSchema = new Schema({
  title: {
    type: String,
    required: true,
  },
  url: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    enum: ["pdf", "video", "link", "document"],
    required: true,
  },
});

const sessionSchema = new Schema<ISession>(
  {
    batchId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Batch",
      required: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    sessionType: {
      type: String,
      enum: ["live", "recorded", "conceptual", "practical"],
      default: "live",
    },
    sessionDate: {
      type: Date,
      required: true,
    },
    duration: {
      type: Number,
      required: true,
    },
    meetingLink: {
      type: String,
      trim: true,
    },
    instructor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    materials: [materialSchema],
    status: {
      type: String,
      enum: ["scheduled", "ongoing", "completed", "cancelled"],
      default: "scheduled",
    },
    recordingLink: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

// Index for faster queries
sessionSchema.index({ batchId: 1, sessionDate: -1 });
sessionSchema.index({ status: 1 });

export const Session = model<ISession>("Session", sessionSchema);
