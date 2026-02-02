import mongoose, { Schema, Document, Model } from "mongoose";

interface IUserUnlockedVideo extends Document {
  userId: mongoose.Types.ObjectId;
  videoId: mongoose.Types.ObjectId;
  unlockedContentIds: string[];
}

const userUnlockedVideoSchema = new Schema<IUserUnlockedVideo>({
  userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  videoId: { type: Schema.Types.ObjectId, ref: "Video", required: true },
  unlockedContentIds: [{ type: String }],

});

const UnlockedVideo: Model<IUserUnlockedVideo> = mongoose.model<IUserUnlockedVideo>(
  "UnlockedVideo",
  userUnlockedVideoSchema
);

export default UnlockedVideo;
