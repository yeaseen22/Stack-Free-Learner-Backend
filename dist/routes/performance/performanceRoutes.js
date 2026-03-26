"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const performanceController_1 = require("../../controllers/performance/performanceController");
const authMiddleware_1 = require("../../middleware/authMiddleware");
const checkRole_1 = require("../../middleware/checkRole");
const router = express_1.default.Router();
router.get("/compare-weekly/:userId", performanceController_1.compareWeeklyPerformance);
router.get("/batch-wise-performance", authMiddleware_1.authenticate, (0, checkRole_1.authorize)("student"), performanceController_1.getStudentPerformance);
exports.default = router;
