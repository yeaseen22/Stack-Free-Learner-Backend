// controllers/leaderboardController.ts

import { Request, Response } from "express";
import { User } from "../../models/auth/UserModel";

export const getLeaderboard = async (
  req: Request,
  res: Response
): Promise<any> => {
  try {
    const limit = 10;
    const fullMark = 1200;

    const leaderboard = await User.aggregate([
      {
        $unwind: {
          path: "$batchWisePerformance",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $addFields: {
          batch: "$batchWisePerformance.batch",
          course: "$batchWisePerformance.course",
          quizMark: {
            $cond: {
              if: { $isArray: "$batchWisePerformance.quiz" },
              then: { $sum: "$batchWisePerformance.quiz" },
              else: 0,
            },
          },
          assignmentMark: {
            $cond: {
              if: { $isArray: "$batchWisePerformance.assignment" },
              then: { $sum: "$batchWisePerformance.assignment" },
              else: 0,
            },
          },
        },
      },
      {
        $addFields: {
          totalMark: { $add: ["$quizMark", "$assignmentMark"] },
        },
      },
      {
        $addFields: {
          percentage: {
            $round: [
              {
                $multiply: [{ $divide: ["$totalMark", fullMark] }, 100],
              },
              2,
            ],
          },
          level: {
            $switch: {
              branches: [
                {
                  case: {
                    $gte: [
                      {
                        $multiply: [{ $divide: ["$totalMark", fullMark] }, 100],
                      },
                      80,
                    ],
                  },
                  then: "Advanced",
                },
                {
                  case: {
                    $gte: [
                      {
                        $multiply: [{ $divide: ["$totalMark", fullMark] }, 100],
                      },
                      50,
                    ],
                  },
                  then: "Intermediate",
                },
              ],
              default: "Beginner",
            },
          },
        },
      },

      // ✅ Lookup course title from courseId
      {
        $lookup: {
          from: "courses",
          localField: "course",
          foreignField: "_id",
          as: "courseInfo",
        },
      },
      {
        $unwind: {
          path: "$courseInfo",
          preserveNullAndEmptyArrays: true,
        },
      },

      {
        $project: {
          name: 1,
          email: 1,
          profileImage: 1,
          course: "$courseInfo.title", // ✅ populated course title
          batch: 1,
          totalQuizMark: "$quizMark",
          totalAssignmentMark: "$assignmentMark",
          totalMark: 1,
          percentage: 1,
          level: 1,
        },
      },

      {
        $sort: { totalMark: -1 },
      },
      {
        $limit: limit,
      },
    ]);

    return res.status(200).json({
      success: true,
      message: `Top ${limit} users fetched successfully.`,
      data: leaderboard,
    });
  } catch (error) {
    console.error("Leaderboard fetch failed:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch leaderboard. Please try again later.",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};
