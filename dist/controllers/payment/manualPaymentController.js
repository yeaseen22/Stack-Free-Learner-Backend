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
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAllManualTransactions = exports.approveManualPaymentAndEnroll = exports.createManualPayment = void 0;
const manualPaymentModel_1 = require("../../models/payment/manualPaymentModel");
const CourseModel_1 = require("../../models/course/CourseModel");
const EnrollmentModel_1 = require("../../models/course/EnrollmentModel");
const formatDate_1 = require("../../helpers/formatDate");
const createManualPayment = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
        if (!userId) {
            res.status(401).json({ message: "Unauthorized: User not found" });
            return;
        }
        const courseId = req.params.courseId;
        const batchNo = Number(req.params.batchNo);
        const { transactionId, paymentPhoneNumber, method } = req.body;
        if (!paymentPhoneNumber ||
            !transactionId ||
            !method ||
            !courseId ||
            isNaN(batchNo)) {
            res.status(400).json({ message: "All fields are required" });
            return;
        }
        // Get course to fetch price
        const course = yield CourseModel_1.Course.findById(courseId);
        if (!course) {
            res.status(404).json({ message: "Course not found" });
            return;
        }
        const amount = course.price;
        if (!amount) {
            res.status(400).json({ message: "Course has no price defined" });
            return;
        }
        const payment = yield manualPaymentModel_1.ManualPayment.create({
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
    }
    catch (error) {
        console.error("Error creating manual payment:", error);
        res.status(500).json({ message: "Server error" });
    }
});
exports.createManualPayment = createManualPayment;
const approveManualPaymentAndEnroll = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { paymentId } = req.params;
        // Find the manual payment
        const payment = yield manualPaymentModel_1.ManualPayment.findById(paymentId)
            .populate("user")
            .populate("course");
        if (!payment) {
            res.status(404).json({ message: "Manual payment not found" });
            return;
        }
        // console.log(payment);
        // Update manual payment status to "approved"
        payment.status = "approved";
        yield payment.save();
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
        const enrollment = yield EnrollmentModel_1.Enrollment.create(enrollmentData);
        res.status(201).json({
            message: "Payment approved and enrollment successful",
            data: enrollment,
        });
    }
    catch (error) {
        console.error("Error approving payment and enrolling:", error);
        res.status(500).json({ message: "Server error" });
    }
});
exports.approveManualPaymentAndEnroll = approveManualPaymentAndEnroll;
const getAllManualTransactions = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const transactions = yield manualPaymentModel_1.ManualPayment.find()
            .populate({ path: "course", select: "title" })
            .populate({ path: "user", select: "name" })
            .sort({ createdAt: -1 });
        const formatted = transactions.map((txn) => {
            var _a, _b;
            return ({
                id: txn === null || txn === void 0 ? void 0 : txn._id,
                transactionId: txn.transactionId || txn._id.toString(),
                student: ((_a = txn.user) === null || _a === void 0 ? void 0 : _a.name) || "N/A",
                course: ((_b = txn.course) === null || _b === void 0 ? void 0 : _b.title) || "N/A",
                amount: txn.amount,
                phone: txn === null || txn === void 0 ? void 0 : txn.paymentPhoneNumber,
                method: (txn === null || txn === void 0 ? void 0 : txn.method) || "manual",
                status: txn.status,
                date: (0, formatDate_1.formatDate)(txn.enrolledAt),
                batch: txn.batchNo,
            });
        });
        return res.status(200).json({
            success: true,
            message: "Transactions retrieved successfully",
            data: formatted,
        });
    }
    catch (error) {
        return res.status(500).json({
            success: false,
            message: "Error retrieving transactions",
            error: error instanceof Error ? error.message : "Unknown error",
        });
    }
});
exports.getAllManualTransactions = getAllManualTransactions;
