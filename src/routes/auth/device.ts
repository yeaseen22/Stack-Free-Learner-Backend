import express from "express";
import { authenticate } from "../../middleware/authMiddleware";
import { getDeviceHistory } from "../../helpers/deviceTracker";


const router = express.Router();

router.get("/find-devices", authenticate, getDeviceHistory);

export default router;
