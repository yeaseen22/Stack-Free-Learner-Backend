"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const authMiddleware_1 = require("../../middleware/authMiddleware");
const checkRole_1 = require("../../middleware/checkRole");
const manualPaymentController_1 = require("../../controllers/payment/manualPaymentController");
const router = express_1.default.Router();
router.post("/create-manual-payment/:courseId/:batchNo", authMiddleware_1.authenticate, (0, checkRole_1.authorize)("student"), manualPaymentController_1.createManualPayment);
router.get("/manual-transections", authMiddleware_1.authenticate, (0, checkRole_1.authorize)("admin"), manualPaymentController_1.getAllManualTransactions);
router.patch("/maual-to-enrollment/:paymentId", authMiddleware_1.authenticate, (0, checkRole_1.authorize)("admin"), manualPaymentController_1.approveManualPaymentAndEnroll);
exports.default = router;
