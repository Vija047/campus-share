import express from 'express';
import { body } from 'express-validator';
import { register, login, getMe, updateProfile } from '../controllers/authController.js';
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

// Routes
router.post('/register', authLimiter, registerValidation, register);
router.post('/login', authLimiter, loginValidation, login);
router.get('/me', authenticate, getMe);
router.put('/profile', authenticate, profileValidation, updateProfile);

export default router;
