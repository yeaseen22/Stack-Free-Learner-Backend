import { model, Schema } from "mongoose";
import {
  IBlog,
  IComment,
  IUserBolg,
} from "../../interfaces/admin/blogInterface";

const userSchema = new Schema<IUserBolg>({
  name: { type: String, required: true },
  profileImage: { type: String },
});

const commentSchema = new Schema<IComment>(
  {
    user: { type: userSchema, required: true },
    comment: { type: String, required: true },
    date: { type: Date, required: true },
  },
  { _id: false }
);

const blogSchema = new Schema<IBlog>(
  {
    title: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    author: { type: userSchema, required: true },
    coverImage: { type: String },
    content: { type: String, required: true },
    tags: { type: [String], default: [] },
    comments: { type: [commentSchema], default: [] },
  },
  { timestamps: true }
);

const Blog = model<IBlog>("Blog", blogSchema);

export default Blog;
