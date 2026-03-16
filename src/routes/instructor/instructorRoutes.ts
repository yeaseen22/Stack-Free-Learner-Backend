import express from "express";
import { authenticate } from "../../middleware/authMiddleware";
import { authorize } from "../../middleware/checkRole";
import {
  allInstructorInfo,
  assignInstructorsToBatch,
  getAssignedCourses,
  getInstructorDetails,
  instructorDashboardStats,
  unassignInstructorFromBatch,
} from "../../controllers/instructor/instructorController";

const router = express.Router();

router.get(
  "/instructors-info",
  authenticate,
  allInstructorInfo
);

router.get(
  "/dashboard",
  authenticate,
  authorize("instructor", "admin"),
  instructorDashboardStats
);

// Assigned courses — all URL variants used by frontend
router.get("/get-assigned-courses", authenticate, authorize("instructor", "admin"), getAssignedCourses);
router.get("/assigned-courses",     authenticate, authorize("instructor", "admin"), getAssignedCourses);
router.get("/get-assigned-course",  authenticate, authorize("instructor", "admin"), getAssignedCourses);
router.get("/assign-course",        authenticate, authorize("instructor", "admin"), getAssignedCourses);

router.get(
  "/profile/:instructorId",
  authenticate,
  authorize("admin", "instructor"),
  getInstructorDetails
);

router.put(
  "/assign/:batchId",
  authenticate,
  authorize("admin"),
  assignInstructorsToBatch
);

router.delete(
  "/unassign/:batchId/:instructorId",
  authenticate,
  authorize("admin"),
  unassignInstructorFromBatch
);

export default router;
