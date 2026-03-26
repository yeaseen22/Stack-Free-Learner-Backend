"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.Session = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const materialSchema = new mongoose_1.Schema({
    title: {
        type: String,
        required: true,
    },
    url: {
        type: String,
        required: true,
    },
    type: {
        type: String,
        enum: ["pdf", "video", "link", "document"],
        required: true,
    },
});
const sessionSchema = new mongoose_1.Schema({
    batchId: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: "Batch",
        required: true,
    },
    title: {
        type: String,
        required: true,
        trim: true,
    },
    description: {
        type: String,
        trim: true,
    },
    sessionType: {
        type: String,
        enum: ["live", "recorded", "conceptual", "practical"],
        default: "live",
    },
    sessionDate: {
        type: Date,
        required: true,
    },
    duration: {
        type: Number,
        required: true,
    },
    meetingLink: {
        type: String,
        trim: true,
    },
    instructor: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    materials: [materialSchema],
    status: {
        type: String,
        enum: ["scheduled", "ongoing", "completed", "cancelled"],
        default: "scheduled",
    },
    recordingLink: {
        type: String,
        trim: true,
    },
}, {
    timestamps: true,
});
// Index for faster queries
sessionSchema.index({ batchId: 1, sessionDate: -1 });
sessionSchema.index({ status: 1 });
exports.Session = (0, mongoose_1.model)("Session", sessionSchema);
