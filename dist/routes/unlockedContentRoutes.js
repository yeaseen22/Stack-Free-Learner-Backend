"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const videoController_1 = require("../controllers/videoController");
const authMiddleware_1 = require("../middleware/authMiddleware");
const checkRole_1 = require("../middleware/checkRole");
const router = express_1.default.Router();
router.post("/unlock", videoController_1.unlockContent);
router.get("/unlocked", videoController_1.accessVideo);
router.get("/unlock-content-count/:courseId", authMiddleware_1.authenticate, (0, checkRole_1.authorize)("student"), videoController_1.getUnlockedContentCounts);
exports.default = router;
