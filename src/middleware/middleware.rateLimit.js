/**
 * Rate Limiting Middleware
 * Protects API from abuse and DDoS attacks
 */
const rateLimit = require("express-rate-limit");

/**
 * General API rate limiter
 * 100 requests per 15 minutes per IP
 */
const generalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // 100 requests per window
    message: {
        success: false,
        message: "Too many requests from this IP, please try again later.",
    },
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});

/**
 * Strict rate limiter for authentication endpoints
 * 5 requests per 15 minutes per IP (prevents brute force)
 */
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // 5 attempts per window
    message: {
        success: false,
        message:
            "Too many authentication attempts from this IP, please try again after 15 minutes.",
    },
    standardHeaders: true,
    legacyHeaders: false,
    // Skip successful requests (only count failed attempts)
    skipSuccessfulRequests: true,
});

/**
 * Moderate rate limiter for creating resources
 * 20 requests per hour per IP
 */
const createLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 20, // 20 creates per hour
    message: {
        success: false,
        message:
            "Too many creation requests from this IP, please try again later.",
    },
    standardHeaders: true,
    legacyHeaders: false,
});

/**
 * File upload rate limiter
 * 10 uploads per hour per IP
 */
const uploadLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 10, // 10 uploads per hour
    message: {
        success: false,
        message: "Too many upload requests, please try again later.",
    },
    standardHeaders: true,
    legacyHeaders: false,
});

module.exports = {
    generalLimiter,
    authLimiter,
    createLimiter,
    uploadLimiter,
};
