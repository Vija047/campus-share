import express from 'express';
import { body } from 'express-validator';
import { register, login, getMe, updateProfile, forgotPassword, verifyOTP, resetPassword } from '../controllers/authController.js';
import { authenticate } from '../middleware/auth.js';
import { authLimiter } from '../middleware/rateLimiter.js';

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

// Routes
router.post('/register', authLimiter, registerValidation, register);
router.post('/login', authLimiter, loginValidation, login);
router.post('/forgot-password', authLimiter, forgotPasswordValidation, forgotPassword);
router.post('/verify-otp', authLimiter, verifyOTPValidation, verifyOTP);
router.post('/reset-password', authLimiter, resetPasswordValidation, resetPassword);
router.get('/me', authenticate, getMe);
router.put('/profile', authenticate, profileValidation, updateProfile);

export default router;
