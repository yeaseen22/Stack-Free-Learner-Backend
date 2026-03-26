"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateSecureUserId = generateSecureUserId;
const crypto_1 = __importDefault(require("crypto"));
const moment_1 = __importDefault(require("moment"));
function generateSecureUserId(role) {
    const rolePrefix = role === "student"
        ? "STU"
        : role === "instructor"
            ? "INS"
            : role === "vipstudent"
                ? "VIP"
                : "ADM";
    const datePart = (0, moment_1.default)().format("YYMMDD");
    let randomPart = "";
    // Keep generating until last character is a digit
    while (true) {
        const bytes = crypto_1.default.randomBytes(2).toString("hex").toUpperCase(); // 4 chars
        if (/\d$/.test(bytes)) {
            randomPart = bytes;
            break;
        }
    }
    return `${rolePrefix}-${datePart}-${randomPart}`;
}
