import { z } from "zod";

// Base schema with common fields
const baseUserSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().min(7, "Email is required").email("Invalid email format"),
  password: z.string().min(6, "Password must be at least 6 characters long"),
  phone: z.string().optional(),
  country: z.string().optional(),
  profileImage: z.string().optional(),
  district: z.string().optional(),
  address: z.string().optional(),
  gender: z.string().optional(),
});

// Student registration schema
export const registerUserSchema = baseUserSchema.extend({
  enrolledCourses: z.array(z.string()).optional(),
  batchWisePerformance: z
    .array(
      z.object({
        course: z.string(),
        batch: z.number(),
        progress: z.number(),
        startedAt: z.coerce.date(),
        stone: z.number(),
        quiz: z.array(z.number()),
        assignment: z.array(z.number()),
        totalMark: z.number(),
        profileType: z.string().optional(),
        isUnlock: z.boolean().optional(),
      })
    )
    .optional(),
});

// Admin registration schema
export const registerAdminSchema = baseUserSchema.extend({
  role: z.literal("admin").default("admin"), 
});

// Instructor registration schema
export const registerInstructorSchema = baseUserSchema.extend({
  role: z.literal("instructor").default("instructor"), 
  specialization: z.string().optional(),
  qualifications: z.array(z.string()).optional(),
});
