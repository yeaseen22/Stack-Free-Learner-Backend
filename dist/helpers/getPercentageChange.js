"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPercentageChange = void 0;
const getPercentageChange = (current, previous) => {
    if (previous === 0) {
        if (current === 0)
            return "0%";
        return "0%";
    }
    const change = ((current - previous) / previous) * 100;
    const sign = change >= 0 ? "+" : "-";
    return `${sign}${Math.abs(change).toFixed(0)}%`;
};
exports.getPercentageChange = getPercentageChange;
