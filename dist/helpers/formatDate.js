"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.formatDate = void 0;
// Helper function to format date as M/D/YYYY
const formatDate = (date) => {
    return `${date.getMonth() + 1}/${date.getDate()}/${date.getFullYear()}`;
};
exports.formatDate = formatDate;
