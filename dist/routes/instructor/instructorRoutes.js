"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const authMiddleware_1 = require("../../middleware/authMiddleware");
const checkRole_1 = require("../../middleware/checkRole");
const instructorController_1 = require("../../controllers/instructor/instructorController");
const router = express_1.default.Router();
router.get("/instructors-info", authMiddleware_1.authenticate, instructorController_1.allInstructorInfo);
router.get("/dashboard", authMiddleware_1.authenticate, (0, checkRole_1.authorize)("instructor", "admin"), instructorController_1.instructorDashboardStats);
// Assigned courses — all URL variants used by frontend
router.get("/get-assigned-courses", authMiddleware_1.authenticate, (0, checkRole_1.authorize)("instructor", "admin"), instructorController_1.getAssignedCourses);
router.get("/assigned-courses", authMiddleware_1.authenticate, (0, checkRole_1.authorize)("instructor", "admin"), instructorController_1.getAssignedCourses);
router.get("/get-assigned-course", authMiddleware_1.authenticate, (0, checkRole_1.authorize)("instructor", "admin"), instructorController_1.getAssignedCourses);
router.get("/assign-course", authMiddleware_1.authenticate, (0, checkRole_1.authorize)("instructor", "admin"), instructorController_1.getAssignedCourses);
router.get("/profile/:instructorId", authMiddleware_1.authenticate, (0, checkRole_1.authorize)("admin", "instructor"), instructorController_1.getInstructorDetails);
router.put("/assign/:batchId", authMiddleware_1.authenticate, (0, checkRole_1.authorize)("admin"), instructorController_1.assignInstructorsToBatch);
router.delete("/unassign/:batchId/:instructorId", authMiddleware_1.authenticate, (0, checkRole_1.authorize)("admin"), instructorController_1.unassignInstructorFromBatch);
exports.default = router;
