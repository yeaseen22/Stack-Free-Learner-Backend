"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const checkRole_1 = require("../../middleware/checkRole");
const authMiddleware_1 = require("../../middleware/authMiddleware");
const authController_1 = require("../../controllers/auth/authController");
const validateRequest_1 = require("../../middleware/validateRequest");
const user_validation_1 = require("../../validation/auth/user.validation");
const userController_1 = require("../../controllers/auth/userController");
const router = express_1.default.Router();
// --------------------Auth----------------------
// Student registration (open route)
router.post("/user/register", (0, validateRequest_1.validateRequest)(user_validation_1.registerUserSchema), authController_1.registerStudent);
// Admin registration (protected)
router.post("/admin/register", authMiddleware_1.authenticate, (0, checkRole_1.authorize)("admin"), (0, validateRequest_1.validateRequest)(user_validation_1.registerAdminSchema), authController_1.registerAdmin);
// Instructor registration (protected - only admins can create instructors)
router.post("/instructor/register", authMiddleware_1.authenticate, (0, checkRole_1.authorize)("admin"), (0, validateRequest_1.validateRequest)(user_validation_1.registerInstructorSchema), authController_1.registerInstructor);
// --------------------User Management----------------------
router.post("/user/login", authController_1.login);
router.get("/refresh", authController_1.refresh);
router.post("/user/logout", authController_1.logout);
router.get("/users", authMiddleware_1.authenticate, (0, checkRole_1.authorize)("admin"), userController_1.getAllUsers);
router.get("/details", authMiddleware_1.authenticate, (0, checkRole_1.authorize)("admin"), userController_1.getUserById);
router.patch("/userPerformence/:id/batch/:batchId", authMiddleware_1.authenticate, (0, checkRole_1.authorize)("admin"), userController_1.updateUserPerformanceByBatchId);
router.get("/user", authMiddleware_1.authenticate, userController_1.getMe);
router.put("/user/:userId", authMiddleware_1.authenticate, userController_1.updateUser);
router.put("/reset-password/:userId", authMiddleware_1.authenticate, userController_1.updatePassword);
router.delete("/user/:userId", authMiddleware_1.authenticate, (0, checkRole_1.authorize)("admin", "instructor"), userController_1.deleteUser);
router.patch("/user/block-student/:studentId", authMiddleware_1.authenticate, (0, checkRole_1.authorize)("admin", "instructor"), userController_1.blockStudent);
exports.default = router;
