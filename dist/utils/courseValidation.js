"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.courseValidationSchema = void 0;
// utils/validation/courseValidation.ts
const joi_1 = __importDefault(require("joi"));
exports.courseValidationSchema = joi_1.default.object({
    title: joi_1.default.string().required(),
    description: joi_1.default.string().allow(''),
    thumbnail: joi_1.default.string().uri().allow(''),
    price: joi_1.default.number().min(0).required(),
    isPaid: joi_1.default.boolean().default(true),
    coursePlan: joi_1.default.string().allow(''),
    discount: joi_1.default.string().allow(''),
    category: joi_1.default.string().allow(''),
    level: joi_1.default.string()
        .valid('Beginner', 'Intermediate', 'Advanced')
        .default('Beginner'),
    batch: joi_1.default.number().default(0),
    duration: joi_1.default.number().default(0),
    hasCertificate: joi_1.default.boolean().default(false),
    features: joi_1.default.array().items(joi_1.default.object()).default([]),
    milestones: joi_1.default.array().items(joi_1.default.string()).default([]),
    createdBy: joi_1.default.string().required(),
    isPublished: joi_1.default.boolean().default(false),
    status: joi_1.default.string().valid('draft', 'published', 'archived').default('draft'),
});
