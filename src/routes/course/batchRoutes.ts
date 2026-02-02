import express from "express";
import { authenticate } from "../../middleware/authMiddleware";
import { authorize } from "../../middleware/checkRole";
import { deleteBatch, getAllBatches, updateBatch } from "../../controllers/course/batchController";
const router = express.Router();

router.get(
  "/get-batch",
  authenticate,
  authorize("admin", "instructor"),
  getAllBatches
);
router.put(
  "/update-batch/:id",
  authenticate,
  authorize("admin", "instructor"),
  updateBatch
);

router.delete(
  "/delete-batch/:id",
  authenticate,
  authorize("admin", "instructor"),
  deleteBatch
);

export default router;
