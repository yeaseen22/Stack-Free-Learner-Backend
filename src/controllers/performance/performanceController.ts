import { Request, Response } from "express";
import { User } from "../../models/auth/UserModel";
import { AssignmentSubmission } from "../../models/task/AssignmentSubmission";
import QuizSubmission from "../../models/task/QuizModel";
import { calculatePercentageChange } from "../../helpers/calculatePercentageChange";
import { getAllProfileLevels } from "../../helpers/getProfileTypeWithUnlock";
import { getPercentageChange } from "../../helpers/getPercentageChange";
import mongoose from "mongoose";
import { TPerformanceItem } from "../../interfaces/performance/PerformanceInterface";

export const compareWeeklyPerformance = async (
  req: Request,
  res: Response
): Promise<any> => {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId);
    if (
      !user ||
      !user.batchWisePerformance ||
      user.batchWisePerformance.length === 0
    ) {
      return res
        .status(404)
        .json({ message: "Performance data not found for this user" });
    }

    const performances = user.batchWisePerformance;

    // Get the last two records
    const sorted = performances.sort(
      (a: any, b: any) =>
        new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    );

    if (sorted.length < 2) {
      return res
        .status(400)
        .json({ message: "Not enough performance data to compare" });
    }

    const currentWeek = sorted[0];
    const lastWeek = sorted[1];

    // Helper to sum array or return number as is
    const getNumber = (val: number | number[]) =>
      Array.isArray(val) ? val.reduce((a, b) => a + b, 0) : val;

    const comparison = {
      assignment: calculatePercentageChange(
        getNumber(currentWeek.assignment),
        getNumber(lastWeek.assignment)
      ),
      quiz: calculatePercentageChange(
        getNumber(currentWeek.quiz),
        getNumber(lastWeek.quiz)
      ),
      stone: calculatePercentageChange(
        getNumber(currentWeek.stone),
        getNumber(lastWeek.stone)
      ),
      totalMark: calculatePercentageChange(
        getNumber(currentWeek.totalMark),
        getNumber(lastWeek.totalMark)
      ),
    };

    res.status(200).json({
      message: "Weekly performance comparison fetched",
      currentWeek,
      lastWeek,
      comparison,
    });
  } catch (error) {
    console.error("Error in weekly performance comparison:", error);
    res.status(500).json({ message: "Server error", error });
  }
};

export const getStudentPerformance = async (
  req: Request,
  res: Response
): Promise<any> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(400).json({ message: "User ID not found in token" });
    }

    // Get user with enrolled courses
    const user = await User.findById(userId)
      .populate({
        path: "enrolledCourses",
        select: "title",
      })
      .lean();

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Get all assignment submissions for the user
    const assignmentSubmissions = await AssignmentSubmission.find({
      user: userId,
    }).lean();

    // Get all quiz submissions for the user
    const quizSubmissions = await QuizSubmission.find({
      user: userId,
    }).lean();

    // Group submissions by course and batch
    const performanceMap = new Map<string, any>();

    // Process assignment submissions
    assignmentSubmissions.forEach((submission) => {
      const key = `${submission.course}_${submission.batch}`;
      if (!performanceMap.has(key)) {
        performanceMap.set(key, {
          _id: new mongoose.Types.ObjectId(),
          course: submission.course,
          batch: submission.batch,
          assignmentSubmissionIds: [],
          quizSubmissionIds: [],
          assignmentTotal: 0,
          quizTotal: 0,
          stone: 0, // TODO: Caluculate Added stone
          totalMark: 0,
        });
      }
      const performance = performanceMap.get(key);
      performance.assignmentSubmissionIds.push(submission._id);
      performance.assignmentTotal += submission.mark || 0;
      performance.totalMark += submission.mark || 0;
    });

    // Process quiz submissions
    quizSubmissions.forEach((submission) => {
      const key = `${submission.course}_${submission.batch}`;
      if (!performanceMap.has(key)) {
        performanceMap.set(key, {
          _id: new mongoose.Types.ObjectId(),
          course: submission.course,
          batch: submission.batch,
          assignmentSubmissionIds: [],
          quizSubmissionIds: [],
          assignmentTotal: 0,
          quizTotal: 0,
          stone: 0, // TODO: Caluculate Added stone
          totalMark: 0,
        });
      }
      const performance = performanceMap.get(key);
      performance.quizSubmissionIds.push(submission._id);
      performance.quizTotal += submission.score;
      performance.totalMark += submission.score;
    });

    // Convert map to array and populate course titles
    const performanceData: TPerformanceItem[] = Array.from(
      performanceMap.values()
    ).map((item) => {
      const course = (user.enrolledCourses as any[]).find(
        (c) => c._id.toString() === item.course.toString()
      );

      return {
        course: {
          _id: item.course,
          title: (course as any)?.title || "Unknown Course",
        },
        batch: item.batch,
        assignmentSubmissionIds: item.assignmentSubmissionIds,
        quizSubmissionIds: item.quizSubmissionIds,
        assignmentTotal: item.assignmentTotal,
        quizTotal: item.quizTotal,
        stone: item.stone,
        totalMark: item.totalMark,
        profileLevels: getAllProfileLevels(item.totalMark),
      };
    });

    // Sort by course and batch
    performanceData.sort((a, b) => {
      if (a.course._id.toString() === b.course._id.toString()) {
        return a.batch.number - b.batch.number;
      }
      return a.course._id.toString().localeCompare(b.course._id.toString());
    });

    // Add comparison data between batches
    for (let i = 1; i < performanceData.length; i++) {
      const current = performanceData[i];
      const previous = performanceData[i - 1];

      // Only compare if it's the same course and consecutive batches
      if (
        current.course._id.toString() === previous.course._id.toString() &&
        current.batch.number === previous.batch.number + 1
      ) {
        current.comparison = {
          assignment: getPercentageChange(
            current.assignmentTotal,
            previous.assignmentTotal
          ),
          quiz: getPercentageChange(current.quizTotal, previous.quizTotal),
          stone: getPercentageChange(current.stone, previous.stone),
          totalMark: getPercentageChange(current.totalMark, previous.totalMark),
        };
      } else {
        // Add default comparison for first batch
        current.comparison = {
          assignment: getPercentageChange(current.assignmentTotal, 0),
          quiz: getPercentageChange(current.quizTotal, 0),
          stone: getPercentageChange(current.stone, 0),
          totalMark: getPercentageChange(current.totalMark, 0),
        };
      }
    }

    // Ensure first item has comparison data
    if (performanceData.length > 0 && !performanceData[0].comparison) {
      performanceData[0].comparison = {
        assignment: getPercentageChange(performanceData[0].assignmentTotal, 0),
        quiz: getPercentageChange(performanceData[0].quizTotal, 0),
        stone: getPercentageChange(performanceData[0].stone, 0),
        totalMark: getPercentageChange(performanceData[0].totalMark, 0),
      };
    }

    return res.status(200).json({
      success: true,
      data: performanceData,
    });
  } catch (error) {
    console.error("Failed to fetch performance:", error);
    res.status(500).json({ message: "Failed to fetch performance", error });
  }
};
