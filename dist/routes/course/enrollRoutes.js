"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const enrollController_1 = require("../../controllers/course/enrollController");
const authMiddleware_1 = require("../../middleware/authMiddleware");
const checkRole_1 = require("../../middleware/checkRole");
const express_1 = __importDefault(require("express"));
const router = express_1.default.Router();
router.patch("/course-complete", authMiddleware_1.authenticate, (0, checkRole_1.authorize)("student"), enrollController_1.markCourseComplete);
router.post("/enrolled", authMiddleware_1.authenticate, enrollController_1.initiatePayment);
router.post("/payment/success", enrollController_1.paymentSuccess);
router.get("/batch/:id", authMiddleware_1.authenticate, enrollController_1.getEnrollmentBatch);
router.get("/invoice/:transactionId", enrollController_1.getInvoiceByTransactionId);
router.get("/invoices", authMiddleware_1.authenticate, (0, checkRole_1.authorize)("student"), enrollController_1.getAllInvoices);
exports.default = router;
