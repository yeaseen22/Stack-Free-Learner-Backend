import express from "express";
import {
  compareWeeklyPerformance,
  getStudentPerformance,
} from "../../controllers/performance/performanceController";
import { authenticate } from "../../middleware/authMiddleware";
import { authorize } from "../../middleware/checkRole";

const router = express.Router();

router.get("/compare-weekly/:userId", compareWeeklyPerformance);

router.get(
  "/batch-wise-performance",
  authenticate,
  authorize("student"),
  getStudentPerformance
);

export default router;
