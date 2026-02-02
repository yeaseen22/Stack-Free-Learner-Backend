"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.addComment = exports.deleteBlog = exports.updateBlog = exports.getBlogBySlug = exports.getAllBlogs = exports.createBlog = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const BlogModel_1 = __importDefault(require("../models/BlogModel"));
// Helper: Validate ObjectId
const isValidObjectId = (id) => mongoose_1.default.Types.ObjectId.isValid(id);
// ✅ Create a new blog post
const createBlog = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const blogData = req.body;
        const newBlog = new BlogModel_1.default(blogData);
        const savedBlog = yield newBlog.save();
        return res.status(201).json(savedBlog);
    }
    catch (error) {
        return res.status(500).json({ error: error.message });
    }
});
exports.createBlog = createBlog;
// ✅ Get all blog posts
const getAllBlogs = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const blogs = yield BlogModel_1.default.find().sort({ publishedDate: -1 });
        return res.status(200).json({
            message: "Blogs Retrive Successfully",
            blogs,
        });
    }
    catch (error) {
        return res.status(500).json({ error: error.message });
    }
});
exports.getAllBlogs = getAllBlogs;
// ✅ Get a single blog post by slug
const getBlogBySlug = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { slug } = req.params;
        const blog = yield BlogModel_1.default.findOne({ slug });
        if (!blog)
            return res.status(404).json({ message: "Blog not found" });
        return res.status(200).json({
            message: "Course Retrive Successfully",
            blog,
        });
    }
    catch (error) {
        return res.status(500).json({ error: error.message });
    }
});
exports.getBlogBySlug = getBlogBySlug;
// ✅ Update a blog post by ID
const updateBlog = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        if (!isValidObjectId(id))
            return res.status(400).json({ message: "Invalid blog ID" });
        const updatedBlog = yield BlogModel_1.default.findByIdAndUpdate(id, req.body, {
            new: true,
            runValidators: true,
        });
        if (!updatedBlog)
            return res.status(404).json({ message: "Blog not found" });
        return res.status(200).json(updatedBlog);
    }
    catch (error) {
        return res.status(500).json({ error: error.message });
    }
});
exports.updateBlog = updateBlog;
// ✅ Delete a blog post by ID
const deleteBlog = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        if (!isValidObjectId(id))
            return res.status(400).json({ message: "Invalid blog ID" });
        const deletedBlog = yield BlogModel_1.default.findByIdAndDelete(id);
        if (!deletedBlog)
            return res.status(404).json({ message: "Blog not found" });
        return res.status(200).json({ message: "Blog deleted successfully" });
    }
    catch (error) {
        return res.status(500).json({ error: error.message });
    }
});
exports.deleteBlog = deleteBlog;
// ✅ Add a comment to a blog post
const addComment = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        if (!isValidObjectId(id))
            return res.status(400).json({ message: "Invalid blog ID" });
        const comment = req.body;
        const blog = yield BlogModel_1.default.findById(id);
        if (!blog)
            return res.status(404).json({ message: "Blog not found" });
        blog.comments.push(comment);
        yield blog.save();
        return res.status(201).json(blog);
    }
    catch (error) {
        return res.status(500).json({ error: error.message });
    }
});
exports.addComment = addComment;
