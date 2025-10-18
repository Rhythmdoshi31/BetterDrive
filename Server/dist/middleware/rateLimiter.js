"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.waitlistLimiter = exports.authLimiter = exports.globalLimiter = void 0;
// src/middleware/rateLimiter.ts
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
// Global rate limiter
exports.globalLimiter = (0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // 100 requests per 15 minutes per IP
    message: 'Too many requests from this IP, please try again later.',
    standardHeaders: true,
    legacyHeaders: false,
});
// Strict limiter for auth endpoints
exports.authLimiter = (0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 10, // 5 login attempts per 15 minutes
    message: 'Too many login attempts, please try again later.',
    skipSuccessfulRequests: true, // Don't count successful requests
});
// Waitlist limiter
exports.waitlistLimiter = (0, express_rate_limit_1.default)({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 10, // 3 signups per hour per IP
    message: 'Too many signup attempts, please try again later.',
});
//# sourceMappingURL=rateLimiter.js.map