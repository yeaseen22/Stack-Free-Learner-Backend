import {
  getAllInvoices,
  getEnrollmentBatch,
  getInvoiceByTransactionId,
  initiatePayment,
  markCourseComplete,
  paymentSuccess,
} from "../../controllers/course/enrollController";
import { authenticate } from "../../middleware/authMiddleware";
import { authorize } from "../../middleware/checkRole";
import express from "express";

const router = express.Router();

router.patch(
  "/course-complete",
  authenticate,
  authorize("student"),
  markCourseComplete
);
router.post("/enrolled", authenticate, initiatePayment);
router.post("/payment/success", paymentSuccess);
router.get("/batch/:id", authenticate, getEnrollmentBatch);
router.get("/invoice/:transactionId", getInvoiceByTransactionId);
router.get("/invoices", authenticate, authorize("student"), getAllInvoices);

export default router;
