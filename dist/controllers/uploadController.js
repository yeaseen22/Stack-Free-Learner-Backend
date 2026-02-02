"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadVideo = void 0;
const streamifier_1 = __importDefault(require("streamifier"));
const cloudinary_1 = __importDefault(require("../utils/cloudinary"));
const VideoModel_1 = __importDefault(require("../models/VideoModel"));
const uploadVideo = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { title, courseId, isFree, order } = req.body;
    const file = req.file;
    if (!file) {
        return res.status(400).json({ error: "No video file uploaded" });
    }
    try {
        const uploadToCloudinary = () => {
            return new Promise((resolve, reject) => {
                const stream = cloudinary_1.default.uploader.upload_stream({
                    resource_type: "video",
                    folder: "learnxpress/videos",
                }, (error, result) => {
                    if (error)
                        return reject(error);
                    resolve(result);
                });
                streamifier_1.default.createReadStream(file.buffer).pipe(stream);
            });
        };
        const result = yield uploadToCloudinary();
        const newVideo = new VideoModel_1.default({
            title,
            courseId,
            url: result.secure_url,
            isFree: isFree !== null && isFree !== void 0 ? isFree : false,
            order: order ? Number(order) : undefined,
        });
        yield newVideo.save();
        return res.status(201).json({
            message: "Video uploaded & saved successfully",
            video: newVideo,
        });
    }
    catch (error) {
        return res.status(500).json({
            error: "Video upload failed",
            details: (error === null || error === void 0 ? void 0 : error.message) || "Unknown error",
        });
    }
});
exports.uploadVideo = uploadVideo;
