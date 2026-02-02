import express from "express";
import { authenticate } from "../../middleware/authMiddleware";
import { authorize } from "../../middleware/checkRole";
import {
  getAllSubmissions,
  getMyAssignmentSubmissions,
  getUserSubmissions,
  submitAssignment,
  updateAssignmentMark,
} from "../../controllers/task/submitAssignment";

const router = express.Router();

router.post("/submit", authenticate, authorize("student"), submitAssignment);
router.get("/submissions", getAllSubmissions);
router.get(
  "/get-assignment-submissions",
  authenticate,
  authorize("student"),
  getMyAssignmentSubmissions
);
router.get(
  "/my-submissions/:assignmentId",
  authenticate,
  authorize("student"),
  getUserSubmissions
);

router.patch(
  "/mark/:id",
  authenticate,
  authorize("admin", "instructor"),
  updateAssignmentMark
);

export default router;
