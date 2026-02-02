// src/middlewares/upload.ts

import multer from "multer";
import { Request } from "express";

const storage = multer.memoryStorage();

const fileFilter = (
  req: Request,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback
) => {
  const allowedTypes = [
    "video/mp4",
    "video/x-matroska",
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  ];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Unsupported file type"));
  }
};

const multerInstance = multer({
  storage,
  fileFilter,
  limits: { fileSize: 1024 * 1024 * 1000 },
});

export const uploadSingleVideo = multerInstance.single("file");
export const uploadMultipleVideos = multerInstance.array("file", 10);
