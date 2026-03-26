"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const authMiddleware_1 = require("../../middleware/authMiddleware");
const checkRole_1 = require("../../middleware/checkRole");
const sessionController_1 = require("../../controllers/session/sessionController");
const router = express_1.default.Router();
// Create a new session (Admin, Instructor only)
router.post("/create", authMiddleware_1.authenticate, (0, checkRole_1.authorize)("admin", "instructor"), sessionController_1.createSession);
// Get upcoming sessions for logged-in student
router.get("/upcoming", authMiddleware_1.authenticate, (0, checkRole_1.authorize)("student"), sessionController_1.getUpcomingSessions);
// Get all sessions for student's enrolled batches
router.get("/student/my-sessions", authMiddleware_1.authenticate, sessionController_1.getMyEnrolledSessions);
// Get all sessions for a specific batch (Authenticated users)
router.get("/batch/:batchId", authMiddleware_1.authenticate, sessionController_1.getSessionsByBatch);
// Join session - Get meeting link (Students only)
router.get("/join/:id", authMiddleware_1.authenticate, (0, checkRole_1.authorize)("student"), sessionController_1.joinSession);
// Get single session by ID (Authenticated users) - MUST BE LAST
router.get("/:id", authMiddleware_1.authenticate, sessionController_1.getSessionById);
// Update session (Admin, Instructor only)
router.put("/update/:id", authMiddleware_1.authenticate, (0, checkRole_1.authorize)("admin", "instructor"), sessionController_1.updateSession);
// Delete session (Admin only)
router.delete("/delete/:id", authMiddleware_1.authenticate, (0, checkRole_1.authorize)("admin"), sessionController_1.deleteSession);
// Update session status (Admin, Instructor only)
router.patch("/status/:id", authMiddleware_1.authenticate, (0, checkRole_1.authorize)("admin", "instructor"), sessionController_1.updateSessionStatus);
// Add recording link (Admin, Instructor only)
router.post("/:id/recording", authMiddleware_1.authenticate, (0, checkRole_1.authorize)("admin", "instructor"), sessionController_1.addRecordingLink);
exports.default = router;
