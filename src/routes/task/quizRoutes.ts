import express from "express";
import { authenticate } from "../../middleware/authMiddleware";
import { authorize } from "../../middleware/checkRole";
import {
  getAllQuizLeaderboards,
  getMyQuiz,
  getMyQuizSubmissions,
  submitQuiz,
} from "../../controllers/task/quizController";

const router = express.Router();

router.post("/quiz-submission", authenticate, submitQuiz);
router.get(
  "/my-quiz-submissions/:quizId",
  authenticate,
  authorize("student"),
  getMyQuizSubmissions
);

router.get("/getMyQuiz", authenticate, authorize("student"), getMyQuiz);
router.get(
  "/get-all-quizzes",
  authenticate,
  authorize("admin", "instructor"),
  getAllQuizLeaderboards
);

export default router;
