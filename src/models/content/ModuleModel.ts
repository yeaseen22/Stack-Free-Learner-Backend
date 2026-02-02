import mongoose, { model, Schema } from 'mongoose';
import { IModule } from '../../interfaces/content/moduleInterface';



const moduleSchema = new mongoose.Schema<IModule>(
  {
    milestoneId: {
      type: Schema.Types.ObjectId,
      ref: 'Milestone',
      required: true,
    },
    title: { type: String, required: true },
    type: {
      type: String,
      enum: ['video', 'quiz', 'assignment'],
      default: 'video',
    },
    moduleContents: [{ type: Schema.Types.ObjectId, ref: 'ModuleContent' }],
    duration: { type: Number },
  },
  { timestamps: true }
);

const Module = model<IModule>('Module', moduleSchema);
export default Module;
