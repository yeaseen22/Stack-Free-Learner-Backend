import { Request, Response } from "express";
import { User } from "../../models/auth/UserModel";
import { Enrollment } from "../../models/course/EnrollmentModel";
import { Course } from "../../models/course/CourseModel";
import Batch from "../../models/course/BatchModel";
import { formatDate } from "../../helpers/formatDate";
import { ICourse } from "../../interfaces/course/courseInterface";
import { IUser } from "../../interfaces/auth/userInterface";
import { AssignmentSubmission } from "../../models/task/AssignmentSubmission";
import QuizSubmission from "../../models/task/QuizModel";

export const adminStats = async (req: Request, res: Response): Promise<any> => {
  try {
    const totalStudents = await User.countDocuments({ role: "student" });
    const totalActiveStudents = await User.countDocuments({
      role: "student",
      isBlocked: false,
      enrolledCourses: { $exists: true, $not: { $size: 0 } },
    });
    const totalPayments = await Enrollment.countDocuments({
      status: "success",
    });
    const totalInstructors = await User.countDocuments({ role: "instructor" });
    const totalCourses = await Course.countDocuments();
    const activeBatchs = await Batch.countDocuments({ status: "active" });
    const certificates = await Enrollment.countDocuments({
      isComplete: "true",
    });

    const revenue = await Enrollment.aggregate([
      {
        $match: { status: "success" },
      },
      {
        $group: { _id: null, total: { $sum: "$amount" } },
      },
    ]);

    const totalRevenue = revenue[0]?.total || 0;

    // Monthy Growth calculation
    const currentDate = new Date();
    const firstDayOfThisMonth = new Date(
      Date.UTC(currentDate.getFullYear(), currentDate.getMonth(), 1)
    );
    const firstDayOfLastMonth = new Date(
      Date.UTC(currentDate.getFullYear(), currentDate.getMonth() - 1, 1)
    );
    const lastDayOfLastMonth = new Date(
      Date.UTC(currentDate.getFullYear(), currentDate.getMonth(), 0)
    );

    const thisMonthEnrollments = await Enrollment.find({
      status: "success",
      enrolledAt: { $gte: firstDayOfThisMonth, $lte: currentDate },
    });

    const lastMonthEnrollments = await Enrollment.find({
      status: "success",
      enrolledAt: { $gte: firstDayOfLastMonth, $lte: lastDayOfLastMonth },
    });

    const thisMonthRevenue = thisMonthEnrollments.reduce(
      (sum, item) => sum + (item.amount || 0),
      0
    );
    const lastMonthRevenue = lastMonthEnrollments.reduce(
      (sum, item) => sum + (item.amount || 0),
      0
    );

    let revenueGrowthPercentage = 0;

    if (lastMonthRevenue > 0) {
      revenueGrowthPercentage =
        (thisMonthRevenue - lastMonthRevenue) / lastMonthRevenue;
    }

    // If growth is negative, set it to 0
    const displayGrowthPercentage = Math.max(0, revenueGrowthPercentage);

    // Revenue Trend Data (Jan to Dec of current year)
    const currentYear = currentDate.getFullYear();
    const startDate = new Date(Date.UTC(currentYear, 0, 1)); // Jan 1st
    const endDate = new Date(Date.UTC(currentYear, 11, 31)); // Dec 31st

    const revenueTrend = await Enrollment.aggregate([
      {
        $match: {
          status: "success",
          enrolledAt: { $gte: startDate, $lte: endDate },
        },
      },
      {
        $group: {
          _id: { $month: "$enrolledAt" },
          revenue: { $sum: "$amount" },
          payments: { $sum: 1 },
          students: { $addToSet: "$user" },
        },
      },
      {
        $sort: { _id: 1 },
      },
      {
        $project: {
          month: {
            $arrayElemAt: [
              [
                "",
                "Jan",
                "Feb",
                "Mar",
                "Apr",
                "May",
                "Jun",
                "Jul",
                "Aug",
                "Sep",
                "Oct",
                "Nov",
                "Dec",
              ],
              "$_id",
            ],
          },
          revenue: 1,
          payments: 1,
          students: { $size: "$students" },
        },
      },
    ]);

    // Initialize revenueData with all months (Jan to Dec)
    const months = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];
    const revenueData = months.map((month) => ({
      month,
      revenue: 0,
      payments: 0,
      students: 0,
    }));

    // Populate revenueData with actual values
    revenueTrend.forEach((item) => {
      const monthIndex = months.indexOf(item.month);
      if (monthIndex !== -1) {
        revenueData[monthIndex] = {
          month: item.month,
          revenue: item.revenue,
          payments: item.payments,
          students: item.students,
        };
      }
    });

    return res.status(200).json({
      success: true,
      message: "Admin stats retrieved successfully",
      data: {
        stats: {
          totalStudents,
          totalActiveStudents,
          totalInstructors,
          totalCourses,
          activeBatchs,
          certificates,
          totalPayments,
          totalRevenue,
          thisMonthRevenue,
          revenueGrowthPercentage: parseFloat(
            displayGrowthPercentage.toFixed(2)
          ),
          revenueData,
        },
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error to fetch data",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

export const getAllTransactions = async (
  req: Request,
  res: Response
): Promise<any> => {
  try {
    const transactions = await Enrollment.find({ status: "success" })
      .populate<{ course: ICourse }>({
        path: "course",
        select: "title",
      })
      .sort({ enrolledAt: -1 });

    const formatted = transactions.map((txn) => ({
      transactionId: txn.transactionId || txn._id.toString(),
      student: txn.student_name,
      course: txn.course?.title,
      amount: txn.amount,
      method: txn?.payment_method,
      status: txn.status,
      date: formatDate(txn.enrolledAt),
      batch: txn.batch,
    }));

    return res.status(200).json({
      success: true,
      message: "Transactions retrieved successfully",
      data: formatted,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error retrieving transactions",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

export const allStudentInfo = async (
  req: Request,
  res: Response
): Promise<any> => {
  try {
    const totalStudents = await User.countDocuments({ role: "student" });
    const totalCourses = await Course.countDocuments();
    const courses = await Course.find({}, "title enrolledCount");

    // Fetch enrollments
    const enrollments = await Enrollment.find({})
      .populate<{ course: ICourse }>({
        path: "course",
        select: "title",
      })
      .populate<{ user: IUser }>({
        path: "user",
        select: "_id name userId gender district",
      })
      .sort({ enrolledAt: -1 });

    // build course -> batch mapping
    const courseBatchesMap: Record<string, Set<number>> = {};
    enrollments.forEach((enroll) => {
      const courseTitle = enroll.course?.title;
      const batch = enroll.batch;

      if (courseTitle && batch) {
        if (!courseBatchesMap[courseTitle]) {
          courseBatchesMap[courseTitle] = new Set();
        }
        courseBatchesMap[courseTitle].add(batch);
      }
    });

    const courseData = courses.map((course) => ({
      courseName: course.title,
      enrolledCount: course.enrolledCount || 0,
      batches: Array.from(courseBatchesMap[course.title] || []),
    }));

    // Map all student info
    const allInfo = enrollments.map((enroll) => ({
      id: enroll.user?._id || "N/A",
      name: enroll.user?.name || "N/A",
      regNo: enroll.user?.userId || "N/A",
      gender: enroll.user?.gender || "N/A",
      district: enroll.user?.district || "N/A",
      course: enroll.course?.title || "N/A",
      enrollDate: formatDate(enroll.enrolledAt),
      fee: enroll.amount || 0,
      batch: enroll.batch || "N/A",
    }));

    return res.status(200).json({
      success: true,
      message: "All student info retrieved successfully",
      data: {
        stats: {
          totalStudents,
          totalCourses,
          courseData,
        },
        allInfo,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error retrieving student info",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

export const changeUserRole = async (
  req: Request,
  res: Response
): Promise<any> => {
  try {
    // Support both URL parameter and body parameter
    const userId = req.params.userId || req.body.userId;
    const { newRole } = req.body;

    if (!userId || !newRole) {
      return res.status(400).json({
        success: false,
        message: "userId and newRole are required",
      });
    }

    const loggedInUserId = req.user?.id;
    if (!loggedInUserId) {
      return res.status(400).json({ message: "User ID not found in token" });
    }

    // Prevent logged-in user from changing their own role
    if (loggedInUserId === userId) {
      return res.status(403).json({
        success: false,
        message: "You cannot change your own role",
      });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Check if the user already has the same role
    if (user.role === newRole) {
      return res.status(400).json({
        success: false,
        message: "User already has this role",
      });
    }

    // Update only the role field to avoid validation issues
    await User.findByIdAndUpdate(
      userId,
      { role: newRole },
      { new: true, runValidators: false }
    );

    return res.status(200).json({
      success: true,
      message: "User role updated successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error updating user role",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

export const getSpecificSubmission = async (
  req: Request,
  res: Response
): Promise<any> => {
  try {
    const userId = req.params.id;

    if (!userId) {
      return res.status(400).json({ message: "User ID not provided" });
    }

    const assignmentSubmissions = await AssignmentSubmission.find({
      user: userId,
      isSubmitted: true,
    }).populate({
      path: "course",
      select: "title",
    });

    const quizSubmissions = await QuizSubmission.find({
      user: userId,
    }).populate({
      path: "course",
      select: "title",
    });

    // Calculate total counts
    const totalAssignments = assignmentSubmissions.length;
    const totalQuizzes = quizSubmissions.length;

    // Group assignments by course + batch
    const groupedAssignments: Record<string, any[]> = {};
    assignmentSubmissions.forEach((submission) => {
      const course = submission.course as unknown as ICourse;
      const key = `${course?.title}__${submission.batch}`;

      if (!groupedAssignments[key]) {
        groupedAssignments[key] = [];
      }

      groupedAssignments[key].push({
        assignmentTitle: submission.assignmentTitle || "Untitled",
        assignmentId: submission._id || "N/A",
        assignmentNo: submission.assignmentNo || "N/A",
        assignmentMark: submission.mark,
      });
    });

    // Group quizzes by course + batch
    const groupedQuizzes: Record<string, any[]> = {};
    quizSubmissions.forEach((submission) => {
      const course = submission.course as unknown as ICourse;
      const key = `${course?.title}__${submission.batch}`;

      if (!groupedQuizzes[key]) {
        groupedQuizzes[key] = [];
      }

      groupedQuizzes[key].push({
        quizTitle: submission.quizTitle || "Untitled",
        quizScore: submission.score || "N/A",
      });
    });

    // Combine course + batch-wise results
    const mergedSubmissions: any[] = [];

    const allKeys = new Set([
      ...Object.keys(groupedAssignments),
      ...Object.keys(groupedQuizzes),
    ]);

    allKeys.forEach((key) => {
      const [courseTitle, batch] = key.split("__");
      mergedSubmissions.push({
        courseTitle,
        batch,
        assignments: groupedAssignments[key] || [],
        quizzes: groupedQuizzes[key] || [],
        assignmentCount: groupedAssignments[key]?.length || 0,
        quizCount: groupedQuizzes[key]?.length || 0,
      });
    });

    return res.status(200).json({
      success: true,
      message: "Submission summary retrieved",
      totalAssignments,
      totalQuizzes,
      submissions: mergedSubmissions,
    });
  } catch (error) {
    console.error("Error fetching submissions:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while fetching submissions",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};
