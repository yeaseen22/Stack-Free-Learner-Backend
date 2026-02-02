"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// routes/leaderboard.ts
const express_1 = __importDefault(require("express"));
const leaderboard_1 = require("../controllers/leaderboard");
const router = express_1.default.Router();
router.get("/get-learderboard", leaderboard_1.getLeaderboard);
exports.default = router;
