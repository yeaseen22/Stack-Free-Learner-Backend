import express from "express";
import { authenticate } from "../../middleware/authMiddleware";
import { authorize } from "../../middleware/checkRole";
import { approveManualPaymentAndEnroll, createManualPayment, getAllManualTransactions } from "../../controllers/payment/manualPaymentController";

const router = express.Router();

router.post("/create-manual-payment/:courseId/:batchNo", authenticate, authorize("student"), createManualPayment);
router.get("/manual-transections", authenticate, authorize("admin"), getAllManualTransactions);
router.patch("/maual-to-enrollment/:paymentId", authenticate, authorize("admin"), approveManualPaymentAndEnroll);


export default router;
