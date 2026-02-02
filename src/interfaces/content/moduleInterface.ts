import { Types } from 'mongoose';



export interface IModule {
  _id?: Types.ObjectId;
  milestoneId: Types.ObjectId;
  title: string;
  type?: 'video' | 'quiz' | 'assignment';
  moduleContents?: Types.ObjectId[];
  duration?: number;
  order?: number;
  isPreview?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}
