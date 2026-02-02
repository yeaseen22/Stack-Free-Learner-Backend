import mongoose, { model, Schema } from "mongoose";
import { IDeviceTracker } from "../../interfaces/auth/IDeviceTrackerInterface";

const deviceTrackerSchema = new Schema<IDeviceTracker>({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  ipAddress: {
    type: String,
    required: true,
  },
  deviceType: {
    type: String,
    enum: ["mobile", "tablet", "desktop", "unknown"],
    default: "unknown",
  },
  os: {
    type: String,
  },
  browser: {
    type: String,
  },
  loginTime: {
    type: Date,
    default: Date.now,
  },
});

const DeviceTracker = model<IDeviceTracker>(
  "DeviceTracker",
  deviceTrackerSchema
);
export default DeviceTracker;
