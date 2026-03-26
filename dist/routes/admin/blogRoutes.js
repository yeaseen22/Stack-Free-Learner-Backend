"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const authMiddleware_1 = require("../../middleware/authMiddleware");
const checkRole_1 = require("../../middleware/checkRole");
const blogController_1 = require("../../controllers/admin/blogController");
const router = express_1.default.Router();
router.post("/create-blog", authMiddleware_1.authenticate, (0, checkRole_1.authorize)("admin", "instructor"), blogController_1.createBlog);
router.get("/get-blogs", blogController_1.getAllBlogs);
router.get("/:slug", blogController_1.getBlogBySlug);
router.put("/update/:id", authMiddleware_1.authenticate, (0, checkRole_1.authorize)("admin", "instructor"), blogController_1.updateBlog);
router.delete("/delete/:id", authMiddleware_1.authenticate, (0, checkRole_1.authorize)("admin"), blogController_1.deleteBlog);
router.post("/comment/:id", authMiddleware_1.authenticate, (0, checkRole_1.authorize)("admin", "instructor", "student"), blogController_1.addComment);
router.delete("/:blogId/comments/:commentIndex", authMiddleware_1.authenticate, (0, checkRole_1.authorize)("admin", "instructor", "student"), blogController_1.deleteCommentFromBlog);
exports.default = router;
