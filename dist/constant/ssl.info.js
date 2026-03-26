"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.is_live = exports.store_passwd = exports.store_id = void 0;
exports.store_id = process.env.SSLCOMMERZ_STORE_ID || "your_store_id";
exports.store_passwd = process.env.SSLCOMMERZ_STORE_PASSWD || "your_store_password";
exports.is_live = false;
