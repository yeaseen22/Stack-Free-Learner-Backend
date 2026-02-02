import { Request, Response } from "express";
import SSLCommerzPayment from "sslcommerz-lts";
import { Types } from "mongoose";
import { Course } from "../../models/course/CourseModel";
import { User } from "../../models/auth/UserModel";
import { Enrollment } from "../../models/course/EnrollmentModel";
import { is_live, store_id, store_passwd } from "../../constant/ssl.info";
import Batch from "../../models/course/BatchModel";
import { sendEmail } from "../../constant/email";
import { enrollmentSuccessTemplate } from "../../templates/course-enroll";

const generateRandomId = (length: number) => {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let result = "";
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

export const initiatePayment = async (
  req: Request,
  res: Response
): Promise<any> => {
  try {
    const { courseId, userId } = req.body;

    if (!courseId || !userId) {
      return res.status(400).json({ message: "Course ID এবং User ID আবশ্যক।" });
    }

    if (!Types.ObjectId.isValid(courseId) || !Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: "Invalid Course ID বা User ID।" });
    }

    const [course, user] = await Promise.all([
      Course.findById(courseId).populate("batchData"),
      User.findById(userId),
    ]);

    if (!course) return res.status(404).json({ message: "কোর্স পাওয়া যায়নি।" });
    if (!user) return res.status(404).json({ message: "ইউজার পাওয়া যায়নি।" });
    const currentBatch = (course.batchData as any[])?.find(
      (b: any) => b?.status === "active" || b?.status === "upcoming"
    );

    if (!currentBatch || !currentBatch.batchNo) {
      return res
        .status(400)
        .json({ message: "কোনো Active বা Upcoming ব্যাচ পাওয়া যায়নি।" });
    }

    const batchNo = currentBatch.batchNo;
    const existingEnrollment = await Enrollment.findOne({
      user: userId,
      course: courseId,
      batch: batchNo,
    });

    if (existingEnrollment) {
      if (existingEnrollment.status === "success") {
        return res
          .status(400)
          .json({ message: "এই ব্যাচে আপনি ইতোমধ্যে এনরোল করেছেন।" });
      }
    }

    const transactionId = `PF${batchNo}${generateRandomId(7)}`;

    try {
      await Enrollment.create({
        user: userId,
        course: courseId,
        status: "pending",
        transactionId,
        amount: course.price,
        batch: batchNo,
        payment_method:"sslcommerz",
        student_name: user.name,
      });
    } catch (err: any) {
      if (err.code === 11000) {
        return res
          .status(400)
          .json({ message: "এই কোর্স ও ব্যাচে আপনি ইতোমধ্যে এনরোল করেছেন।" });
      }
      throw err;
    }
    const sslcz = new SSLCommerzPayment(store_id, store_passwd, is_live);
    const data = {
      total_amount: course.price,
      currency: "BDT",
      tran_id: transactionId,
      success_url:`${process.env.BASE_URL}/api/enroll/payment/success?tran_id=${transactionId}`,
      fail_url:`${process.env.FRONTEND_URL}/payment-fail?tran_id=${transactionId}`,
      cancel_url:`${process.env.FRONTEND_URL}/payment-cancel?tran_id=${transactionId}`,
      product_name: course.title,
      cus_name: user.name,
      cus_email: user.email,
      batch_no: batchNo,
      cus_add1: user.address || "N/A",
      cus_phone: user.phone || "N/A",
      shipping_method: "NO",
      product_profile: "general",
      product_category: "Course",
    };

    const apiResponse = await sslcz.init(data);

    return res.status(200).json({ paymentUrl: apiResponse.GatewayPageURL });
  } catch (error) {
    console.error("❌ Payment Init Error:", error);
    return res.status(500).json({ message: "সার্ভার এরর হয়েছে।" });
  }
};

