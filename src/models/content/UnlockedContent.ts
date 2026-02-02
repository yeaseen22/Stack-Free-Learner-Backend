import { number } from "joi";
import { Schema, model } from "mongoose";

const unlockedContentSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    courseId: {
      type: Schema.Types.ObjectId,
      ref: "Course",
      required: true,
    },
    batch: {
      type: Number,
    },
    unlockedContents: [
      {
        type: Schema.Types.ObjectId,
        required: true,
      },
    ],
  },
  {
    timestamps: true,
  }
);

unlockedContentSchema.index({ userId: 1, courseId: 1, batch: 1 }, { unique: true });

const UnlockedContent = model("UnlockedContent", unlockedContentSchema);

export default UnlockedContent;
