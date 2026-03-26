"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.resetPassword = exports.verifyOtp = exports.forgotPassword = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const email_1 = require("../constant/email");
const UserModel_1 = require("../models/auth/UserModel");
// Temporary in-memory storage (production-এ redis বা db use করো)
const otpStore = new Map();
const forgotPassword = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { email } = req.body;
    const user = yield UserModel_1.User.findOne({ email });
    if (!user)
        return res.status(404).json({ message: "User not found" });
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = Date.now() + 5 * 60 * 1000;
    otpStore.set(email, { otp, expiresAt });
    yield (0, email_1.sendEmail)({
        to: email,
        subject: "Password Reset OTP",
        html: `<p>Hi Fighter 👋,</p>
           <p>We received a request to reset your password for your Programming Fighter account.</p>
           <p><strong>Your OTP Code:</strong> <span style="font-size: 18px; color: #2b6cb0;">${otp}</span></p>
           <p>This code will expire in 5 minutes. If you didn't request a password reset, please ignore this email.</p>
           <p>Keep Learning & Keep Fighting! 💪</p>
           <p>— The Programming Fighter Team</p>`,
    });
    res.status(200).json({ message: "OTP sent to your email" });
});
exports.forgotPassword = forgotPassword;
const verifyOtp = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, otp } = req.body;
    const record = otpStore.get(email);
    if (!record)
        return res.status(400).json({ message: "OTP expired or not requested" });
    if (record.expiresAt < Date.now()) {
        otpStore.delete(email);
        return res.status(400).json({ message: "OTP expired" });
    }
    if (record.otp !== otp)
        return res.status(400).json({ message: "Invalid OTP" });
    // Verified
    res.status(200).json({ message: "OTP verified" });
});
exports.verifyOtp = verifyOtp;
const resetPassword = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, newPassword } = req.body;
    const user = yield UserModel_1.User.findOne({ email });
    if (!user)
        return res.status(404).json({ message: "User not found" });
    const hashedPassword = yield bcryptjs_1.default.hash(newPassword, 10);
    user.password = hashedPassword;
    yield user.save();
    otpStore.delete(email);
    res.status(200).json({ message: "Password reset successful" });
});
exports.resetPassword = resetPassword;
