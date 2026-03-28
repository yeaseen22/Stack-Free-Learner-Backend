import express from "express";
import { authenticate } from "../../middleware/authMiddleware";
import { authorize } from "../../middleware/checkRole";
import {
  approveVipPayment,
  assignVipToUser,
  buyVipBundle,
  getAllVipStudents,
  getMyVipAccess,
  getPendingVipPayments,
  getVipAllBatches,
  getVipBundleConfig,
  rejectVipPayment,
  revokeVipFromUser,
  upsertVipBundleConfig,
  updateVipRoleFromAdmin,
} from "../../controllers/vip/vipBundleController";

const router = express.Router();

router.get("/bundle-config", authenticate, getVipBundleConfig);
router.put(
  "/bundle-config",
  authenticate,
  authorize("admin"),
  upsertVipBundleConfig
);

router.post(
  "/buy-bundle",
  authenticate,
  authorize("student"),
  buyVipBundle
);

router.get("/my-access", authenticate, authorize("student"), getMyVipAccess);
router.get("/all-batches", authenticate, authorize("student"), getVipAllBatches);

router.post(
  "/assign/:userId",
  authenticate,
  authorize("admin"),
  assignVipToUser
);

router.patch(
  "/revoke/:userId",
  authenticate,
  authorize("admin"),
  revokeVipFromUser
);

router.get(
  "/pending-payments",
  authenticate,
  authorize("admin"),
  getPendingVipPayments
);

router.patch(
  "/approve-payment/:purchaseId",
  authenticate,
  authorize("admin"),
  approveVipPayment
);

router.patch(
  "/reject-payment/:purchaseId",
  authenticate,
  authorize("admin"),
  rejectVipPayment
);

router.patch(
  "/update-role/:userId",
  authenticate,
  authorize("admin"),
  updateVipRoleFromAdmin
);

router.get(
  "/students",
  authenticate,
  authorize("admin"),
  getAllVipStudents
);

export default router;
