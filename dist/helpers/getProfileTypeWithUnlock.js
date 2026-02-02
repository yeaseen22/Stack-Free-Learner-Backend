"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAllProfileLevels = void 0;
const getAllProfileLevels = (totalMark) => {
    return [
        { profileType: "Apprentice", isUnlock: totalMark >= 300 },
        { profileType: "Adventurer", isUnlock: totalMark >= 600 },
        { profileType: "Elite", isUnlock: totalMark >= 900 },
        { profileType: "Grandmaster", isUnlock: totalMark >= 1200 },
    ];
};
exports.getAllProfileLevels = getAllProfileLevels;
