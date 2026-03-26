"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// routes/leaderboard.ts
const express_1 = __importDefault(require("express"));
const authMiddleware_1 = require("../../middleware/authMiddleware");
const leaderboard_1 = require("../../controllers/dashboard/leaderboard");
const router = express_1.default.Router();
router.get("/get-learderboard", authMiddleware_1.authenticate, leaderboard_1.getLeaderboard);
exports.default = router;
