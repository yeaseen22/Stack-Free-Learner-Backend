"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAllInvoices = exports.getInvoiceByTransactionId = exports.getEnrollmentBatch = exports.markCourseComplete = exports.paymentSuccess = exports.initiatePayment = void 0;
const sslcommerz_lts_1 = __importDefault(require("sslcommerz-lts"));
const mongoose_1 = require("mongoose");
const CourseModel_1 = require("../../models/course/CourseModel");
const UserModel_1 = require("../../models/auth/UserModel");
const EnrollmentModel_1 = require("../../models/course/EnrollmentModel");
const ssl_info_1 = require("../../constant/ssl.info");
const BatchModel_1 = __importDefault(require("../../models/course/BatchModel"));
const email_1 = require("../../constant/email");
const course_enroll_1 = require("../../templates/course-enroll");
const generateRandomId = (length) => {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let result = "";
    for (let i = 0; i < length; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
};
const initiatePayment = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const { courseId, userId } = req.body;
        if (!courseId || !userId) {
            return res.status(400).json({ message: "Course ID এবং User ID আবশ্যক।" });
        }
        if (!mongoose_1.Types.ObjectId.isValid(courseId) || !mongoose_1.Types.ObjectId.isValid(userId)) {
            return res.status(400).json({ message: "Invalid Course ID বা User ID।" });
        }
        const [course, user] = yield Promise.all([
            CourseModel_1.Course.findById(courseId).populate("batchData"),
            UserModel_1.User.findById(userId),
        ]);
        if (!course)
            return res.status(404).json({ message: "কোর্স পাওয়া যায়নি।" });
        if (!user)
            return res.status(404).json({ message: "ইউজার পাওয়া যায়নি।" });
        const currentBatch = (_a = course.batchData) === null || _a === void 0 ? void 0 : _a.find((b) => (b === null || b === void 0 ? void 0 : b.status) === "active" || (b === null || b === void 0 ? void 0 : b.status) === "upcoming");
        if (!currentBatch || !currentBatch.batchNo) {
            return res
                .status(400)
                .json({ message: "কোনো Active বা Upcoming ব্যাচ পাওয়া যায়নি।" });
        }
        const batchNo = currentBatch.batchNo;
        const existingEnrollment = yield EnrollmentModel_1.Enrollment.findOne({
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
            yield EnrollmentModel_1.Enrollment.create({
                user: userId,
                course: courseId,
                status: "pending",
                transactionId,
                amount: course.price,
                batch: batchNo,
                payment_method: "sslcommerz",
                student_name: user.name,
            });
        }
        catch (err) {
            if (err.code === 11000) {
                return res
                    .status(400)
                    .json({ message: "এই কোর্স ও ব্যাচে আপনি ইতোমধ্যে এনরোল করেছেন।" });
            }
            throw err;
        }
        const sslcz = new sslcommerz_lts_1.default(ssl_info_1.store_id, ssl_info_1.store_passwd, ssl_info_1.is_live);
        const data = {
            total_amount: course.price,
            currency: "BDT",
            tran_id: transactionId,
            success_url: `${process.env.BASE_URL}/api/enroll/payment/success?tran_id=${transactionId}`,
            fail_url: `${process.env.FRONTEND_URL}/payment-fail?tran_id=${transactionId}`,
            cancel_url: `${process.env.FRONTEND_URL}/payment-cancel?tran_id=${transactionId}`,
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
        const apiResponse = yield sslcz.init(data);
        return res.status(200).json({ paymentUrl: apiResponse.GatewayPageURL });
    }
    catch (error) {
        console.error("❌ Payment Init Error:", error);
        return res.status(500).json({ message: "সার্ভার এরর হয়েছে।" });
    }
});
exports.initiatePayment = initiatePayment;
const paymentSuccess = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c;
    const tranId = typeof req.query.tran_id === "string"
        ? req.query.tran_id
        : (_a = req.query.tran_id) === null || _a === void 0 ? void 0 : _a.toString();
    if (!tranId) {
        return res.status(400).json({ message: "Invalid transaction ID" });
    }
    try {
        const enrollment = yield EnrollmentModel_1.Enrollment.findOne({ transactionId: tranId });
        if (!enrollment || enrollment.status === "success") {
            return res
                .status(400)
                .json({ message: "Invalid or already processed transaction." });
        }
        enrollment.status = "success";
        yield enrollment.save();
        yield UserModel_1.User.findByIdAndUpdate(enrollment.user, {
            $addToSet: { enrolledCourses: enrollment.course },
        });
        yield CourseModel_1.Course.findByIdAndUpdate(enrollment.course, {
            $inc: { enrolledCount: 1 },
        });
        const user = yield UserModel_1.User.findById(enrollment.user).exec();
        const course = yield CourseModel_1.Course.findById(enrollment.course)
            .populate("batchData")
            .exec();
        if (!user || !course) {
            return res.status(404).json({ message: "User or Course not found" });
        }
        const matchedBatch = (_b = course.batchData) === null || _b === void 0 ? void 0 : _b.find((batch) => (batch === null || batch === void 0 ? void 0 : batch.batchNo) === enrollment.batch);
        if (matchedBatch) {
            const batch = yield BatchModel_1.default.findById(matchedBatch._id);
            if (batch) {
                const isAlreadyAdded = (_c = batch.enrolledStudents) === null || _c === void 0 ? void 0 : _c.some((id) => id.equals(enrollment._id));
                if (!isAlreadyAdded) {
                    batch.enrolledStudents.push(enrollment._id);
                    yield batch.save();
                }
            }
        }
        // ৭. batchWisePerformance অ্যাড করা
        if (!user.batchWisePerformance) {
            user.batchWisePerformance = [];
        }
        console.log(course === null || course === void 0 ? void 0 : course._id, enrollment === null || enrollment === void 0 ? void 0 : enrollment.batch);
        console.log(course, enrollment);
        user.batchWisePerformance.push({
            course: course === null || course === void 0 ? void 0 : course._id,
            batch: enrollment === null || enrollment === void 0 ? void 0 : enrollment.batch,
            progress: 0,
            startedAt: new Date(),
            stone: 5,
            quiz: [],
            assignment: [],
            totalMark: 0,
        });
        yield user.save();
        // ৮. Email পাঠানো
        yield (0, email_1.sendEmail)({
            to: user.email,
            subject: `✅ Congratulations ${user.name} - Enrollment Confirmed for ${course.title}`,
            html: (0, course_enroll_1.enrollmentSuccessTemplate)({
                name: user.name,
                courseTitle: course.title,
                transactionId: tranId || "N/A",
                batchNo: (enrollment === null || enrollment === void 0 ? void 0 : enrollment.batch) || "N/A",
            }),
        });
        // ৯. Redirect to frontend
        return res.redirect(`${process.env.FRONTEND_URL}/payment-success?name=${user === null || user === void 0 ? void 0 : user.name}&title=${encodeURIComponent((course === null || course === void 0 ? void 0 : course.title) || "")}`);
    }
    catch (error) {
        console.error("❌ Payment Success Error:", error);
        return res.status(500).json({ message: "Internal Server Error" });
    }
});
exports.paymentSuccess = paymentSuccess;
const markCourseComplete = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const { courseId, batchNo } = req.body;
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
        if (!userId) {
            return res.status(400).json({ message: "User ID not found in token" });
        }
        if (!userId || !courseId) {
            return res
                .status(400)
                .json({ message: "Student ID and Course ID are required." });
        }
        if (!mongoose_1.Types.ObjectId.isValid(userId) || !mongoose_1.Types.ObjectId.isValid(courseId)) {
            return res.status(400).json({ message: "Invalid ID format." });
        }
        const enrollment = yield EnrollmentModel_1.Enrollment.findOne(Object.assign({ user: userId, course: courseId }, (batchNo && { batch: batchNo })));
        if (!enrollment) {
            return res.status(404).json({ message: "Enrollment not found." });
        }
        enrollment.isComplete = true;
        yield enrollment.save();
        return res.status(200).json({
            success: true,
            message: "Course marked as complete for the student.",
        });
    }
    catch (error) {
        console.error("Course Completion Error:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to mark course as complete.",
            error: error instanceof Error ? error.message : "Unknown error",
        });
    }
});
exports.markCourseComplete = markCourseComplete;
const getEnrollmentBatch = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        if (!id || !mongoose_1.Types.ObjectId.isValid(id)) {
            res.status(400).json({ message: "Invalid enrollment ID." });
            return;
        }
        const enrollment = yield EnrollmentModel_1.Enrollment.findById(id);
        if (!enrollment) {
            res.status(404).json({ message: "Enrollment not found." });
            return;
        }
        const batch = enrollment === null || enrollment === void 0 ? void 0 : enrollment.batch;
        res.status(200).json(batch);
        return;
    }
    catch (error) {
        console.error("Get Enrollment Batch Error:", error);
        res.status(500).json({ message: "Server error." });
        return;
    }
});
exports.getEnrollmentBatch = getEnrollmentBatch;
const getInvoiceByTransactionId = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const transactionId = req.params.transactionId;
    if (!transactionId) {
        res.status(400).json({ message: "Transaction ID is required." });
        return;
    }
    try {
        const enrollment = yield EnrollmentModel_1.Enrollment.findOne({ transactionId })
            .populate("user")
            .populate("course");
        // .lean();
        if (!enrollment) {
            res.status(404).json({ message: "Enrollment not found for this transaction ID." });
            return;
        }
        if (enrollment.status !== "success") {
            res.status(400).json({ message: "Transaction is not successful yet." });
            return;
        }
        const user = enrollment.user;
        const course = enrollment.course;
        const invoice = {
            invoiceNo: `INV-${transactionId}`,
            date: new Date(enrollment.enrolledAt).toLocaleDateString(),
            user: {
                name: user === null || user === void 0 ? void 0 : user.name,
                email: user === null || user === void 0 ? void 0 : user.email,
                phone: (user === null || user === void 0 ? void 0 : user.phone) || "N/A",
                address: (user === null || user === void 0 ? void 0 : user.address) || "N/A",
            },
            course: {
                title: course === null || course === void 0 ? void 0 : course.title,
                batch: enrollment === null || enrollment === void 0 ? void 0 : enrollment.batch,
            },
            payment: {
                method: enrollment.payment_method || "sslcommerz",
                amount: enrollment.amount,
                transactionId: enrollment.transactionId,
                status: enrollment.status,
            },
        };
        res.status(200).json({ success: true, data: invoice });
    }
    catch (error) {
        console.error("Invoice Fetch Error:", error);
        res.status(500).json({ message: "Internal server error." });
    }
});
exports.getInvoiceByTransactionId = getInvoiceByTransactionId;
const getAllInvoices = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
    if (!userId) {
        res.status(400).json({ message: "User Not found" });
        return;
    }
    try {
        const enrollments = yield EnrollmentModel_1.Enrollment.find({ user: userId, status: "success" })
            .populate("user")
            .populate("course");
        if (!enrollments || enrollments.length === 0) {
            res.status(404).json({ message: "No successful enrollments found for this user." });
            return;
        }
        const invoices = enrollments.map((enrollment) => {
            const user = enrollment.user;
            const course = enrollment.course;
            return {
                invoiceNo: `INV-${enrollment.transactionId}`,
                date: new Date(enrollment.enrolledAt).toLocaleDateString(),
                user: {
                    name: user === null || user === void 0 ? void 0 : user.name,
                    email: user === null || user === void 0 ? void 0 : user.email,
                    phone: (user === null || user === void 0 ? void 0 : user.phone) || "N/A",
                    address: (user === null || user === void 0 ? void 0 : user.address) || "N/A",
                },
                course: {
                    title: course === null || course === void 0 ? void 0 : course.title,
                    batch: enrollment === null || enrollment === void 0 ? void 0 : enrollment.batch,
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
    }
    catch (error) {
        console.error("Invoice Fetch Error:", error);
        res.status(500).json({ message: "Internal server error." });
    }
});
exports.getAllInvoices = getAllInvoices;
