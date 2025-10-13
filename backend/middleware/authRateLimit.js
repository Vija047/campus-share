import rateLimit from 'express-rate-limit';

// Enhanced rate limiting for authentication endpoints
export const authRateLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // Limit each IP to 5 requests per windowMs
    message: {
        success: false,
        message: 'Too many authentication attempts from this IP, please try again after 15 minutes.',
        error: 'RATE_LIMIT_EXCEEDED'
    },
    standardHeaders: true,
    legacyHeaders: false,
    skip: (req, res) => {
        // Skip rate limiting for successful requests
        return res.statusCode < 400;
    }
});

// Strict rate limiting for password reset requests
export const passwordResetLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 3, // Limit each IP to 3 password reset requests per hour
    message: {
        success: false,
        message: 'Too many password reset attempts. Please try again after 1 hour.',
        error: 'PASSWORD_RESET_LIMIT_EXCEEDED'
    },
    standardHeaders: true,
    legacyHeaders: false
});

// Rate limiting for email verification requests
export const emailVerificationLimiter = rateLimit({
    windowMs: 5 * 60 * 1000, // 5 minutes
    max: 3, // Limit each IP to 3 verification email requests per 5 minutes
    message: {
        success: false,
        message: 'Too many verification email requests. Please try again after 5 minutes.',
        error: 'VERIFICATION_LIMIT_EXCEEDED'
    },
    standardHeaders: true,
    legacyHeaders: false
});

// General registration rate limiting
export const registrationLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 10, // Limit each IP to 10 registration attempts per hour
    message: {
        success: false,
        message: 'Too many registration attempts from this IP. Please try again after 1 hour.',
        error: 'REGISTRATION_LIMIT_EXCEEDED'
    },
    standardHeaders: true,
    legacyHeaders: false
});

// Login attempt rate limiting - more permissive but still protective
export const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 10, // Limit each IP to 10 login attempts per 15 minutes
    message: {
        success: false,
        message: 'Too many login attempts from this IP. Please try again after 15 minutes.',
        error: 'LOGIN_LIMIT_EXCEEDED'
    },
    standardHeaders: true,
    legacyHeaders: false,
    skip: (req, res) => {
        // Don't count successful logins against the rate limit
        return res.statusCode === 200;
    }
});

export default {
    authRateLimiter,
    passwordResetLimiter,
    emailVerificationLimiter,
    registrationLimiter,
    loginLimiter
};