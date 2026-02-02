"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const batchController_1 = require("../controllers/batchController");
const authMiddleware_1 = require("../middleware/authMiddleware");
const checkRole_1 = require("../middleware/checkRole");
const router = express_1.default.Router();
router.get("/get-batch", authMiddleware_1.authenticate, (0, checkRole_1.authorize)("admin", "instructor"), batchController_1.getAllBatches);
router.put("/update-batch/:id", authMiddleware_1.authenticate, (0, checkRole_1.authorize)("admin", "instructor"), batchController_1.updateBatch);
router.delete("/delete-batch/:id", authMiddleware_1.authenticate, (0, checkRole_1.authorize)("admin", "instructor"), batchController_1.deleteBatch);
exports.default = router;
