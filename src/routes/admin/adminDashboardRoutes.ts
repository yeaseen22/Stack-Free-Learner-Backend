import express from "express";
import { authenticate } from "../../middleware/authMiddleware";
import { authorize } from "../../middleware/checkRole";
import {
  adminStats,
  allStudentInfo,
  changeUserRole,
  getAllTransactions,
  getSpecificSubmission,
} from "../../controllers/admin/adminDashboardController";
import { sendBatchAnnouncement } from "../../controllers/email/emailBroadcast";

const router = express.Router();

router.get(
  "/stats",
  authenticate,
  authorize("admin", "instructor"),
  adminStats
);

router.get(
  "/all-transactions",
  authenticate,
  authorize("admin", "instructor"),
  getAllTransactions
);

router.get(
  "/students-info",
  authenticate,
  authorize("admin", "instructor"),
  allStudentInfo
);

router.patch("/role-update", authenticate, authorize("admin"), changeUserRole);

router.post(
  "/students-email-broadcast",
  authenticate,
  authorize("admin", "instructor"),
  sendBatchAnnouncement
);

router.get(
  "/get-student-submission/:id",
  authenticate,
  authorize("admin", "instructor"),
  getSpecificSubmission
);

export default router;
