import type { Request, Response, NextFunction } from "express";
import { verifyToken } from "../utils/jwt";

export const authenticate = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // Check for token in cookies first
  let accessToken = req.cookies.accessToken;

  // If not in cookies, check Authorization header
  if (!accessToken) {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      accessToken = authHeader.substring(7); // Remove 'Bearer ' prefix
    }
  }

  if (!accessToken) {
   res.status(401).json({ message: "No access token provided" });
   return
  }

  const decoded = verifyToken(accessToken, "access");

  if (!decoded) {
   res.status(403).json({ message: "Invalid or expired access token" });
   return
  }

  req.user = decoded;
  next();
};