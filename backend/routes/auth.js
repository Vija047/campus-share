import express from 'express';
import { body } from 'express-validator';
import {
    register,
    login,
    getMe,
    updateProfile,
    forgotPassword,
    verifyOTP,
    resetPassword,
    verifyEmail,
    resendVerificationCode
} from '../controllers/authController.js';
import { authenticate } from '../middleware/auth.js';
import { authLimiter } from '../middleware/rateLimiter.js';
import {
    registrationLimiter,
    loginLimiter,
    passwordResetLimiter
} from '../middleware/authRateLimit.js';
import { handleValidationErrorsDetailed } from '../middleware/validation.js';

const router = express.Router();

// Validation middleware
const registerValidation = [
    body('name')
        .trim()
        .isLength({ min: 2, max: 50 })
        .withMessage('Name must be between 2 and 50 characters'),
    body('email')
        .isEmail()
        .normalizeEmail()
        .withMessage('Please enter a valid email'),
    body('password')
        .isLength({ min: 6 })
        .withMessage('Password must be at least 6 characters long'),
    body('semester')
        .isIn(['1', '2', '3', '4', '5', '6', '7', '8'])
        .withMessage('Semester must be between 1 and 8')
];

const loginValidation = [
    body('email')
        .isEmail()
        .normalizeEmail()
        .withMessage('Please enter a valid email'),
    body('password')
        .notEmpty()
        .withMessage('Password is required')
];

const profileValidation = [
    body('name')
        .optional()
        .trim()
        .isLength({ min: 2, max: 50 })
        .withMessage('Name must be between 2 and 50 characters'),
    body('bio')
        .optional()
        .isLength({ max: 200 })
        .withMessage('Bio cannot exceed 200 characters'),
    body('semester')
        .optional()
        .isIn(['1', '2', '3', '4', '5', '6', '7', '8'])
        .withMessage('Semester must be between 1 and 8')
];

const forgotPasswordValidation = [
    body('email')
        .isEmail()
        .normalizeEmail()
        .withMessage('Please enter a valid email')
];

const verifyOTPValidation = [
    body('email')
        .isEmail()
        .normalizeEmail()
        .withMessage('Please enter a valid email'),
    body('otp')
        .isLength({ min: 6, max: 6 })
        .isNumeric()
        .withMessage('OTP must be a 6-digit number')
];

const resetPasswordValidation = [
    body('email')
        .isEmail()
        .normalizeEmail()
        .withMessage('Please enter a valid email'),
    body('otp')
        .isLength({ min: 6, max: 6 })
        .isNumeric()
        .withMessage('OTP must be a 6-digit number'),
    body('newPassword')
        .isLength({ min: 6 })
        .withMessage('New password must be at least 6 characters long')
];

const verifyEmailValidation = [
    body('email')
        .isEmail()
        .normalizeEmail()
        .withMessage('Please enter a valid email'),
    body('verificationCode')
        .isLength({ min: 6, max: 6 })
        .isNumeric()
        .withMessage('Verification code must be a 6-digit number')
];

const resendVerificationValidation = [
    body('email')
        .isEmail()
        .normalizeEmail()
        .withMessage('Please enter a valid email')
];



// Routes
router.post('/register', registrationLimiter, registerValidation, handleValidationErrorsDetailed, register);
router.post('/login', loginLimiter, loginValidation, handleValidationErrorsDetailed, login);

// Email verification routes
router.post('/verify-email', authLimiter, verifyEmailValidation, handleValidationErrorsDetailed, verifyEmail);
router.post('/resend-verification', passwordResetLimiter, resendVerificationValidation, handleValidationErrorsDetailed, resendVerificationCode);

router.post('/forgot-password', passwordResetLimiter, forgotPasswordValidation, handleValidationErrorsDetailed, forgotPassword);
router.post('/verify-otp', authLimiter, verifyOTPValidation, handleValidationErrorsDetailed, verifyOTP);
router.post('/reset-password', authLimiter, resetPasswordValidation, handleValidationErrorsDetailed, resetPassword);
router.get('/me', authenticate, getMe);
router.put('/profile', authenticate, profileValidation, handleValidationErrorsDetailed, updateProfile);

export default router;
