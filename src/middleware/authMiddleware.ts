import type { Request, Response, NextFunction } from "express";
import { verifyToken } from "../utils/jwt";

export const authenticate = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const accessToken = req.cookies.accessToken;

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