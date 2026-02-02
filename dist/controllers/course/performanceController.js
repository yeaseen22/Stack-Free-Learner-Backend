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
exports.compareWeeklyPerformance = void 0;
const UserModel_1 = require("../../models/auth/UserModel");
// Helper function to calculate % change
function calculatePercentageChange(current, previous) {
    if (previous === 0)
        return current === 0 ? 0 : 100;
    return ((current - previous) / previous) * 100;
}
const compareWeeklyPerformance = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { userId } = req.params;
        const user = yield UserModel_1.User.findById(userId);
        if (!user ||
            !user.batchWisePerformance ||
            user.batchWisePerformance.length === 0) {
            return res
                .status(404)
                .json({ message: "Performance data not found for this user" });
        }
        const performances = user.batchWisePerformance;
        // Get the last two records
        const sorted = performances.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
        if (sorted.length < 2) {
            return res
                .status(400)
                .json({ message: "Not enough performance data to compare" });
        }
        const currentWeek = sorted[0];
        const lastWeek = sorted[1];
        // Helper to sum array or return number as is
        const getNumber = (val) => Array.isArray(val) ? val.reduce((a, b) => a + b, 0) : val;
        const comparison = {
            assignment: calculatePercentageChange(getNumber(currentWeek.assignment), getNumber(lastWeek.assignment)),
            quiz: calculatePercentageChange(getNumber(currentWeek.quiz), getNumber(lastWeek.quiz)),
            stone: calculatePercentageChange(getNumber(currentWeek.stone), getNumber(lastWeek.stone)),
            totalMark: calculatePercentageChange(getNumber(currentWeek.totalMark), getNumber(lastWeek.totalMark)),
        };
        res.status(200).json({
            message: "Weekly performance comparison fetched",
            currentWeek,
            lastWeek,
            comparison,
        });
    }
    catch (error) {
        console.error("Error in weekly performance comparison:", error);
        res.status(500).json({ message: "Server error", error });
    }
});
exports.compareWeeklyPerformance = compareWeeklyPerformance;
