import { Request, Response } from "express";
import QuizSubmission from "../../models/task/QuizModel";
import { User } from "../../models/auth/UserModel";
import {
  IPopulatedSubmission,
  PopulatedSubmission,
  TLeaderboardEntry,
} from "../../interfaces/task/quizSubmission";

export const submitQuiz = async (req: Request, res: Response): Promise<any> => {
  try {
    const {
      quizId,
      quizTitle,
      batch,
      course,
      answers,
      correctAnswers,
      totalQuestions,
      score,
      submittedAt,
    } = req.body;

    // Validation
    if (
      !quizId ||
      !quizTitle ||
      !batch ||
      !course ||
      !answers ||
      !correctAnswers ||
      !totalQuestions ||
      !score ||
      !submittedAt
    ) {
      return res.status(400).json({ message: "All fields are required" });
    }
    const userId = req.user?.id;
    // Check if already submitted
    const existingSubmission = await QuizSubmission.findOne({
      quizId: quizId,
      user: userId,
      course: course,
      batch: batch,
    });
    if (existingSubmission) {
      return res.status(409).json({ message: "Quiz already submitted" });
    }
    // Save new submission
    const newSubmission = new QuizSubmission({
      quizId,
      quizTitle,
      user: userId,
      batch,
      course,
      answers,
      correctAnswers,
      totalQuestions,
      score,
      submittedAt,
    });

    await newSubmission.save();
    res.status(200).json({
      message: "Quiz submitted and performance updated successfully",
      submission: newSubmission,
    });
  } catch (error) {
    console.error("Error submitting quiz:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

// Get my submissions
export const getMyQuizSubmissions = async (
  req: Request,
  res: Response
): Promise<any> => {
  try {
    const userId = req.user?.id;
    const quizId = req.params.quizId;

    if (!userId) {
      return res.status(400).json({ message: "User ID not found in token" });
    }
    const submissions = await QuizSubmission.find({
      user: userId,
      quizId,
    });
    res.status(200).json({ submissions });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to fetch user submissions", error });
  }
};

export const getMyQuiz = async (req: Request, res: Response): Promise<any> => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(400).json({ message: "User ID not found in token" });
    }

    const submissions = (await QuizSubmission.find({ user: userId })
      .populate("course", "title")
      .lean()) as unknown as PopulatedSubmission[];

    const user = await User.findOne({ _id: userId }).lean();
    const name = user?.name || "N/A";

    const formatted = submissions.map((sub) => {
      return {
        id: sub._id,
        courseName: sub.course.title || "N/A",
        studentName: name || "N/A",
        quizTitle: sub.quizTitle,
        batch: sub.batch,
        answers: sub.answers.length,
        correctAnswers: sub.correctAnswers,
        totalQuestions: sub.totalQuestions,
        score: sub.score,
        submittedAt: sub.submittedAt,
        isSubmitted: true,
      };
    });

    res.status(200).json({ quizData: formatted });
  } catch (error) {
    console.error("Quiz fetch error:", error);
    res
      .status(500)
      .json({ message: "Failed to fetch user submissions", error });
  }
};

export const getAllQuizLeaderboards = async (req: Request, res: Response) => {
  try {
    const submissions = (await QuizSubmission.find({})
      .populate("user", "name")
      .populate("course", "title")
      .lean()) as unknown as IPopulatedSubmission[];

    const grouped: Record<string, TLeaderboardEntry & { percentage: number }> =
      {};

    submissions.forEach((sub) => {
      const key = `${sub.user._id}-${sub.course._id}-${sub.batch}`;

      if (!grouped[key]) {
        grouped[key] = {
          name: sub.user.name,
          courseName: sub.course.title,
          batch: sub.batch,
          totalScore: 0,
          totalMarks: 0,
          percentage: 0,
        };
      }

      grouped[key].totalScore += sub.score;
      grouped[key].totalMarks += sub.totalQuestions * 1;
    });

    // Calculate percentage
    const result = Object.values(grouped).map((entry) => {
      entry.percentage = (entry.totalMarks / entry.totalScore) * 100;
      return entry;
    });

    // Sort by percentage descending
    result.sort((a, b) => b.percentage - a.percentage);

    const finalResult = result.map((entry, index) => ({
      rank: index + 1,
      name: entry.name,
      courseName: entry.courseName,
      quiz: `${entry.totalMarks}/${entry.totalScore}`,
      percentage: entry.percentage.toFixed(2) + "%",
      batch: `${entry.batch}`,
    }));

    res.status(200).json({
      success: true,
      message: "All quiz data retrieved",
      data: finalResult,
    });
  } catch (error) {
    console.error("Leaderboard fetch error:", error);
    res.status(500).json({ message: "Server Error" });
  }
};
