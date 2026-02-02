"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const submitAssignment_1 = require("../controllers/submitAssignment");
const checkRole_1 = require("../middleware/checkRole");
const authMiddleware_1 = require("../middleware/authMiddleware");
const router = express_1.default.Router();
router.post("/submit", authMiddleware_1.authenticate, (0, checkRole_1.authorize)("student"), submitAssignment_1.submitAssignment);
router.get("/submissions", submitAssignment_1.getAllSubmissions);
router.get("/my-submissions/:assignmentId", authMiddleware_1.authenticate, (0, checkRole_1.authorize)("student"), submitAssignment_1.getUserSubmissions);
router.patch("/mark/:id", authMiddleware_1.authenticate, (0, checkRole_1.authorize)("admin", "instructor"), submitAssignment_1.updateAssignmentMark);
exports.default = router;
