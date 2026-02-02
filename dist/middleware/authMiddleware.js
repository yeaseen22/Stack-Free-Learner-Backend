"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authenticate = void 0;
const jwt_1 = require("../utils/jwt");
const authenticate = (req, res, next) => {
    const accessToken = req.cookies.accessToken;
    if (!accessToken) {
        res.status(401).json({ message: "No access token provided" });
        return;
    }
    const decoded = (0, jwt_1.verifyToken)(accessToken, "access");
    if (!decoded) {
        res.status(403).json({ message: "Invalid or expired access token" });
        return;
    }
    req.user = decoded;
    next();
};
exports.authenticate = authenticate;
