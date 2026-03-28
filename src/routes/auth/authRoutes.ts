import express from "express";
import { authorize } from "../../middleware/checkRole";
import { authenticate } from "../../middleware/authMiddleware";
import {
  login,
  logout,
  refresh,
  registerAdmin,
  registerInstructor,
  registerStudent,
  registerVipStudent,
} from "../../controllers/auth/authController";
import { validateRequest } from "../../middleware/validateRequest";
import {
  registerAdminSchema,
  registerInstructorSchema,
  registerUserSchema,
} from "../../validation/auth/user.validation";
import {
  blockStudent,
  deleteUser,
  getAllUsers,
  getMe,
  getUserById,
  updatePassword,
  updateUser,
  updateUserPerformanceByBatchId,
} from "../../controllers/auth/userController";

const router = express.Router();

// --------------------Auth----------------------

// Student registration (open route)
router.post(
  "/user/register",
  validateRequest(registerUserSchema),
  registerStudent
);

// Admin registration (protected)
router.post(
  "/admin/register",
  authenticate,
  authorize("admin"),
  validateRequest(registerAdminSchema),
  registerAdmin
);

// Instructor registration (protected - only admins can create instructors)
router.post(
  "/instructor/register",
  authenticate,
  authorize("admin"),
  validateRequest(registerInstructorSchema),
  registerInstructor
);

// VIP Student registration (protected - only admins can create VIP students)
router.post(
  "/vipstudent/register",
  authenticate,
  authorize("admin"),
  validateRequest(registerUserSchema),
  registerVipStudent
);

// --------------------User Management----------------------
router.post("/user/login", login);
router.get("/refresh", refresh);
router.post("/user/logout", logout);
router.get("/users", authenticate, authorize("admin"), getAllUsers);
router.get("/details", authenticate, authorize("admin"), getUserById);
router.patch(
  "/userPerformence/:id/batch/:batchId",
  authenticate,
  authorize("admin"),
  updateUserPerformanceByBatchId
);
router.get("/user", authenticate, getMe);
router.put("/user/:userId", authenticate, updateUser);
router.put("/reset-password/:userId", authenticate, updatePassword);
router.delete(
  "/user/:userId",
  authenticate,
  authorize("admin", "instructor"),
  deleteUser
);
router.patch(
  "/user/block-student/:studentId",
  authenticate,
  authorize("admin", "instructor"),
  blockStudent
);

export default router;
