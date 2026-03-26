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
exports.getVipAllBatches = exports.getAllVipStudents = exports.getMyVipAccess = exports.revokeVipFromUser = exports.assignVipToUser = exports.updateVipRoleFromAdmin = exports.getPendingVipPayments = exports.rejectVipPayment = exports.approveVipPayment = exports.buyVipBundle = exports.getVipBundleConfig = exports.upsertVipBundleConfig = void 0;
const mongoose_1 = require("mongoose");
const VipBundleConfigModel_1 = require("../../models/vip/VipBundleConfigModel");
const VipBundlePurchaseModel_1 = require("../../models/vip/VipBundlePurchaseModel");
const UserModel_1 = require("../../models/auth/UserModel");
const CourseModel_1 = require("../../models/course/CourseModel");
const BatchModel_1 = __importDefault(require("../../models/course/BatchModel"));
const BUNDLE_KEY = "VIP_STUDENT_BUNDLE";
const upsertVipBundleConfig = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const { title, description, price, currency, isActive } = req.body;
        const adminId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
        if (!adminId || !mongoose_1.Types.ObjectId.isValid(adminId)) {
            return res.status(401).json({ success: false, message: "Unauthorized" });
        }
        if (price === undefined || Number(price) < 0) {
            return res.status(400).json({
                success: false,
                message: "Valid bundle price is required",
            });
        }
        const config = yield VipBundleConfigModel_1.VipBundleConfig.findOneAndUpdate({ bundleKey: BUNDLE_KEY }, {
            $set: {
                title: title || "VIP Student Bundle",
                description: description || "Access to all courses and all batches",
                price: Number(price),
                currency: currency || "BDT",
                isActive: isActive !== undefined ? Boolean(isActive) : true,
                updatedBy: adminId,
            },
        }, { upsert: true, new: true, setDefaultsOnInsert: true });
        return res.status(200).json({
            success: true,
            message: "VIP bundle config saved successfully",
            data: config,
        });
    }
    catch (error) {
        return res.status(500).json({
            success: false,
            message: "Failed to save VIP bundle config",
            error: error instanceof Error ? error.message : "Unknown error",
        });
    }
});
exports.upsertVipBundleConfig = upsertVipBundleConfig;
const getVipBundleConfig = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const config = yield VipBundleConfigModel_1.VipBundleConfig.findOne({ bundleKey: BUNDLE_KEY });
        if (!config) {
            return res.status(404).json({
                success: false,
                message: "VIP bundle config not found",
            });
        }
        return res.status(200).json({ success: true, data: config });
    }
    catch (error) {
        return res.status(500).json({
            success: false,
            message: "Failed to get VIP bundle config",
            error: error instanceof Error ? error.message : "Unknown error",
        });
    }
});
exports.getVipBundleConfig = getVipBundleConfig;
const buyVipBundle = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
        const { paymentReference, paymentScreenshot } = req.body || {};
        if (!userId || !mongoose_1.Types.ObjectId.isValid(userId)) {
            return res.status(401).json({ success: false, message: "Unauthorized" });
        }
        const config = yield VipBundleConfigModel_1.VipBundleConfig.findOne({ bundleKey: BUNDLE_KEY });
        if (!config || !config.isActive) {
            return res.status(400).json({
                success: false,
                message: "VIP bundle is not available currently",
            });
        }
        const user = yield UserModel_1.User.findById(userId);
        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }
        if (user.isVipStudent) {
            return res.status(200).json({
                success: true,
                message: "User already has VIP bundle access",
            });
        }
        const existingRequest = yield VipBundlePurchaseModel_1.VipBundlePurchase.findOne({ user: user._id });
        if ((existingRequest === null || existingRequest === void 0 ? void 0 : existingRequest.status) === "pending") {
            return res.status(400).json({
                success: false,
                message: "VIP bundle payment request is already pending admin approval",
            });
        }
        const request = yield VipBundlePurchaseModel_1.VipBundlePurchase.findOneAndUpdate({ user: user._id }, {
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
        }, { upsert: true, new: true, setDefaultsOnInsert: true });
        return res.status(200).json({
            success: true,
            message: "VIP bundle payment request submitted. Please wait for admin approval.",
            data: request,
        });
    }
    catch (error) {
        return res.status(500).json({
            success: false,
            message: "Failed to submit VIP bundle payment request",
            error: error instanceof Error ? error.message : "Unknown error",
        });
    }
});
exports.buyVipBundle = buyVipBundle;
const approveVipPayment = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const { purchaseId } = req.params;
        const adminId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
        if (!adminId || !mongoose_1.Types.ObjectId.isValid(adminId)) {
            return res.status(401).json({ success: false, message: "Unauthorized" });
        }
        if (!mongoose_1.Types.ObjectId.isValid(purchaseId)) {
            return res.status(400).json({ success: false, message: "Invalid purchase ID" });
        }
        const purchase = yield VipBundlePurchaseModel_1.VipBundlePurchase.findById(purchaseId);
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
        purchase.approvedBy = new mongoose_1.Types.ObjectId(adminId);
        purchase.approvedAt = new Date();
        yield purchase.save();
        yield UserModel_1.User.findByIdAndUpdate(purchase.user, { $set: { isVipStudent: true } });
        return res.status(200).json({
            success: true,
            message: "VIP payment approved and user promoted to VIP student",
            data: purchase,
        });
    }
    catch (error) {
        return res.status(500).json({
            success: false,
            message: "Failed to approve VIP payment",
            error: error instanceof Error ? error.message : "Unknown error",
        });
    }
});
exports.approveVipPayment = approveVipPayment;
const rejectVipPayment = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const { purchaseId } = req.params;
        const { reason } = req.body || {};
        const adminId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
        if (!adminId || !mongoose_1.Types.ObjectId.isValid(adminId)) {
            return res.status(401).json({ success: false, message: "Unauthorized" });
        }
        if (!mongoose_1.Types.ObjectId.isValid(purchaseId)) {
            return res.status(400).json({ success: false, message: "Invalid purchase ID" });
        }
        const purchase = yield VipBundlePurchaseModel_1.VipBundlePurchase.findById(purchaseId);
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
        purchase.rejectedBy = new mongoose_1.Types.ObjectId(adminId);
        purchase.rejectedAt = new Date();
        purchase.rejectionReason = reason || "Payment proof invalid";
        yield purchase.save();
        yield UserModel_1.User.findByIdAndUpdate(purchase.user, { $set: { isVipStudent: false } });
        return res.status(200).json({
            success: true,
            message: "VIP payment rejected",
            data: purchase,
        });
    }
    catch (error) {
        return res.status(500).json({
            success: false,
            message: "Failed to reject VIP payment",
            error: error instanceof Error ? error.message : "Unknown error",
        });
    }
});
exports.rejectVipPayment = rejectVipPayment;
const getPendingVipPayments = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const pendingRequests = yield VipBundlePurchaseModel_1.VipBundlePurchase.find({ status: "pending" })
            .populate("user", "name email userId phone")
            .sort({ createdAt: -1 });
        return res.status(200).json({
            success: true,
            count: pendingRequests.length,
            data: pendingRequests,
        });
    }
    catch (error) {
        return res.status(500).json({
            success: false,
            message: "Failed to fetch pending VIP payments",
            error: error instanceof Error ? error.message : "Unknown error",
        });
    }
});
exports.getPendingVipPayments = getPendingVipPayments;
const updateVipRoleFromAdmin = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const { userId } = req.params;
        const { isVipStudent } = req.body;
        const adminId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
        if (!mongoose_1.Types.ObjectId.isValid(userId)) {
            return res.status(400).json({ success: false, message: "Invalid user ID" });
        }
        if (typeof isVipStudent !== "boolean") {
            return res.status(400).json({
                success: false,
                message: "isVipStudent(boolean) is required",
            });
        }
        const user = yield UserModel_1.User.findByIdAndUpdate(userId, { $set: { isVipStudent } }, { new: true }).select("name email userId role isVipStudent");
        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }
        if (isVipStudent) {
            yield VipBundlePurchaseModel_1.VipBundlePurchase.findOneAndUpdate({ user: userId }, {
                $set: {
                    amount: 0,
                    currency: "BDT",
                    status: "admin-assigned",
                    paymentMethod: "admin",
                    assignedBy: adminId,
                    purchasedAt: new Date(),
                },
            }, { upsert: true, new: true, setDefaultsOnInsert: true });
        }
        else {
            yield VipBundlePurchaseModel_1.VipBundlePurchase.findOneAndUpdate({ user: userId }, { $set: { status: "revoked" } }, { new: true });
        }
        return res.status(200).json({
            success: true,
            message: "VIP role updated successfully",
            data: user,
        });
    }
    catch (error) {
        return res.status(500).json({
            success: false,
            message: "Failed to update VIP role",
            error: error instanceof Error ? error.message : "Unknown error",
        });
    }
});
exports.updateVipRoleFromAdmin = updateVipRoleFromAdmin;
const assignVipToUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const { userId } = req.params;
        const adminId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
        if (!mongoose_1.Types.ObjectId.isValid(userId)) {
            return res.status(400).json({ success: false, message: "Invalid user ID" });
        }
        const user = yield UserModel_1.User.findById(userId);
        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }
        user.isVipStudent = true;
        yield user.save();
        yield VipBundlePurchaseModel_1.VipBundlePurchase.findOneAndUpdate({ user: user._id }, {
            $set: {
                amount: 0,
                currency: "BDT",
                status: "admin-assigned",
                paymentMethod: "admin",
                assignedBy: adminId,
                purchasedAt: new Date(),
            },
        }, { upsert: true, new: true, setDefaultsOnInsert: true });
        return res.status(200).json({
            success: true,
            message: "VIP access assigned successfully",
            data: { userId: user._id, isVipStudent: user.isVipStudent },
        });
    }
    catch (error) {
        return res.status(500).json({
            success: false,
            message: "Failed to assign VIP access",
            error: error instanceof Error ? error.message : "Unknown error",
        });
    }
});
exports.assignVipToUser = assignVipToUser;
const revokeVipFromUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { userId } = req.params;
        if (!mongoose_1.Types.ObjectId.isValid(userId)) {
            return res.status(400).json({ success: false, message: "Invalid user ID" });
        }
        const user = yield UserModel_1.User.findById(userId);
        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }
        user.isVipStudent = false;
        yield user.save();
        yield VipBundlePurchaseModel_1.VipBundlePurchase.findOneAndUpdate({ user: user._id }, { $set: { status: "revoked" } }, { new: true });
        return res.status(200).json({
            success: true,
            message: "VIP access revoked successfully",
            data: { userId: user._id, isVipStudent: user.isVipStudent },
        });
    }
    catch (error) {
        return res.status(500).json({
            success: false,
            message: "Failed to revoke VIP access",
            error: error instanceof Error ? error.message : "Unknown error",
        });
    }
});
exports.revokeVipFromUser = revokeVipFromUser;
const getMyVipAccess = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
        if (!userId || !mongoose_1.Types.ObjectId.isValid(userId)) {
            return res.status(401).json({ success: false, message: "Unauthorized" });
        }
        const user = yield UserModel_1.User.findById(userId).select("name email role isVipStudent");
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
        const courses = yield CourseModel_1.Course.find({ status: "published" })
            .populate({
            path: "milestones",
            populate: {
                path: "modules",
                populate: {
                    path: "moduleContents",
                },
            },
        })
            .populate("batchData")
            .sort({ createdAt: -1 });
        return res.status(200).json({
            success: true,
            hasVipAccess: true,
            message: "VIP access granted to all courses and all batches",
            totalCourses: courses.length,
            data: courses,
        });
    }
    catch (error) {
        return res.status(500).json({
            success: false,
            message: "Failed to get VIP access",
            error: error instanceof Error ? error.message : "Unknown error",
        });
    }
});
exports.getMyVipAccess = getMyVipAccess;
const getAllVipStudents = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const vipUsers = yield UserModel_1.User.find({ isVipStudent: true })
            .select("name email userId role isVipStudent")
            .sort({ _id: -1 });
        const purchases = yield VipBundlePurchaseModel_1.VipBundlePurchase.find({
            status: { $in: ["success", "admin-assigned"] },
        }).populate("user", "name email userId");
        return res.status(200).json({
            success: true,
            count: vipUsers.length,
            users: vipUsers,
            purchases,
        });
    }
    catch (error) {
        return res.status(500).json({
            success: false,
            message: "Failed to get VIP students",
            error: error instanceof Error ? error.message : "Unknown error",
        });
    }
});
exports.getAllVipStudents = getAllVipStudents;
const getVipAllBatches = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
        if (!userId || !mongoose_1.Types.ObjectId.isValid(userId)) {
            return res.status(401).json({ success: false, message: "Unauthorized" });
        }
        const user = yield UserModel_1.User.findById(userId).select("isVipStudent");
        if (!(user === null || user === void 0 ? void 0 : user.isVipStudent)) {
            return res.status(403).json({
                success: false,
                message: "Only VIP students can access all batches",
            });
        }
        const batches = yield BatchModel_1.default.find({})
            .populate({
            path: "course",
            select: "title slug category level thumbnail milestones",
            populate: {
                path: "milestones",
                populate: {
                    path: "modules",
                    populate: {
                        path: "moduleContents",
                    },
                },
            },
        })
            .sort({ batchNo: 1 });
        return res.status(200).json({
            success: true,
            count: batches.length,
            data: batches,
        });
    }
    catch (error) {
        return res.status(500).json({
            success: false,
            message: "Failed to get all batches for VIP student",
            error: error instanceof Error ? error.message : "Unknown error",
        });
    }
});
exports.getVipAllBatches = getVipAllBatches;
