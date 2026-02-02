"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const blogController_1 = require("../controllers/blogController");
const authMiddleware_1 = require("../middleware/authMiddleware");
const checkRole_1 = require("../middleware/checkRole");
const router = express_1.default.Router();
router.post("/", blogController_1.createBlog);
router.get("/get-blog", blogController_1.getAllBlogs);
router.get("/:slug", blogController_1.getBlogBySlug);
router.put("/:id", authMiddleware_1.authenticate, (0, checkRole_1.authorize)("admin", "instructor"), blogController_1.updateBlog);
router.delete("/:id", authMiddleware_1.authenticate, (0, checkRole_1.authorize)("admin", "instructor"), blogController_1.deleteBlog);
router.post("/:id/comments", blogController_1.addComment);
exports.default = router;
