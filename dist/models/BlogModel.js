"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const userSchema = new mongoose_1.Schema({
    name: { type: String, required: true },
    avatar: { type: String, required: true },
});
const commentSchema = new mongoose_1.Schema({
    user: { type: userSchema, required: true },
    comment: { type: String, required: true },
    date: { type: Date, required: true },
}, { _id: false });
const blogSchema = new mongoose_1.Schema({
    title: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    author: { type: userSchema, required: true },
    publishedDate: { type: Date, required: true },
    coverImage: { type: String },
    content: { type: String, required: true },
    tags: { type: [String], default: [] },
    comments: { type: [commentSchema], default: [] },
});
const Blog = (0, mongoose_1.model)("Blog", blogSchema);
exports.default = Blog;
