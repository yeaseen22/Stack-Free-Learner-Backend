"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const performanceController_1 = require("../../controllers/course/performanceController");
const router = express_1.default.Router();
router.get("/compare-weekly/:userId", performanceController_1.compareWeeklyPerformance);
exports.default = router;
