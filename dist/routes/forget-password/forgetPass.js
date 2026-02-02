"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const forget_password_1 = require("../../auth/forget-password");
const router = express_1.default.Router();
router.post("/forgot-password", forget_password_1.forgotPassword);
router.post("/verify-otp", forget_password_1.verifyOtp);
router.post("/reset-password", forget_password_1.resetPassword);
exports.default = router;
