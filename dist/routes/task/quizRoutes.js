"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const authMiddleware_1 = require("../../middleware/authMiddleware");
const checkRole_1 = require("../../middleware/checkRole");
const quizController_1 = require("../../controllers/task/quizController");
const router = express_1.default.Router();
router.post("/quiz-submission", authMiddleware_1.authenticate, quizController_1.submitQuiz);
router.get("/my-quiz-submissions/:quizId", authMiddleware_1.authenticate, (0, checkRole_1.authorize)("student"), quizController_1.getMyQuizSubmissions);
router.get("/getMyQuiz", authMiddleware_1.authenticate, (0, checkRole_1.authorize)("student"), quizController_1.getMyQuiz);
router.get("/get-all-quizzes", authMiddleware_1.authenticate, (0, checkRole_1.authorize)("admin", "instructor"), quizController_1.getAllQuizLeaderboards);
exports.default = router;
