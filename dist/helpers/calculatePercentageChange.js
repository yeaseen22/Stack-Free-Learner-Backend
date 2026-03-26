"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.calculatePercentageChange = calculatePercentageChange;
// Helper function to calculate % change
function calculatePercentageChange(current, previous) {
    if (previous === 0)
        return current === 0 ? 0 : 100;
    return ((current - previous) / previous) * 100;
}
