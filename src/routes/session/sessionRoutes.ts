import express from "express";
import { authenticate } from "../../middleware/authMiddleware";
import { authorize } from "../../middleware/checkRole";
import {
  createSession,
  getSessionsByBatch,
  getSessionById,
  updateSession,
  deleteSession,
  updateSessionStatus,
  addRecordingLink,
  getUpcomingSessions,
  getMyEnrolledSessions,
  joinSession,
} from "../../controllers/session/sessionController";

const router = express.Router();

// Create a new session (Admin, Instructor only)
router.post(
  "/create",
  authenticate,
  authorize("admin", "instructor"),
  createSession
);

// Get upcoming sessions for logged-in student
router.get(
  "/upcoming",
  authenticate,
  authorize("student"),
  getUpcomingSessions
);

// Get all sessions for student's enrolled batches
router.get(
  "/student/my-sessions",
  authenticate,
  getMyEnrolledSessions
);

// Get all sessions for a specific batch (Authenticated users)
router.get(
  "/batch/:batchId",
  authenticate,
  getSessionsByBatch
);

// Join session - Get meeting link (Students only)
router.get(
  "/join/:id",
  authenticate,
  authorize("student"),
  joinSession
);

// Get single session by ID (Authenticated users) - MUST BE LAST
router.get(
  "/:id",
  authenticate,
  getSessionById
);

// Update session (Admin, Instructor only)
router.put(
  "/update/:id",
  authenticate,
  authorize("admin", "instructor"),
  updateSession
);

// Delete session (Admin only)
router.delete(
  "/delete/:id",
  authenticate,
  authorize("admin"),
  deleteSession
);

// Update session status (Admin, Instructor only)
router.patch(
  "/status/:id",
  authenticate,
  authorize("admin", "instructor"),
  updateSessionStatus
);

// Add recording link (Admin, Instructor only)
router.post(
  "/:id/recording",
  authenticate,
  authorize("admin", "instructor"),
  addRecordingLink
);

export default router;