export const paymentSuccess = async (
  req: Request,
  res: Response
): Promise<any> => {
  const tranId =
    typeof req.query.tran_id === "string"
      ? req.query.tran_id
      : req.query.tran_id?.toString();

  if (!tranId) {
    return res.status(400).json({ message: "Invalid transaction ID" });
  }
  try {
    const enrollment = await Enrollment.findOne({ transactionId: tranId });
    if (!enrollment || enrollment.status === "success") {
      return res
        .status(400)
        .json({ message: "Invalid or already processed transaction." });
    }
    enrollment.status = "success";
    await enrollment.save();
    await User.findByIdAndUpdate(enrollment.user, {
      $addToSet: { enrolledCourses: enrollment.course },
    });

    await Course.findByIdAndUpdate(enrollment.course, {
      $inc: { enrolledCount: 1 },
    });

    const user = await User.findById(enrollment.user).exec();
    const course = await Course.findById(enrollment.course)
      .populate("batchData")
      .exec();

    if (!user || !course) {
      return res.status(404).json({ message: "User or Course not found" });
    }

    const matchedBatch = course.batchData?.find(
      (batch: any) => batch?.batchNo === enrollment.batch
    );

    if (matchedBatch) {
      const batch = await Batch.findById(matchedBatch._id);
      if (batch) {
        const isAlreadyAdded = batch.enrolledStudents?.some((id) =>
          id.equals(enrollment._id)
        );

        if (!isAlreadyAdded) {
          batch.enrolledStudents.push(enrollment._id);
          await batch.save();
        }
      }
    }

    // ৭. batchWisePerformance অ্যাড করা
    if (!user.batchWisePerformance) {
      user.batchWisePerformance = [];
    }

    console.log(course?._id, enrollment?.batch);
    console.log(course, enrollment);

    user.batchWisePerformance.push({
      course: course?._id,
      batch: enrollment?.batch,
      progress: 0,
      startedAt: new Date(),
      stone: 5,
      quiz: [],
      assignment: [],
      totalMark: 0,
    });

    await user.save();

    // ৮. Email পাঠানো
    await sendEmail({
      to: user.email!,
      subject: `✅ Congratulations ${user.name} - Enrollment Confirmed for ${course.title}`,
      html: enrollmentSuccessTemplate({
        name: user.name!,
        courseTitle: course.title!,
        transactionId: tranId || "N/A",
        batchNo: enrollment?.batch || "N/A",
      }),
    });

    // ৯. Redirect to frontend
    return res.redirect(
      `${process.env.FRONTEND_URL}/payment-success?name=${
        user?.name
      }&title=${encodeURIComponent(course?.title || "")}`
    );
  } catch (error) {
    console.error("❌ Payment Success Error:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

export const markCourseComplete = async (
  req: Request,
  res: Response
): Promise<any> => {
  try {
    const { courseId, batchNo } = req.body;

    const userId = req.user?.id;

    if (!userId) {
      return res.status(400).json({ message: "User ID not found in token" });
    }

    if (!userId || !courseId) {
      return res
        .status(400)
        .json({ message: "Student ID and Course ID are required." });
    }

    if (!Types.ObjectId.isValid(userId) || !Types.ObjectId.isValid(courseId)) {
      return res.status(400).json({ message: "Invalid ID format." });
    }

    const enrollment = await Enrollment.findOne({
      user: userId,
      course: courseId,
      ...(batchNo && { batch: batchNo }),
    });

    if (!enrollment) {
      return res.status(404).json({ message: "Enrollment not found." });
    }

    enrollment.isComplete = true;
    await enrollment.save();

    return res.status(200).json({
      success: true,
      message: "Course marked as complete for the student.",
    });
  } catch (error) {
    console.error("Course Completion Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to mark course as complete.",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

export const getEnrollmentBatch = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;
    if (!id || !Types.ObjectId.isValid(id)) {
      res.status(400).json({ message: "Invalid enrollment ID." });
      return;
    }

    const enrollment = await Enrollment.findById(id);
    if (!enrollment) {
      res.status(404).json({ message: "Enrollment not found." });
      return;
    }
    const batch = enrollment?.batch;
    res.status(200).json(batch);
    return;
  } catch (error) {
    console.error("Get Enrollment Batch Error:", error);
    res.status(500).json({ message: "Server error." });
    return;
  }
};

export const getInvoiceByTransactionId = async (req: Request, res: Response): Promise<void> => {
  const transactionId = req.params.transactionId;

  if (!transactionId) {
    res.status(400).json({ message: "Transaction ID is required." });
    return;
  }

  try {
    const enrollment = await Enrollment.findOne({ transactionId })
      .populate("user")
      .populate("course")
      // .lean();

    if (!enrollment) {
      res.status(404).json({ message: "Enrollment not found for this transaction ID." });
      return;
    }

    if (enrollment.status !== "success") {
      res.status(400).json({ message: "Transaction is not successful yet." });
      return;
    }

    const user = enrollment.user as any;
    const course = enrollment.course as any;


    const invoice = {
      invoiceNo: `INV-${transactionId}`,
      date: new Date(enrollment.enrolledAt).toLocaleDateString(),
      user: {
        name: user?.name,
        email: user?.email,
        phone: user?.phone || "N/A",
        address: user?.address || "N/A",
      },
      course: {
        title: course?.title,
        batch: enrollment?.batch,
      },
      payment: {
        method: enrollment.payment_method || "sslcommerz",
        amount: enrollment.amount,
        transactionId: enrollment.transactionId,
        status: enrollment.status,
      },
    };

    res.status(200).json({ success: true, data: invoice });
  } catch (error) {
    console.error("Invoice Fetch Error:", error);
    res.status(500).json({ message: "Internal server error." });
  }
};

export const getAllInvoices = async (req: Request, res: Response): Promise<void> => {
  const userId = req.user?.id;

  if (!userId) {
    res.status(400).json({ message: "User Not found" });
    return;
  }

  try {
    const enrollments = await Enrollment.find({ user: userId, status: "success" })
      .populate("user")
      .populate("course");

    if (!enrollments || enrollments.length === 0) {
      res.status(404).json({ message: "No successful enrollments found for this user." });
      return;
    }

    const invoices = enrollments.map((enrollment) => {
      const user = enrollment.user as any;
      const course = enrollment.course as any;

      return {
        invoiceNo: `INV-${enrollment.transactionId}`,
        date: new Date(enrollment.enrolledAt).toLocaleDateString(),
        user: {
          name: user?.name,
          email: user?.email,
          phone: user?.phone || "N/A",
          address: user?.address || "N/A",
        },
        course: {
          title: course?.title,
          batch: enrollment?.batch,
        },
        payment: {
          method: enrollment.payment_method || "sslcommerz",
          amount: enrollment.amount,
          transactionId: enrollment.transactionId,
          status: enrollment.status,
        },
      };
    });

    res.status(200).json({ success: true, data: invoices });
  } catch (error) {
    console.error("Invoice Fetch Error:", error);
    res.status(500).json({ message: "Internal server error." });
  }
};

