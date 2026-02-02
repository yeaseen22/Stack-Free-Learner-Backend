import { Request, Response } from "express";
import { User } from "../../models/auth/UserModel";
import { comparePassword, hashPassword } from "../../utils/hashPassword";
import { Enrollment } from "../../models/course/EnrollmentModel";
import { getAllProfileLevels } from "../../helpers/getProfileTypeWithUnlock";
import { getPercentageChange } from "../../helpers/getPercentageChange";

export const getAllUsers = async (
  req: Request,
  res: Response
): Promise<any> => {
  try {
    const users = await User.find().select("-password");

    if (!users || users.length === 0) {
      return res.status(404).json({ message: "No users found" });
    }

    // সব ইউজারের জন্য Enrollments খুঁজে বের করা
    const userIds = users.map((user) => user._id);
    const enrollments = await Enrollment.find({
      user: { $in: userIds },
    }).populate({
      path: "course",
    });

    // ইউজারভিত্তিক এনরোলমেন্ট সাজানো
    const enrollmentMap = new Map();

    for (const enrollment of enrollments) {
      const uid = enrollment.user.toString();

      if (!enrollmentMap.has(uid)) {
        enrollmentMap.set(uid, []);
      }

      enrollmentMap.get(uid).push({
        enrollmentId: enrollment._id,
        course_title:
          enrollment.course &&
          typeof enrollment.course === "object" &&
          "title" in enrollment.course
            ? (enrollment.course as any).title
            : undefined,

        course_fee: enrollment?.amount,
        batch: enrollment.batch,
        enrollDate: enrollment.enrolledAt,
      });
    }

    return res.status(200).json({
      success: true,
      users: users.map((user) => ({
        id: user._id,
        name: user.name,
        role: user.role,
        email: user.email,
        profileImage: user.profileImage,
        isBlocked: user.isBlocked,
        reg_no: user.userId,
        gender: user?.gender,
        phone: user.phone,
        country: user.country,
        district: user.district,
        address: user.address,
        enrolledCourses: enrollmentMap.get(user._id.toString()) || [],
      })),
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error fetching users",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

export const getUserById = async (
  req: Request,
  res: Response
): Promise<any> => {
  try {
    const { id } = req.query;

    if (!id || typeof id !== "string") {
      return res.status(400).json({ message: "User ID is required" });
    }

    const user = await User.findById(id).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Fetch enrollments and populate course data
    const enrollments = await Enrollment.find({ user: user._id }).populate({
      path: "course",
      populate: {
        path: "batchData",
      },
    });

    const enrolledCourses = enrollments.map((enrollment) => ({
      enrollmentId: enrollment._id,
      course_title: (enrollment.course as any)?.title || "N/A",
      course_fee: enrollment.amount,
      batch: (enrollment.course as any)?.batchData?.[0]?.batchNo || "N/A",
      enrollDate: enrollment.enrolledAt,
    }));

    // Extract performance data if available
    const performances = user.batchWisePerformance || [];
    const performanceData = performances.map((perf) => ({
      course: perf?.course,
      batch: perf?.batch,
      assignment: perf.assignment,
      quiz: perf.quiz,
      stone: perf.stone,
      totalMarks: perf.totalMark,
    }));

    return res.status(200).json({
      success: true,
      user: {
        id: user._id,
        profileImage: user.profileImage,
        role: user.role,
        isBlocked: user.isBlocked,
        name: user.name,
        email: user.email,
        reg_no: user.userId,
        gender: user.gender,
        phone: user.phone,
        country: user.country,
        district: user.district,
        address: user.address,
        performance: performanceData,
        enrolledCourses,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error fetching user",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

export const updateUserPerformanceByBatchId = async (
  req: Request,
  res: Response
): Promise<any> => {
  const { id, batchId } = req.params;
  const { assignment, quiz, stone } = req.body;

  try {
    // Fetch the user first
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    const perf = user.batchWisePerformance?.find((p: any) => p._id == batchId);
    if (!perf) {
      return res
        .status(404)
        .json({ message: "No matching performance found for that batchId." });
    }

    // Update stone (sum with previous)
    if (typeof stone === "number") {
      perf.stone = (perf.stone || 0) + stone;
    }

    // Push assignment and quiz if provided and are arrays
    if (Array.isArray(assignment)) {
      perf.assignment = [...(perf.assignment || []), ...assignment];
    } else if (assignment !== undefined) {
      perf.assignment = [...(perf.assignment || []), assignment];
    }

    if (Array.isArray(quiz)) {
      perf.quiz = [...(perf.quiz || []), ...quiz];
    } else if (quiz !== undefined) {
      perf.quiz = [...(perf.quiz || []), quiz];
    }

    // Optionally recalculate totalMark if needed
    if (
      typeof perf.stone === "number" &&
      Array.isArray(perf.assignment) &&
      Array.isArray(perf.quiz)
    ) {
      perf.totalMark =
        perf.stone +
        perf.assignment.reduce(
          (a: number, b: number) => a + (typeof b === "number" ? b : 0),
          0
        ) +
        perf.quiz.reduce(
          (a: number, b: number) => a + (typeof b === "number" ? b : 0),
          0
        );
    }

    await user.save();

    res.status(200).json({ message: "Performance updated successfully." });
  } catch (err) {
    console.error("Update error:", err);
    res.status(500).json({ message: "Internal server error." });
  }
};

export const getMe = async (req: Request, res: Response): Promise<any> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(400).json({ message: "User ID not found in token" });
    }

    const user = await User.findById(userId)
      .populate({
        path: "batchWisePerformance.course",
        select: "title",
      })
      .populate({
        path: "enrolledCourses",
        select: "title",
      })
      .lean();

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }



    const enrichedBatchPerformance = user.batchWisePerformance?.map(
      (batch: any) => {
        const quizTotal =
          batch.quiz?.reduce((a: number, b: number) => a + b, 0) || 0;
        const assignmentTotal =
          batch.assignment?.reduce((a: number, b: number) => a + b, 0) || 0;
        const totalMark = quizTotal + assignmentTotal;
        const currentDate = new Date(batch.startedAt);
        const previousWeekDate = new Date(currentDate);
        previousWeekDate.setDate(previousWeekDate.getDate() - 7);

        if (!user.batchWisePerformance) {
          user.batchWisePerformance = [];
        }

        // 🔄 Find previous week's performance for same course + previous batch
        const previous = user.batchWisePerformance.find(
          (p: any) =>
            p.course?._id?.toString() === batch.course?._id?.toString() &&
            p.batch === batch.batch - 1
        );

        const prevQuiz =
          previous?.quiz?.reduce((a: number, b: number) => a + b, 0) || 0;
        const prevAssignment =
          previous?.assignment?.reduce((a: number, b: number) => a + b, 0) || 0;
        const prevTotalMark = prevQuiz + prevAssignment;
        const prevStone = previous?.stone || 0;

        const comparison = {
          assignment: getPercentageChange(assignmentTotal, prevAssignment),
          quiz: getPercentageChange(quizTotal, prevQuiz),
          stone: getPercentageChange(batch.stone, prevStone),
          totalMark: getPercentageChange(totalMark, prevTotalMark),
        };

        return {
          ...batch,
          courseTitle: batch.course?.title || "Unknown Course",
          totalMark,
          profileLevels: getAllProfileLevels(totalMark),
          comparison, // 🔄 Add the comparison object
        };
      }
    );

    return res.status(200).json({
      success: true,
      user: {
        ...user,
        batchWisePerformance: enrichedBatchPerformance,
      },
    });
  } catch (error) {
    console.error("Error fetching user profile:", error);
    return res.status(500).json({
      success: false,
      message: "Error fetching user profile",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

export const updateUser = async (req: Request, res: Response): Promise<any> => {
  try {
    const { userId } = req.params;
    if (!userId) {
      return res.status(400).json({ message: "User ID is required" });
    }
    const { name, phone, country, district, address, gender, profileImage } =
      req.body;

    const user = await User.findOne({ userId });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (name !== undefined) user.name = name;
    if (phone !== undefined) user.phone = phone;
    if (country !== undefined) user.country = country;
    if (district !== undefined) user.district = district;
    if (address !== undefined) user.address = address;
    if (gender !== undefined) user.gender = gender;
    if (profileImage !== undefined) user.profileImage = profileImage;

    await user.save();
    return res.status(200).json({
      success: true,
      message: "User updated successfully",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        country: user.country,
        district: user.district,
        address: user.address,
        gender: user.gender,
        profileImage: user.profileImage,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error updating user",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

export const updatePassword = async (
  req: Request,
  res: Response
): Promise<any> => {
  try {
    const { userId } = req.params;
    if (!userId) {
      return res.status(400).json({ message: "User ID is required" });
    }
    const { oldPass, password } = req.body;

    if (!oldPass || !password) {
      return res
        .status(400)
        .json({ message: "Old password and new password are required" });
    }

    const user = await User.findOne({ userId });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Verify old password
    const isMatch = await comparePassword(oldPass, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Old password is incorrect" });
    }

    // Hash new password and update
    user.password = await hashPassword(password, 10);

    await user.save();
    return res.status(200).json({
      success: true,
      message: "Password updated successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error updating password",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

export const deleteUser = async (req: Request, res: Response): Promise<any> => {
  try {
    const { userId } = req.params;
    if (!userId) {
      return res.status(400).json({ message: "User ID is required" });
    }

    const user = await User.findByIdAndDelete(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    return res.status(200).json({
      success: true,
      message: "User deleted successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error deleting user",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

export const blockStudent = async (
  req: Request,
  res: Response
): Promise<any> => {
  try {
    const { studentId } = req.params;

    if (!studentId) {
      return res.status(400).json({ message: "Student ID is required" });
    }
    const user = await User.findById(studentId);
    if (!user) {
      return res.status(404).json({ message: "Student not found" });
    }
    user.isBlocked = !user.isBlocked;
    await user.save();
    return res.status(200).json({
      success: true,
      message: `Student has been ${
        user.isBlocked ? "blocked" : "unblocked"
      } successfully`,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        isBlocked: user.isBlocked,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error toggling student block status",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};
