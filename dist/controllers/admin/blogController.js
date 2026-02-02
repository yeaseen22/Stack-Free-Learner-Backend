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
exports.deleteCommentFromBlog = exports.addComment = exports.deleteBlog = exports.updateBlog = exports.getBlogBySlug = exports.getAllBlogs = exports.createBlog = void 0;
const BlogModel_1 = __importDefault(require("../../models/admin/BlogModel"));
const isValidObjectId_1 = require("../../helpers/isValidObjectId");
const UserModel_1 = require("../../models/auth/UserModel");
// Create a new blog post
const createBlog = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
        if (!userId) {
            return res.status(400).json({ message: "User ID not found in token" });
        }
        //  Fetch user info from DB
        const user = yield UserModel_1.User.findById(userId).select("name profileImage");
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        // Construct blog data
        const blogData = req.body;
        const newBlog = new BlogModel_1.default(Object.assign(Object.assign({}, blogData), { author: {
                name: user.name,
                profileImage: user.profileImage,
            } }));
        const savedBlog = yield newBlog.save();
        return res.status(200).json({
            success: true,
            message: "Blog created successfully",
            data: savedBlog,
        });
    }
    catch (error) {
        return res.status(500).json({
            success: false,
            message: "Error on creating the blog",
            error: error instanceof Error ? error.message : "Unknown error",
        });
    }
});
exports.createBlog = createBlog;
// Get all blog posts
const getAllBlogs = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const blogs = yield BlogModel_1.default.find().sort({ publishedDate: -1 });
        return res.status(200).json({
            success: true,
            message: "Blogs Retrive Successfully",
            blogs,
        });
    }
    catch (error) {
        return res.status(500).json({ error: error.message });
    }
});
exports.getAllBlogs = getAllBlogs;
// Get a single blog post by slug
const getBlogBySlug = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { slug } = req.params;
        const blog = yield BlogModel_1.default.findOne({ slug });
        if (!blog)
            return res.status(404).json({ message: "Blog not found" });
        return res.status(200).json({
            success: true,
            message: "Course Retrive Successfully",
            blog,
        });
    }
    catch (error) {
        return res.status(500).json({ error: error.message });
    }
});
exports.getBlogBySlug = getBlogBySlug;
// Update a blog post by ID
const updateBlog = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        if (!(0, isValidObjectId_1.isValidObjectId)(id))
            return res.status(400).json({ message: "Invalid blog ID" });
        const updatedBlog = yield BlogModel_1.default.findByIdAndUpdate(id, req.body, {
            new: true,
            runValidators: true,
        });
        if (!updatedBlog)
            return res.status(404).json({ message: "Blog not found" });
        return res.status(200).json({
            success: true,
            message: "Blog updated successfully",
            data: updatedBlog,
        });
    }
    catch (error) {
        return res.status(500).json({
            success: false,
            message: "Error updating blog",
            error: error instanceof Error ? error.message : "Unknown error",
        });
    }
});
exports.updateBlog = updateBlog;
// Delete a blog post by ID
const deleteBlog = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        if (!(0, isValidObjectId_1.isValidObjectId)(id))
            return res.status(400).json({ message: "Invalid blog ID" });
        const deletedBlog = yield BlogModel_1.default.findByIdAndDelete(id);
        if (!deletedBlog)
            return res.status(404).json({ message: "Blog not found" });
        return res.status(200).json({
            success: true,
            message: "Blog deleted successfully",
        });
    }
    catch (error) {
        return res.status(500).json({
            success: false,
            message: "Delete Failed",
            error: error instanceof Error ? error.message : "Unknown error",
        });
    }
});
exports.deleteBlog = deleteBlog;
// Add a comment to a blog post
const addComment = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const { id } = req.params;
        if (!(0, isValidObjectId_1.isValidObjectId)(id))
            return res.status(400).json({ message: "Invalid blog ID" });
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
        if (!userId) {
            return res.status(400).json({ message: "User ID not found in token" });
        }
        //  Fetch user info from DB
        const user = yield UserModel_1.User.findById(userId).select("name profileImage");
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        const { comment } = req.body;
        if (!comment) {
            return res.status(400).json({ message: "Comment text is required" });
        }
        //  Construct comment object
        const newComment = {
            user: {
                name: user.name,
                profileImage: user.profileImage || "N/A",
            },
            comment,
            date: new Date(),
        };
        const blog = yield BlogModel_1.default.findById(id);
        if (!blog) {
            return res.status(404).json({ message: "Blog not found" });
        }
        blog.comments.push(newComment);
        yield blog.save();
        return res.status(200).json({
            success: true,
            message: "Comment added successfully",
            data: blog,
        });
    }
    catch (error) {
        return res.status(500).json({
            success: false,
            message: "Failed to comment",
            error: error instanceof Error ? error.message : "Unknown error",
        });
    }
});
exports.addComment = addComment;
// Delete a comment
const deleteCommentFromBlog = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const blogId = req.params.blogId;
        const commentIndexFromUser = parseInt(req.params.commentIndex); // index starts from 1 (user-facing)
        if (isNaN(commentIndexFromUser) || commentIndexFromUser < 1) {
            return res.status(400).json({ message: "Invalid comment index. Must start from 1." });
        }
        const blog = yield BlogModel_1.default.findById(blogId);
        if (!blog) {
            return res.status(404).json({ message: "Blog not found" });
        }
        const commentIndex = commentIndexFromUser - 1; // convert to 0-based for array access
        if (commentIndex >= blog.comments.length) {
            return res.status(400).json({ message: "Comment index out of range" });
        }
        blog.comments.splice(commentIndex, 1);
        yield blog.save();
        return res.status(200).json({
            success: true,
            message: `Comment ${commentIndexFromUser} deleted successfully`,
            // data: blog,
        });
    }
    catch (error) {
        return res.status(500).json({
            success: false,
            message: "Error deleting comment",
            error: error instanceof Error ? error.message : "Unknown error",
        });
    }
});
exports.deleteCommentFromBlog = deleteCommentFromBlog;
