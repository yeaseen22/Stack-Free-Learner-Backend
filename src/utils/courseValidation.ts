// utils/validation/courseValidation.ts
import Joi from 'joi';

export const courseValidationSchema = Joi.object({
  title: Joi.string().required(),
  description: Joi.string().allow(''),
  thumbnail: Joi.string().uri().allow(''),
  price: Joi.number().min(0).required(),
  isPaid: Joi.boolean().default(true),
  coursePlan: Joi.string().allow(''),
  discount: Joi.string().allow(''),
  category: Joi.string().allow(''),
  level: Joi.string()
    .valid('Beginner', 'Intermediate', 'Advanced')
    .default('Beginner'),
  batch: Joi.number().default(0),
  duration: Joi.number().default(0),
  hasCertificate: Joi.boolean().default(false),
  features: Joi.array().items(Joi.object()).default([]),
  milestones: Joi.array().items(Joi.string()).default([]),
  createdBy: Joi.string().required(),
  isPublished: Joi.boolean().default(false),
  status: Joi.string().valid('draft', 'published', 'archived').default('draft'),
});
