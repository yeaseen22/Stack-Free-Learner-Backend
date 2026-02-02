import * as UAParser from "ua-parser-js";

import DeviceTracker from "../models/auth/DeviceTrackerSchema";
import { Request, Response } from "express";

export const trackDevice = async (userId: string, req: any): Promise<void> => {
  const ipAddress = (
    req.headers["x-forwarded-for"] ||
    req.socket.remoteAddress ||
    ""
  ).toString();

  // ✅ Updated parser instance creation
  const parser = new UAParser.UAParser(req.headers["user-agent"]);
  const ua = parser.getResult();

  const deviceType = ua.device.type || "desktop";
  const os = ua.os.name || "unknown";
  const browser = ua.browser.name || "unknown";

  await DeviceTracker.create({
    userId,
    ipAddress,
    deviceType,
    os,
    browser,
    loginTime: new Date(),
  });
};

export const getDeviceHistory = async (
  req: Request,
  res: Response
): Promise<any> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(400).json({ message: "User ID not found in token" });
    }

    const deviceHistory = await DeviceTracker.find({ userId }).sort({
      loginTime: -1,
    });
    return res.status(200).json({ devices: deviceHistory });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Failed to fetch device history", error: error });
  }
};
