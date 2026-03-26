import { Request, Response } from "express";
import { Types } from "mongoose";
import { ManualPayment } from "../../models/payment/manualPaymentModel";
import { Course } from "../../models/course/CourseModel";
import { Enrollment } from "../../models/course/EnrollmentModel";
import { IUser } from "../../interfaces/auth/userInterface";
import { ICourse } from "../../interfaces/course/courseInterface";
import { formatDate } from "../../helpers/formatDate";

export const createManualPayment = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ message: "Unauthorized: User not found" });
      return;
    }

    const courseId = req.params.courseId;
    const batchNo = Number(req.params.batchNo);
    const { transactionId, paymentPhoneNumber, method } = req.body;

    if (
      !paymentPhoneNumber ||
      !transactionId ||
      !method ||
      !courseId ||
      isNaN(batchNo)
    ) {
      res.status(400).json({ message: "All fields are required" });
      return;
    }

    // Get course to fetch price
    const course = await Course.findById(courseId);
    if (!course) {
      res.status(404).json({ message: "Course not found" });
      return;
    }

    const amount = course.price;
    if (!amount) {
      res.status(400).json({ message: "Course has no price defined" });
      return;
    }

    const payment = await ManualPayment.create({
      paymentPhoneNumber,
      transactionId,
      amount,
      method,
      course: courseId,
      batchNo,
      user: userId,
      status: "pending",
    });

    res.status(201).json({
      message: "Manual payment submitted successfully",
      data: payment,
    });
  } catch (error) {
    console.error("Error creating manual payment:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const approveManualPaymentAndEnroll = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { paymentId } = req.params;

    // Find the manual payment
    const payment = await ManualPayment.findById(paymentId)
      .populate<{ user: IUser }>("user")
      .populate("course");
    if (!payment) {
      res.status(404).json({ message: "Manual payment not found" });
      return;
    }

    // console.log(payment);

    // Update manual payment status to "approved"
    payment.status = "approved";
    await payment.save();

    console.log("payment_method", payment.method);

    // Prepare enrollment data
    const enrollmentData = {
      user: payment.user._id,
      course: payment.course._id,
      status: "success",
      amount: payment.amount,
      batch: payment.batchNo,
      payment_method: payment.method,
      student_name: payment.user.name,
      transactionId: payment.transactionId,
      enrolledAt: new Date(),
    };

    // console.log("payment_method", enrollmentData.payment_method)

    // Create enrollment record
    const enrollment = await Enrollment.create(enrollmentData);

    res.status(201).json({
      message: "Payment approved and enrollment successful",
      data: enrollment,
    });
  } catch (error) {
    console.error("Error approving payment and enrolling:", error);

    // Provide more specific error message
    if (error instanceof Error) {
      if (error.message.includes('duplicate key') || error.message.includes('E11000')) {
        res.status(400).json({
          message: "Enrollment already exists for this user, course, and batch"
        });
        return;
      }
      res.status(500).json({
        message: "Server error",
        error: error.message
      });
      return;
    }

    res.status(500).json({ message: "Server error" });
  }
};

export const getAllManualTransactions = async (
  req: Request,
  res: Response
): Promise<any> => {
  try {
    const transactions = await ManualPayment.find()
      .populate<{ course: ICourse }>({ path: "course", select: "title" })
      .populate<{ user: IUser }>({ path: "user", select: "name" })
      .sort({ createdAt: -1 });

    const formatted = transactions.map((txn) => ({
      id: txn?._id,
      transactionId: txn.transactionId || txn._id.toString(),
      student: txn.user?.name || "N/A",
      course: txn.course?.title || "N/A",
      amount: txn.amount,
      phone: txn?.paymentPhoneNumber,
      method: txn?.method || "manual",
      status: txn.status,
      date: formatDate(txn.enrolledAt),
      batch: txn.batchNo,
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
