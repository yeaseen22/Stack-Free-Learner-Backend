"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const authMiddleware_1 = require("../../middleware/authMiddleware");
const checkRole_1 = require("../../middleware/checkRole");
const adminDashboardController_1 = require("../../controllers/admin/adminDashboardController");
const emailBroadcast_1 = require("../../controllers/email/emailBroadcast");
const router = express_1.default.Router();
router.get("/stats", authMiddleware_1.authenticate, (0, checkRole_1.authorize)("admin", "instructor"), adminDashboardController_1.adminStats);
router.get("/all-transactions", authMiddleware_1.authenticate, (0, checkRole_1.authorize)("admin", "instructor"), adminDashboardController_1.getAllTransactions);
router.get("/students-info", authMiddleware_1.authenticate, (0, checkRole_1.authorize)("admin", "instructor"), adminDashboardController_1.allStudentInfo);
router.patch("/role-update", authMiddleware_1.authenticate, (0, checkRole_1.authorize)("admin"), adminDashboardController_1.changeUserRole);
router.post("/students-email-broadcast", authMiddleware_1.authenticate, (0, checkRole_1.authorize)("admin", "instructor"), emailBroadcast_1.sendBatchAnnouncement);
router.get("/get-student-submission/:id", authMiddleware_1.authenticate, (0, checkRole_1.authorize)("admin", "instructor"), adminDashboardController_1.getSpecificSubmission);
exports.default = router;
