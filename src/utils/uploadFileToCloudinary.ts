import  streamifier  from 'streamifier';
import cloudinary from './cloudinary';



export const uploadFileToCloudinary = (
  buffer: Buffer,
  resourceType: "video" | "raw"
): Promise<string> => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        resource_type: resourceType,
        folder: "modules",
      },
      (error, result) => {
        if (error || !result?.secure_url) {
          console.error("❌ Cloudinary upload failed:", error);
          return reject(error);
        }
        resolve(result.secure_url);
      }
    );

    streamifier.createReadStream(buffer).pipe(stream);
  });
};
