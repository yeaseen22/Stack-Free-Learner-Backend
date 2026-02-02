// routes/leaderboard.ts
import express from "express";
import { authenticate } from "../../middleware/authMiddleware";
import { getLeaderboard } from "../../controllers/dashboard/leaderboard";

const router = express.Router();

router.get("/get-learderboard", authenticate,  getLeaderboard);

export default router;
