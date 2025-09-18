import express from 'express';
import rateLimit from 'express-rate-limit';
import {
    getUserNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearReadNotifications,
    getNotificationCount
} from '../controllers/notificationController.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

// Apply authentication middleware to all routes
router.use(authenticate);

// Apply rate limiting to prevent spam
const notificationLimiter = rateLimit({
    windowMs: 5 * 60 * 1000, // 5 minutes
    max: 300, // Limit each user to 300 requests per 5 minutes (1 per second average)
    message: {
        success: false,
        message: 'Too many notification requests, please try again in a moment.'
    },
    standardHeaders: true,
    legacyHeaders: false,
    skipSuccessfulRequests: true, // Don't count successful requests toward limit
    keyGenerator: (req) => {
        // Use user ID if authenticated, fallback to IP
        return req.user?.id || req.ip;
    },
    // Allow burst requests but with a sliding window
    skip: (req) => {
        // Skip rate limiting for simple count requests during normal usage
        return req.path === '/count' && req.method === 'GET';
    }
});

router.use(notificationLimiter);

// @route   GET /api/notifications
// @desc    Get all notifications for authenticated user
// @access  Private
router.get('/', getUserNotifications);

// @route   GET /api/notifications/count
// @desc    Get notification count summary
// @access  Private
router.get('/count', getNotificationCount);

// @route   PUT /api/notifications/mark-all-read
// @desc    Mark all notifications as read
// @access  Private
router.put('/mark-all-read', markAllAsRead);

// @route   DELETE /api/notifications/clear-read
// @desc    Delete all read notifications
// @access  Private
router.delete('/clear-read', clearReadNotifications);

// @route   PUT /api/notifications/:id/read
// @desc    Mark specific notification as read
// @access  Private
router.put('/:id/read', markAsRead);

// @route   DELETE /api/notifications/:id
// @desc    Delete specific notification
// @access  Private
router.delete('/:id', deleteNotification);

export default router;