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
  getCourseBySlugAndBatch,
  getCoursesByInstructor,
  getEnrolledCourses,
  updateCourse,
  updateVideo,
  uploadContentToModule,
} from "../../controllers/course/courseController";
import { authorize } from "../../middleware/checkRole";
import { authenticate } from "../../middleware/authMiddleware";
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
router.post("/upload-content", authenticate, uploadContentToModule);
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
router.get("/stream/:slug/:batch", getCourseBySlugAndBatch);
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
  "/content-delete/:moduleContentId/:videoId",
  authenticate,
  authorize("admin", "instructor"),
  deleteContent
);
router.put(
  "/video-update/:moduleContentId/:videoId",
  authenticate,
  authorize("admin", "instructor"),
  updateVideo
);
export default router;
