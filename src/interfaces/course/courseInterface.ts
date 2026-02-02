import { Schema, Types } from 'mongoose';

export interface IFeatures {
  icon: string;
  title: string;
  description: string;
}

export interface ICourse extends Document {
  title: string;
}

export interface ICourse {
  _id?: string;
  title: string;
  slug: string;
  description: string;
  price: number;
  oldPrice: number;
  isPaid: boolean;
  discount: string;
  coursePlan: string;
  thumbnail?: string;
  category?: string;
  level?: 'Beginner' | 'Intermediate' | 'Advanced';
  duration?: number;
  hasCertificate?: boolean;
  rating?: number;
  reviewCount?: number;
  reviews?: Types.ObjectId[];
  features: IFeatures[];
  milestones: Types.ObjectId[];
  batchData?: Types.ObjectId[];
  createdBy: Types.ObjectId;
  isPublished?: boolean;
  status?: 'draft' | 'published' | 'archived';
  enrolledCount?: number;
}
