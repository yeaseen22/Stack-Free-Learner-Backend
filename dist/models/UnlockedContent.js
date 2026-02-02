"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const unlockedContentSchema = new mongoose_1.Schema({
    userId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    courseId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "Course",
        required: true,
    },
    batch: {
        type: Number,
    },
    unlockedContents: [
        {
            type: mongoose_1.Schema.Types.ObjectId,
            required: true,
        },
    ],
}, {
    timestamps: true,
});
unlockedContentSchema.index({ userId: 1, courseId: 1, batch: 1 }, { unique: true });
const UnlockedContent = (0, mongoose_1.model)("UnlockedContent", unlockedContentSchema);
exports.default = UnlockedContent;
