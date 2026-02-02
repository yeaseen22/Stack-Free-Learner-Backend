import express from "express";
import { authenticate } from "../../middleware/authMiddleware";
import { authorize } from "../../middleware/checkRole";
import { allInstructorInfo, assignInstructorsToBatch, getInstructorDetails, unassignInstructorFromBatch } from "../../controllers/instructor/instructorController";

const router = express.Router();

router.get(
  "/instructors-info",
  authenticate,
  authorize("admin", "instructor"),
  allInstructorInfo
);

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
