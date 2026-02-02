import { Request, Response } from "express";
import streamifier from "streamifier";
import cloudinary from "../../utils/cloudinary";
import ModuleContent from "../../models/content/VideoModel";


export const uploadVideo = async (
  req: Request,
  res: Response
): Promise<any> => {
  const { title, courseId, isFree, order } = req.body;
  const file = req.file;

  if (!file) {
    return res.status(400).json({ error: "No video file uploaded" });
  }

  try {
    const uploadToCloudinary = (): Promise<any> => {
      return new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          {
            resource_type: "video",
            folder: "learnxpress/videos",
          },
          (error, result) => {
            if (error) return reject(error);
            resolve(result);
          }
        );
        streamifier.createReadStream(file.buffer).pipe(stream);
      });
    };

    const result = await uploadToCloudinary();

    const newVideo = new ModuleContent({
      title,
      courseId,
      url: result.secure_url,
      isFree: isFree ?? false,
      order: order ? Number(order) : undefined,
    });

    await newVideo.save();

    return res.status(201).json({
      message: "Video uploaded & saved successfully",
      video: newVideo,
    });
  } catch (error: any) {
    return res.status(500).json({
      error: "Video upload failed",
      details: error?.message || "Unknown error",
    });
  }
};
