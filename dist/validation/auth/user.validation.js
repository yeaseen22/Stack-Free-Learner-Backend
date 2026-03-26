"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerInstructorSchema = exports.registerAdminSchema = exports.registerUserSchema = void 0;
const zod_1 = require("zod");
// Base schema with common fields
const baseUserSchema = zod_1.z.object({
    name: zod_1.z.string().min(1, "Name is required"),
    email: zod_1.z.string().min(7, "Email is required").email("Invalid email format"),
    password: zod_1.z.string().min(6, "Password must be at least 6 characters long"),
    phone: zod_1.z.string().optional(),
    country: zod_1.z.string().optional(),
    profileImage: zod_1.z.string().optional(),
    district: zod_1.z.string().optional(),
    address: zod_1.z.string().optional(),
    gender: zod_1.z.string().optional(),
});
// Student registration schema
exports.registerUserSchema = baseUserSchema.extend({
    enrolledCourses: zod_1.z.array(zod_1.z.string()).optional(),
    batchWisePerformance: zod_1.z
        .array(zod_1.z.object({
        course: zod_1.z.string(),
        batch: zod_1.z.number(),
        progress: zod_1.z.number(),
        startedAt: zod_1.z.coerce.date(),
        stone: zod_1.z.number(),
        quiz: zod_1.z.array(zod_1.z.number()),
        assignment: zod_1.z.array(zod_1.z.number()),
        totalMark: zod_1.z.number(),
        profileType: zod_1.z.string().optional(),
        isUnlock: zod_1.z.boolean().optional(),
    }))
        .optional(),
});
// Admin registration schema
exports.registerAdminSchema = baseUserSchema.extend({
    role: zod_1.z.literal("admin").default("admin"),
});
// Instructor registration schema
exports.registerInstructorSchema = baseUserSchema.extend({
    role: zod_1.z.literal("instructor").default("instructor"),
    specialization: zod_1.z.string().optional(),
    qualifications: zod_1.z.array(zod_1.z.string()).optional(),
});
