import { Schema, model, Types } from 'mongoose';
import { ICourse, IFeatures } from '../../interfaces/course/courseInterface';

const FeaturesSchema = new Schema<IFeatures>({
  icon: String,
  title: String,
  description: String,
});

const courseSchema = new Schema<ICourse>({
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
  batchData: [ { type: Schema.Types.ObjectId, ref: 'Batch' } ],
  duration: { type: Number },
  hasCertificate: { type: Boolean, default: false },
  rating: { type: Number, default: 0 },
  reviewCount: { type: Number, default: 0 },
  reviews: [{ type: Schema.Types.ObjectId, ref: 'Review' }],
  features: [FeaturesSchema],
  milestones: [{ type: Schema.Types.ObjectId, ref: 'Milestone' }],
  createdBy: { type: Schema.Types.ObjectId, ref: 'User' },
  isPublished: { type: Boolean, default: false },
  status: {
    type: String,
    enum: ['draft', 'published', 'archived'],
    default: 'draft',
  },
  enrolledCount: { type: Number, default: 0 },
});

export const Course = model<ICourse>('Course', courseSchema);
