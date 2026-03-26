"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Course = void 0;
const mongoose_1 = require("mongoose");
const FeaturesSchema = new mongoose_1.Schema({
    icon: String,
    title: String,
    description: String,
});
const courseSchema = new mongoose_1.Schema({
    title: { type: String, required: true },
    slug: { type: String, required: true },
    description: { type: String },
    thumbnail: { type: String },
    price: { type: Number, required: true },
    oldPrice: { type: Number, required: true },
    isPaid: { type: Boolean, default: true },
    coursePlan: { type: String },
    discount: { type: String },
    category: { type: String },
    level: {
        type: String,
        enum: ['Beginner', 'Intermediate', 'Advanced'],
        default: 'Beginner',
    },
    batchData: [{ type: mongoose_1.Schema.Types.ObjectId, ref: 'Batch' }],
    duration: { type: Number },
    hasCertificate: { type: Boolean, default: false },
    rating: { type: Number, default: 0 },
    reviewCount: { type: Number, default: 0 },
    reviews: [{ type: mongoose_1.Schema.Types.ObjectId, ref: 'Review' }],
    features: [FeaturesSchema],
    milestones: [{ type: mongoose_1.Schema.Types.ObjectId, ref: 'Milestone' }],
    createdBy: { type: mongoose_1.Schema.Types.ObjectId, ref: 'User' },
    isPublished: { type: Boolean, default: false },
    status: {
        type: String,
        enum: ['draft', 'published', 'archived'],
        default: 'draft',
    },
    enrolledCount: { type: Number, default: 0 },
});
exports.Course = (0, mongoose_1.model)('Course', courseSchema);
