import mongoose from "mongoose";

// Helper: Validate ObjectId
export const isValidObjectId = (id: string): boolean =>
  mongoose.Types.ObjectId.isValid(id);
