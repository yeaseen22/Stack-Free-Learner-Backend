import { Types } from "mongoose";

export interface IDeviceTracker {
  userId: Types.ObjectId;
  ipAddress: string;
  deviceType: "mobile" | "tablet" | "desktop" | "unknown";
  os: string;
  browser: string;
  loginTime: Date;
}
