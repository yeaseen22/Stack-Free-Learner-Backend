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
const mongoose_1 = __importDefault(require("mongoose"));
const UserModel_1 = require("./src/models/auth/UserModel");
const hashPassword_1 = require("./src/utils/hashPassword");
const generateSecureUserId_1 = require("./src/helpers/generateSecureUserId");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const createAdmin = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Connect to MongoDB
        const url = process.env.MONGO_URI;
        if (!url) {
            throw new Error("MONGO_URI environment variable is not defined");
        }
        yield mongoose_1.default.connect(url);
        console.log("Connected to MongoDB");
        // Check if admin already exists
        const existingAdmin = yield UserModel_1.User.findOne({ email: "admin@stackfree.com" });
        if (existingAdmin) {
            console.log("Admin user already exists!");
            console.log("Email:", existingAdmin.email);
            console.log("Role:", existingAdmin.role);
            process.exit(0);
        }
        // Create new admin
        const hashedPassword = yield (0, hashPassword_1.hashPassword)("Admin@123456", 10);
        const userId = (0, generateSecureUserId_1.generateSecureUserId)("admin");
        const admin = new UserModel_1.User({
            userId,
            name: "Admin User",
            email: "admin@stackfree.com",
            role: "admin",
            password: hashedPassword,
        });
        yield admin.save();
        console.log("Admin created successfully!");
        console.log("Email: admin@stackfree.com");
        console.log("Password: Admin@123456");
        console.log("User ID:", admin.userId);
        process.exit(0);
    }
    catch (error) {
        console.error("Error creating admin:", error);
        process.exit(1);
    }
});
createAdmin();
