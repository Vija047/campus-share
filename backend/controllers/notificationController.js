import Notification from '../models/Notification.js';
import mongoose from 'mongoose';

// Get all notifications for the authenticated user
export const getUserNotifications = async (req, res) => {
    try {
        const userId = req.user.id;
        const { page = 1, limit = 20, unreadOnly = false, type } = req.query;

        // Build query filter
        const filter = { recipient: userId };

        if (unreadOnly === 'true') {
            filter.isRead = false;
        }

        if (type) {
            filter.type = type;
        }

        // Calculate pagination
        const skip = (parseInt(page) - 1) * parseInt(limit);

        // Get notifications with pagination
        const notifications = await Notification.find(filter)
            .populate('sender', 'name email profilePicture')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(parseInt(limit));

        // Get total count for pagination
        const total = await Notification.countDocuments(filter);

        res.json({
            success: true,
            data: {
                notifications,
                pagination: {
                    page: parseInt(page),
                    limit: parseInt(limit),
                    total,
                    pages: Math.ceil(total / parseInt(limit))
                }
            }
        });
    } catch (error) {
        console.error('Error fetching notifications:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch notifications',
            error: error.message
        });
    }
};

// Get notification count summary
export const getNotificationCount = async (req, res) => {
    try {
        const userId = req.user.id;

        const [total, unread, byType] = await Promise.all([
            // Total notifications
            Notification.countDocuments({ recipient: userId }),

            // Unread notifications
            Notification.countDocuments({ recipient: userId, isRead: false }),

            // Count by type
            Notification.aggregate([
                { $match: { recipient: new mongoose.Types.ObjectId(userId) } },
                { $group: { _id: '$type', count: { $sum: 1 } } }
            ])
        ]);

        // Format type counts
        const typeCounts = {};
        byType.forEach(item => {
            typeCounts[item._id] = item.count;
        });

        res.json({
            success: true,
            data: {
                total,
                unread,
                byType: typeCounts
            }
        });
    } catch (error) {
        console.error('Error fetching notification count:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch notification count',
            error: error.message
        });
    }
};

// Mark a specific notification as read
export const markAsRead = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;

        // Validate notification ID
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid notification ID'
            });
        }

        const notification = await Notification.findOne({
            _id: id,
            recipient: userId
        });

        if (!notification) {
            return res.status(404).json({
                success: false,
                message: 'Notification not found'
            });
        }

        notification.isRead = true;
        await notification.save();

        res.json({
            success: true,
            message: 'Notification marked as read',
            data: notification
        });
    } catch (error) {
        console.error('Error marking notification as read:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to mark notification as read',
            error: error.message
        });
    }
};

// Mark all notifications as read
export const markAllAsRead = async (req, res) => {
    try {
        const userId = req.user.id;

        const result = await Notification.updateMany(
            { recipient: userId, isRead: false },
            { isRead: true }
        );

        res.json({
            success: true,
            message: `Marked ${result.modifiedCount} notifications as read`,
            data: {
                modifiedCount: result.modifiedCount
            }
        });
    } catch (error) {
        console.error('Error marking all notifications as read:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to mark all notifications as read',
            error: error.message
        });
    }
};

// Delete a specific notification
export const deleteNotification = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;

        // Validate notification ID
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid notification ID'
            });
        }

        const notification = await Notification.findOneAndDelete({
            _id: id,
            recipient: userId
        });

        if (!notification) {
            return res.status(404).json({
                success: false,
                message: 'Notification not found'
            });
        }

        res.json({
            success: true,
            message: 'Notification deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting notification:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to delete notification',
            error: error.message
        });
    }
};

// Delete all notifications for user
export const deleteAllNotifications = async (req, res) => {
    try {
        const userId = req.user.id;

        const result = await Notification.deleteMany({
            recipient: userId
        });

        res.json({
            success: true,
            message: `Deleted ${result.deletedCount} notifications`,
            data: {
                deletedCount: result.deletedCount
            }
        });
    } catch (error) {
        console.error('Error deleting all notifications:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to delete all notifications',
            error: error.message
        });
    }
};

// Create a new notification (usually called by other parts of the system)
export const createNotification = async (req, res) => {
    try {
        const { recipient, sender, type, title, message, relatedId, relatedType, priority = 'medium', data = {} } = req.body;

        // Validate required fields
        if (!recipient || !type || !title || !message) {
            return res.status(400).json({
                success: false,
                message: 'Missing required fields: recipient, type, title, message'
            });
        }

        const notification = await Notification.create({
            recipient,
            sender,
            type,
            title,
            message,
            relatedId,
            relatedType,
            priority,
            data
        });

        // Populate sender info
        await notification.populate('sender', 'name email profilePicture');

        res.status(201).json({
            success: true,
            message: 'Notification created successfully',
            data: notification
        });
    } catch (error) {
        console.error('Error creating notification:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to create notification',
            error: error.message
        });
    }
};

// Helper function to create notifications (for internal use)
export const createNotificationHelper = async (notificationData) => {
    try {
        const notification = await Notification.create(notificationData);
        return notification;
    } catch (error) {
        console.error('Error creating notification:', error);
        throw error;
    }
};