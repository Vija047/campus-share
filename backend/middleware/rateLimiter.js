import rateLimit from 'express-rate-limit';

// General rate limiter
export const generalLimiter = rateLimit({
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
    max: parseInt(process.env.RATE_LIMIT_MAX) || 500, // limit each IP to 500 requests per windowMs
    message: {
        success: false,
        message: 'Too many requests from this IP, please try again later.'
    },
    standardHeaders: true,
    legacyHeaders: false,
    keyGenerator: (req) => {
        // Use user ID if authenticated, fallback to IP
        return req.user?.id || req.ip;
    }
});

// Strict rate limiter for authentication endpoints
export const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // limit each IP to 5 requests per windowMs
    message: {
        success: false,
        message: 'Too many authentication attempts, please try again after 15 minutes.'
    },
    standardHeaders: true,
    legacyHeaders: false,
});

// Upload rate limiter
export const uploadLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 10, // limit each IP to 10 uploads per hour
    message: {
        success: false,
        message: 'Upload limit exceeded. Please try again after 1 hour.'
    },
    standardHeaders: true,
    legacyHeaders: false,
});

// Chat rate limiter
export const chatLimiter = rateLimit({
    windowMs: 1 * 60 * 1000, // 1 minute
    max: 30, // limit each IP to 30 messages per minute
    message: {
        success: false,
        message: 'Message rate limit exceeded. Please slow down.'
    },
    standardHeaders: true,
    legacyHeaders: false,
});
