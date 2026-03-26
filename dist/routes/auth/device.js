"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const authMiddleware_1 = require("../../middleware/authMiddleware");
const deviceTracker_1 = require("../../helpers/deviceTracker");
const router = express_1.default.Router();
router.get("/find-devices", authMiddleware_1.authenticate, deviceTracker_1.getDeviceHistory);
exports.default = router;
