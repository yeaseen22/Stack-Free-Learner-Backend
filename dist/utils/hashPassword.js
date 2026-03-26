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
exports.comparePassword = exports.hashPassword = void 0;
const bcrypt_1 = __importDefault(require("bcrypt"));
/**
 * Hashes a password using bcrypt
 * @param password The plain text password to hash
 * @param saltRounds The number of salt rounds to use (default: 10)
 * @returns Promise containing the hashed password
 */
const hashPassword = (password_1, ...args_1) => __awaiter(void 0, [password_1, ...args_1], void 0, function* (password, saltRounds = 10) {
    try {
        const salt = yield bcrypt_1.default.genSalt(saltRounds);
        const hashedPassword = yield bcrypt_1.default.hash(password, salt);
        return hashedPassword;
    }
    catch (error) {
        throw new Error("Error hashing password");
    }
});
exports.hashPassword = hashPassword;
/**
 * Compares a plain text password with a hashed password
 * @param password The plain text password to compare
 * @param hashedPassword The hashed password to compare against
 * @returns Promise containing boolean indicating if passwords match
 */
const comparePassword = (password, hashedPassword) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        return yield bcrypt_1.default.compare(password, hashedPassword);
    }
    catch (error) {
        throw new Error("Error comparing passwords");
    }
});
exports.comparePassword = comparePassword;
