import Notification from '../models/Notification.js';
import { catchAsyncError } from '../middleware/errorHandler.js';
import { emitNotification } from '../socket/socketHandler.js';

// @desc    Get all notifications for authenticated user
// @route   GET /api/notifications
// @access  Private
export const getUserNotifications = catchAsyncError(async (req, res) => {
    const { page = 1, limit = 20, filter = 'all' } = req.query;
    const skip = (page - 1) * limit;

    let query = { recipient: req.user._id };

    // Filter by read status
    if (filter === 'unread') {
        query.isRead = false;
    } else if (filter === 'read') {
        query.isRead = true;
    }

    const notifications = await Notification.find(query)
        .populate('sender', 'name email profilePicture')
        .populate('data.noteId', 'title subject')
        .populate('data.postId', 'title')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit));

    const total = await Notification.countDocuments(query);
    const unreadCount = await Notification.countDocuments({
        recipient: req.user._id,
        isRead: false
    });

    res.status(200).json({
        success: true,
        data: {
            notifications,
            pagination: {
                currentPage: parseInt(page),
                totalPages: Math.ceil(total / limit),
                total,
                hasNext: skip + notifications.length < total,
                hasPrev: page > 1
            },
            unreadCount
        }
    });
});

// @desc    Mark notification as read
// @route   PUT /api/notifications/:id/read
// @access  Private
export const markAsRead = catchAsyncError(async (req, res) => {
    const notification = await Notification.findOneAndUpdate(
        {
            _id: req.params.id,
            recipient: req.user._id
        },
        {
            isRead: true,
            readAt: new Date()
        },
        { new: true }
    );

    if (!notification) {
        return res.status(404).json({
            success: false,
            message: 'Notification not found'
        });
    }

    res.status(200).json({
        success: true,
        data: notification
    });
});

// @desc    Mark all notifications as read
// @route   PUT /api/notifications/mark-all-read
// @access  Private
export const markAllAsRead = catchAsyncError(async (req, res) => {
    const result = await Notification.updateMany(
        {
            recipient: req.user._id,
            isRead: false
        },
        {
            isRead: true,
            readAt: new Date()
        }
    );

    res.status(200).json({
        success: true,
        message: `Marked ${result.modifiedCount} notifications as read`,
        data: {
            modifiedCount: result.modifiedCount
        }
    });
});

// @desc    Delete notification
// @route   DELETE /api/notifications/:id
// @access  Private
export const deleteNotification = catchAsyncError(async (req, res) => {
    const notification = await Notification.findOneAndDelete({
        _id: req.params.id,
        recipient: req.user._id
    });

    if (!notification) {
        return res.status(404).json({
            success: false,
            message: 'Notification not found'
        });
    }

    res.status(200).json({
        success: true,
        message: 'Notification deleted successfully'
    });
});

// @desc    Delete all read notifications
// @route   DELETE /api/notifications/clear-read
// @access  Private
export const clearReadNotifications = catchAsyncError(async (req, res) => {
    const result = await Notification.deleteMany({
        recipient: req.user._id,
        isRead: true
    });

    res.status(200).json({
        success: true,
        message: `Deleted ${result.deletedCount} read notifications`,
        data: {
            deletedCount: result.deletedCount
        }
    });
});

// @desc    Get notification count summary
// @route   GET /api/notifications/count
// @access  Private
export const getNotificationCount = catchAsyncError(async (req, res) => {
    const unreadCount = await Notification.countDocuments({
        recipient: req.user._id,
        isRead: false
    });

    const totalCount = await Notification.countDocuments({
        recipient: req.user._id
    });

    res.status(200).json({
        success: true,
        data: {
            unread: unreadCount,
            total: totalCount
        }
    });
});

// @desc    Create notification (internal function for other controllers)
// @access  Internal
export const createNotification = async (notificationData) => {
    try {
        const notification = new Notification(notificationData);
        await notification.save();

        // Populate the notification for real-time updates
        await notification.populate('sender', 'name email profilePicture');
        await notification.populate('data.noteId', 'title subject');
        await notification.populate('data.postId', 'title');

        // Emit real-time notification to the recipient
        emitNotification(notificationData.recipient, {
            type: 'new_notification',
            data: notification
        });

        return notification;
    } catch (error) {
        console.error('Error creating notification:', error);
        throw error;
    }
};