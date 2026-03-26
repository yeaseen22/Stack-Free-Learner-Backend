"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadFileToCloudinary = void 0;
const streamifier_1 = __importDefault(require("streamifier"));
const cloudinary_1 = __importDefault(require("./cloudinary"));
const uploadFileToCloudinary = (buffer, resourceType) => {
    return new Promise((resolve, reject) => {
        const stream = cloudinary_1.default.uploader.upload_stream({
            resource_type: resourceType,
            folder: "modules",
        }, (error, result) => {
            if (error || !(result === null || result === void 0 ? void 0 : result.secure_url)) {
                console.error("❌ Cloudinary upload failed:", error);
                return reject(error);
            }
            resolve(result.secure_url);
        });
        streamifier_1.default.createReadStream(buffer).pipe(stream);
    });
};
exports.uploadFileToCloudinary = uploadFileToCloudinary;
