import express from 'express';
import {
    getUserNotifications,
    getNotificationCount,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    deleteAllNotifications,
    createNotification
} from '../controllers/notificationController.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

// Apply authentication middleware to all notification routes
router.use(authenticate);

// GET /api/notifications - Get all notifications for the authenticated user
// Query params: page, limit, unreadOnly, type
router.get('/', getUserNotifications);

// GET /api/notifications/count - Get notification count summary
router.get('/count', getNotificationCount);

// PUT /api/notifications/:id/read - Mark a specific notification as read
router.put('/:id/read', markAsRead);

// PUT /api/notifications/mark-all-read - Mark all notifications as read
router.put('/mark-all-read', markAllAsRead);

// DELETE /api/notifications/:id - Delete a specific notification
router.delete('/:id', deleteNotification);

// DELETE /api/notifications - Delete all notifications for user
router.delete('/', deleteAllNotifications);

// POST /api/notifications - Create a new notification (for admin/system use)
router.post('/', createNotification);

export default router;