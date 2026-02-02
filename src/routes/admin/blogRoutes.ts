import express from "express";
import { authenticate } from "../../middleware/authMiddleware";
import { authorize } from "../../middleware/checkRole";
import { addComment, createBlog, deleteBlog, deleteCommentFromBlog, getAllBlogs, getBlogBySlug, updateBlog } from "../../controllers/admin/blogController";

const router = express.Router();

router.post("/create-blog", authenticate, authorize("admin", "instructor"), createBlog);
router.get("/get-blogs",  getAllBlogs);
router.get("/:slug", getBlogBySlug);
router.put("/update/:id", authenticate, authorize("admin", "instructor"), updateBlog);
router.delete(
  "/delete/:id",
  authenticate,
  authorize("admin"),
  deleteBlog
);
router.post("/comment/:id", authenticate, authorize("admin", "instructor", "student"), addComment);
router.delete("/:blogId/comments/:commentIndex", authenticate, authorize("admin", "instructor", "student"), deleteCommentFromBlog);

export default router;
