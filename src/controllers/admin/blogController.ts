import { Request, Response, NextFunction } from "express";
import { IBlog, IComment } from "../../interfaces/admin/blogInterface";
import Blog from "../../models/admin/BlogModel";
import { isValidObjectId } from "../../helpers/isValidObjectId";
import { User } from "../../models/auth/UserModel";

// Create a new blog post
export const createBlog = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<any> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(400).json({ message: "User ID not found in token" });
    }

    //  Fetch user info from DB
    const user = await User.findById(userId).select("name profileImage");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Construct blog data
    const blogData: Omit<IBlog, "author"> = req.body;

    const newBlog = new Blog({
      ...blogData,
      author: {
        name: user.name,
        profileImage: user.profileImage,
      },
    });

    const savedBlog = await newBlog.save();
    return res.status(200).json({
      success: true,
      message: "Blog created successfully",
      data: savedBlog,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error on creating the blog",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

// Get all blog posts
export const getAllBlogs = async (
  req: Request,
  res: Response
): Promise<any> => {
  try {
    const blogs = await Blog.find().sort({ publishedDate: -1 });
    return res.status(200).json({
      success: true,
      message: "Blogs Retrive Successfully",
      blogs,
    });
  } catch (error) {
    return res.status(500).json({ error: (error as Error).message });
  }
};

// Get a single blog post by slug
export const getBlogBySlug = async (
  req: Request,
  res: Response
): Promise<any> => {
  try {
    const { slug } = req.params;
    const blog = await Blog.findOne({ slug });
    if (!blog) return res.status(404).json({ message: "Blog not found" });
    return res.status(200).json({
      success: true,
      message: "Course Retrive Successfully",
      blog,
    });
  } catch (error) {
    return res.status(500).json({ error: (error as Error).message });
  }
};

// Update a blog post by ID
export const updateBlog = async (req: Request, res: Response): Promise<any> => {
  try {
    const { id } = req.params;
    if (!isValidObjectId(id))
      return res.status(400).json({ message: "Invalid blog ID" });

    const updatedBlog = await Blog.findByIdAndUpdate(id, req.body, {
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
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error updating blog",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

// Delete a blog post by ID
export const deleteBlog = async (req: Request, res: Response): Promise<any> => {
  try {
    const { id } = req.params;
    if (!isValidObjectId(id))
      return res.status(400).json({ message: "Invalid blog ID" });

    const deletedBlog = await Blog.findByIdAndDelete(id);
    if (!deletedBlog)
      return res.status(404).json({ message: "Blog not found" });

    return res.status(200).json({
      success: true,
      message: "Blog deleted successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Delete Failed",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

// Add a comment to a blog post
export const addComment = async (req: Request, res: Response): Promise<any> => {
  try {
    const { id } = req.params;
    if (!isValidObjectId(id))
      return res.status(400).json({ message: "Invalid blog ID" });

    const userId = req.user?.id;
    if (!userId) {
      return res.status(400).json({ message: "User ID not found in token" });
    }

    //  Fetch user info from DB
    const user = await User.findById(userId).select("name profileImage");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const { comment } = req.body;
    if (!comment) {
      return res.status(400).json({ message: "Comment text is required" });
    }

    //  Construct comment object
    const newComment: IComment = {
      user: {
        name: user.name,
        profileImage: user.profileImage || "N/A",
      },
      comment,
      date: new Date(),
    };

    const blog = await Blog.findById(id);
    if (!blog) {
      return res.status(404).json({ message: "Blog not found" });
    }

    blog.comments.push(newComment);
    await blog.save();

    return res.status(200).json({
      success: true,
      message: "Comment added successfully",
      data: blog,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to comment",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

// Delete a comment
export const deleteCommentFromBlog = async (req: Request, res: Response): Promise<any> => {
  try {
    const blogId = req.params.blogId;
    const commentIndexFromUser = parseInt(req.params.commentIndex); // index starts from 1 (user-facing)

    if (isNaN(commentIndexFromUser) || commentIndexFromUser < 1) {
      return res.status(400).json({ message: "Invalid comment index. Must start from 1." });
    }

    const blog = await Blog.findById(blogId);
    if (!blog) {
      return res.status(404).json({ message: "Blog not found" });
    }

    const commentIndex = commentIndexFromUser - 1; // convert to 0-based for array access

    if (commentIndex >= blog.comments.length) {
      return res.status(400).json({ message: "Comment index out of range" });
    }

    blog.comments.splice(commentIndex, 1);
    await blog.save();

    return res.status(200).json({
      success: true,
      message: `Comment ${commentIndexFromUser} deleted successfully`,
      // data: blog,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error deleting comment",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

