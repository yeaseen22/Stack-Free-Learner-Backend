import express from "express";
import { accessVideo, getUnlockedContentCounts, unlockContent } from "../../controllers/content/videoController";
import { authenticate } from "../../middleware/authMiddleware";
import { authorize } from "../../middleware/checkRole";

const router = express.Router();

router.post("/unlock", unlockContent);
router.get("/unlocked", accessVideo);router.get(
  "/unlock-content-count/:courseId",
  authenticate,
  authorize("student"),
  getUnlockedContentCounts
);

export default router;
