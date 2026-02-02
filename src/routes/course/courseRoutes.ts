import express from "express";
import {
  createCourse,
  createMilestone,
  createModule,
  deleteContent,
  deleteCourse,
  deleteMilestone,
  deleteModule,
  getAllCourses,
  getAllCoursesList,
  getCourseById,
  getCourseBySlug,
  getCoursesByInstructor,
  getEnrolledCourses,
  updateCourse,
  uploadContentToModule,
} from "../../controllers/course/courseController";
import { authorize } from "../../middleware/checkRole";
import { authenticate } from "../../middleware/authMiddleware";
import { uploadSingleVideo } from "../../utils/multerConfig";
import { createBatch } from "../../controllers/course/batchController";

const router = express.Router();

router.post("/create", authenticate, authorize("admin"), createCourse);
router.post(
  "/createMilestone",
  authenticate,
  authorize("admin"),
  createMilestone
);
router.post("/createModule", authenticate, createModule);
router.post("/createBatch", authenticate, createBatch);
router.post("/upload-content", uploadSingleVideo, uploadContentToModule);
router.get("/course", getAllCourses);
router.get("/course-lists", getAllCoursesList);
router.get(
  "/course/:id",
  authenticate,
  authorize("admin", "instructor"),
  getCourseById
);
router.get("/course/instructor/:id", authenticate, getCoursesByInstructor);
router.get("/get-course", authenticate,  getEnrolledCourses);
router.get("/:slug", getCourseBySlug);
router.put(
  "/update/:id",
  authenticate,
  authorize("admin", "instructor"),
  updateCourse
);
router.delete("/delete/:id", authenticate, authorize("admin"), deleteCourse);
router.delete(
  "/milestone-delete/:id",
  authenticate,
  authorize("admin", "instructor"),
  deleteMilestone
);
router.delete(
  "/module-delete/:id",
  authenticate,
  authorize("admin", "instructor"),
  deleteModule
);
router.delete(
  "/content-delete/:id",
  authenticate,
  authorize("admin", "instructor"),
  deleteContent
);
export default router;
