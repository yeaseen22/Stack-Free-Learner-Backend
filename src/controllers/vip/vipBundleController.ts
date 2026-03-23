import { Request, Response } from "express";
import { Types } from "mongoose";
import { VipBundleConfig } from "../../models/vip/VipBundleConfigModel";
import { VipBundlePurchase } from "../../models/vip/VipBundlePurchaseModel";
import { User } from "../../models/auth/UserModel";
import { Course } from "../../models/course/CourseModel";
import Batch from "../../models/course/BatchModel";

const BUNDLE_KEY = "VIP_STUDENT_BUNDLE";

export const upsertVipBundleConfig = async (
  req: Request,
  res: Response
): Promise<any> => {
  try {
    const { title, description, price, currency, isActive } = req.body;
    const adminId = req.user?.id;

    if (!adminId || !Types.ObjectId.isValid(adminId)) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    if (price === undefined || Number(price) < 0) {
      return res.status(400).json({
        success: false,
        message: "Valid bundle price is required",
      });
    }

    const config = await VipBundleConfig.findOneAndUpdate(
      { bundleKey: BUNDLE_KEY },
      {
        $set: {
          title: title || "VIP Student Bundle",
          description: description || "Access to all courses and all batches",
          price: Number(price),
          currency: currency || "BDT",
          isActive: isActive !== undefined ? Boolean(isActive) : true,
          updatedBy: adminId,
        },
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    return res.status(200).json({
      success: true,
      message: "VIP bundle config saved successfully",
      data: config,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to save VIP bundle config",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

export const getVipBundleConfig = async (
  req: Request,
  res: Response
): Promise<any> => {
  try {
    const config = await VipBundleConfig.findOne({ bundleKey: BUNDLE_KEY });
    if (!config) {
      return res.status(404).json({
        success: false,
        message: "VIP bundle config not found",
      });
    }

    return res.status(200).json({ success: true, data: config });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to get VIP bundle config",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

export const buyVipBundle = async (
  req: Request,
  res: Response
): Promise<any> => {
  try {
    const userId = req.user?.id;
    const { paymentReference, paymentScreenshot } = req.body || {};
    if (!userId || !Types.ObjectId.isValid(userId)) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const config = await VipBundleConfig.findOne({ bundleKey: BUNDLE_KEY });
    if (!config || !config.isActive) {
      return res.status(400).json({
        success: false,
        message: "VIP bundle is not available currently",
      });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    if (user.isVipStudent) {
      return res.status(200).json({
        success: true,
        message: "User already has VIP bundle access",
      });
    }

    const existingRequest = await VipBundlePurchase.findOne({ user: user._id });
    if (existingRequest?.status === "pending") {
      return res.status(400).json({
        success: false,
        message: "VIP bundle payment request is already pending admin approval",
      });
    }

    const request = await VipBundlePurchase.findOneAndUpdate(
      { user: user._id },
      {
        $set: {
          amount: config.price,
          currency: config.currency,
          status: "pending",
          paymentMethod: "manual",
          paymentReference,
          paymentScreenshot,
          purchasedAt: new Date(),
          approvedBy: null,
          approvedAt: null,
          rejectedBy: null,
          rejectedAt: null,
          rejectionReason: null,
        },
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    return res.status(200).json({
      success: true,
      message: "VIP bundle payment request submitted. Please wait for admin approval.",
      data: request,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to submit VIP bundle payment request",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

export const approveVipPayment = async (
  req: Request,
  res: Response
): Promise<any> => {
  try {
    const { purchaseId } = req.params;
    const adminId = req.user?.id;

    if (!adminId || !Types.ObjectId.isValid(adminId)) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    if (!Types.ObjectId.isValid(purchaseId)) {
      return res.status(400).json({ success: false, message: "Invalid purchase ID" });
    }

    const purchase = await VipBundlePurchase.findById(purchaseId);
    if (!purchase) {
      return res.status(404).json({ success: false, message: "Payment request not found" });
    }

    if (purchase.status !== "pending") {
      return res.status(400).json({
        success: false,
        message: `Cannot approve request with status: ${purchase.status}`,
      });
    }

    purchase.status = "success";
    purchase.approvedBy = new Types.ObjectId(adminId);
    purchase.approvedAt = new Date();
    await purchase.save();

    await User.findByIdAndUpdate(purchase.user, { $set: { isVipStudent: true } });

    return res.status(200).json({
      success: true,
      message: "VIP payment approved and user promoted to VIP student",
      data: purchase,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to approve VIP payment",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

export const rejectVipPayment = async (
  req: Request,
  res: Response
): Promise<any> => {
  try {
    const { purchaseId } = req.params;
    const { reason } = req.body || {};
    const adminId = req.user?.id;

    if (!adminId || !Types.ObjectId.isValid(adminId)) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    if (!Types.ObjectId.isValid(purchaseId)) {
      return res.status(400).json({ success: false, message: "Invalid purchase ID" });
    }

    const purchase = await VipBundlePurchase.findById(purchaseId);
    if (!purchase) {
      return res.status(404).json({ success: false, message: "Payment request not found" });
    }

    if (purchase.status !== "pending") {
      return res.status(400).json({
        success: false,
        message: `Cannot reject request with status: ${purchase.status}`,
      });
    }

    purchase.status = "rejected";
    purchase.rejectedBy = new Types.ObjectId(adminId);
    purchase.rejectedAt = new Date();
    purchase.rejectionReason = reason || "Payment proof invalid";
    await purchase.save();

    await User.findByIdAndUpdate(purchase.user, { $set: { isVipStudent: false } });

    return res.status(200).json({
      success: true,
      message: "VIP payment rejected",
      data: purchase,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to reject VIP payment",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

export const getPendingVipPayments = async (
  req: Request,
  res: Response
): Promise<any> => {
  try {
    const pendingRequests = await VipBundlePurchase.find({ status: "pending" })
      .populate("user", "name email userId phone")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: pendingRequests.length,
      data: pendingRequests,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch pending VIP payments",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

export const updateVipRoleFromAdmin = async (
  req: Request,
  res: Response
): Promise<any> => {
  try {
    const { userId } = req.params;
    const { isVipStudent } = req.body;
    const adminId = req.user?.id;

    if (!Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ success: false, message: "Invalid user ID" });
    }

    if (typeof isVipStudent !== "boolean") {
      return res.status(400).json({
        success: false,
        message: "isVipStudent(boolean) is required",
      });
    }

    const user = await User.findByIdAndUpdate(
      userId,
      { $set: { isVipStudent } },
      { new: true }
    ).select("name email userId role isVipStudent");

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    if (isVipStudent) {
      await VipBundlePurchase.findOneAndUpdate(
        { user: userId },
        {
          $set: {
            amount: 0,
            currency: "BDT",
            status: "admin-assigned",
            paymentMethod: "admin",
            assignedBy: adminId,
            purchasedAt: new Date(),
          },
        },
        { upsert: true, new: true, setDefaultsOnInsert: true }
      );
    } else {
      await VipBundlePurchase.findOneAndUpdate(
        { user: userId },
        { $set: { status: "revoked" } },
        { new: true }
      );
    }

    return res.status(200).json({
      success: true,
      message: "VIP role updated successfully",
      data: user,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to update VIP role",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

export const assignVipToUser = async (
  req: Request,
  res: Response
): Promise<any> => {
  try {
    const { userId } = req.params;
    const adminId = req.user?.id;

    if (!Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ success: false, message: "Invalid user ID" });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    user.isVipStudent = true;
    await user.save();

    await VipBundlePurchase.findOneAndUpdate(
      { user: user._id },
      {
        $set: {
          amount: 0,
          currency: "BDT",
          status: "admin-assigned",
          paymentMethod: "admin",
          assignedBy: adminId,
          purchasedAt: new Date(),
        },
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    return res.status(200).json({
      success: true,
      message: "VIP access assigned successfully",
      data: { userId: user._id, isVipStudent: user.isVipStudent },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to assign VIP access",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

export const revokeVipFromUser = async (
  req: Request,
  res: Response
): Promise<any> => {
  try {
    const { userId } = req.params;

    if (!Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ success: false, message: "Invalid user ID" });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    user.isVipStudent = false;
    await user.save();

    await VipBundlePurchase.findOneAndUpdate(
      { user: user._id },
      { $set: { status: "revoked" } },
      { new: true }
    );

    return res.status(200).json({
      success: true,
      message: "VIP access revoked successfully",
      data: { userId: user._id, isVipStudent: user.isVipStudent },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to revoke VIP access",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

export const getMyVipAccess = async (
  req: Request,
  res: Response
): Promise<any> => {
  try {
    const userId = req.user?.id;
    if (!userId || !Types.ObjectId.isValid(userId)) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const user = await User.findById(userId).select("name email role isVipStudent");
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    if (!user.isVipStudent) {
      return res.status(403).json({
        success: false,
        message: "VIP bundle not purchased",
        hasVipAccess: false,
      });
    }

    const courses = await Course.find({ status: "published" })
      .populate("batchData")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      hasVipAccess: true,
      message: "VIP access granted to all courses and all batches",
      totalCourses: courses.length,
      data: courses,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to get VIP access",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

export const getAllVipStudents = async (
  req: Request,
  res: Response
): Promise<any> => {
  try {
    const vipUsers = await User.find({ isVipStudent: true })
      .select("name email userId role isVipStudent")
      .sort({ _id: -1 });

    const purchases = await VipBundlePurchase.find({
      status: { $in: ["success", "admin-assigned"] },
    }).populate("user", "name email userId");

    return res.status(200).json({
      success: true,
      count: vipUsers.length,
      users: vipUsers,
      purchases,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to get VIP students",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

export const getVipAllBatches = async (
  req: Request,
  res: Response
): Promise<any> => {
  try {
    const userId = req.user?.id;
    if (!userId || !Types.ObjectId.isValid(userId)) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const user = await User.findById(userId).select("isVipStudent");
    if (!user?.isVipStudent) {
      return res.status(403).json({
        success: false,
        message: "Only VIP students can access all batches",
      });
    }

    const batches = await Batch.find({})
      .populate("course", "title slug category level")
      .sort({ batchNo: 1 });

    return res.status(200).json({
      success: true,
      count: batches.length,
      data: batches,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to get all batches for VIP student",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};
