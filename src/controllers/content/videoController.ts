import { Request, Response } from "express";
import UnlockedContent from "../../models/content/UnlockedContent";
import { User } from "../../models/auth/UserModel";

export const unlockContent = async (
  req: Request,
  res: Response
): Promise<any> => {
  const { userId, courseId, contentId, batch } = req.body;

  if (!userId || !courseId || !contentId) {
    return res.status(400).json({ message: "Missing required fields" });
  }

  try {
    // Check if already unlocked
    const existing = await UnlockedContent.findOne({
      userId,
      courseId,
      batch,
      unlockedContents: { $in: [contentId] },
    });

    if (existing) {
      return res.status(200).json({
        message: "Content already unlocked",
        data: existing,
      });
    }

    // Unlock content
    const updated = await UnlockedContent.findOneAndUpdate(
      { userId, courseId, batch },
      {
        $addToSet: { unlockedContents: contentId },
        $setOnInsert: { userId, courseId, batch },
      },
      {
        new: true,
        upsert: true,
      }
    );
    console.log(updated, "un");

    return res.status(201).json({
      message: "Content unlocked successfully",
      data: updated,
    });
  } catch (error) {
    console.error("Unlock error:", error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    return res
      .status(500)
      .json({ message: "Server error", error: errorMessage });
  }
};

export const accessVideo = async (
  req: Request,
  res: Response
): Promise<any> => {
  const { courseId, userId, batch } = req.query;
  if (!courseId || !userId) {
    return res.status(400).json({ message: "Missing required fields" });
  }

  try {
    const unlocked = await UnlockedContent.findOne({ courseId, userId, batch });

    if (!unlocked) {
      return res.status(200).json({ unlockedContents: [] });
    }

    // Ensure only _id array is returned
    return res.status(200).json({
      message: "Access granted",
      unlockedContents: unlocked.unlockedContents.map((c) => c.toString()),
    });
  } catch (error) {
    return res.status(500).json({
      message: "Server error",
      error: error instanceof Error ? error.message : String(error),
    });
  }
};

export const getUnlockedContentCounts = async (
  req: Request,
  res: Response
): Promise<any> => {
  try {
    const userId = req.user?.id;
    const courseId = req.params.courseId;

    if (!userId) {
      return res.status(400).json({ message: "User ID is required" });
    }

    // Get user with their batchWisePerformance
    const user = await User.findById(userId)
      .select("userId batchWisePerformance")
      .populate({
        path: "batchWisePerformance.course",
        select: "title",
      })
      .lean();

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Get all unlocked contents for this user
    const unlockedContents = await UnlockedContent.find({ courseId, userId })
      .select("courseId unlockedContents")
      .lean();

    // Process each batch performance to add unlocked content count
    const batchPerformanceWithCounts = user.batchWisePerformance?.map(
      (batch: any) => {
        // Find unlocked contents for this course
        const courseUnlocked = unlockedContents.find(
          (uc) => uc.courseId.toString() === batch.course?._id?.toString()
        );

        const unlockedContentCount =
          courseUnlocked?.unlockedContents?.length || 0;

        return {
          courseId: batch.course?._id || courseId,
          batch: batch.batch,
          unlockedContentCount,
        };
      }
    );

    return res.status(200).json({
      success: true,
      data: batchPerformanceWithCounts,
    });
  } catch (error) {
    console.error("Error fetching unlocked content counts:", error);
    return res.status(500).json({
      success: false,
      message: "Error fetching unlocked content counts",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};
