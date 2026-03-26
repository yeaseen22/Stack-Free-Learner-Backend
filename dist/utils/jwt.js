"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyToken = exports.generateRefreshToken = exports.generateAccessToken = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const generateAccessToken = (payload) => {
    const secret = process.env.JWT_SECRET;
    if (!secret) {
        throw new Error("JWT_SECRET is not defined in environment variables");
    }
    return jsonwebtoken_1.default.sign(payload, secret, { expiresIn: "1h" });
};
exports.generateAccessToken = generateAccessToken;
const generateRefreshToken = (payload) => {
    const secret = process.env.REFRESH_TOKEN_SECRET;
    if (!secret) {
        throw new Error("REFRESH_TOKEN_SECRET is not defined in environment variables");
    }
    return jsonwebtoken_1.default.sign(payload, secret, { expiresIn: "7d" }); // Refresh token expires in 7 days
};
exports.generateRefreshToken = generateRefreshToken;
const verifyToken = (token, type) => {
    const secret = type === "access" ? process.env.JWT_SECRET : process.env.REFRESH_TOKEN_SECRET;
    if (!secret) {
        throw new Error(`${type === "access" ? "JWT_SECRET" : "REFRESH_TOKEN_SECRET"} is not defined`);
    }
    try {
        const decoded = jsonwebtoken_1.default.verify(token, secret);
        return decoded;
    }
    catch (err) {
        console.error(`❌ Invalid ${type} Token`, err);
        return null;
    }
};
exports.verifyToken = verifyToken;
