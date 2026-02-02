import mongoose, { model, Schema } from 'mongoose';
import { IMilestone } from '../../interfaces/content/milestoneInterface';

const milestoneSchema = new mongoose.Schema<IMilestone>({
    courseId: { type: Schema.Types.ObjectId, ref: 'Course', required: true },
    title: { type: String, required: true },
    order: { type: Number, default: 0 },
    duration: { type: Number }, 
    modules: [{ type: Schema.Types.ObjectId, ref: 'Module' }],
}, { timestamps: true });

const Milestone = model<IMilestone>('Milestone', milestoneSchema);
export default Milestone;