import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema({
    // The user who will receive this notification
    recipient: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },

    // The user who triggered this notification (e.g., who liked a post, uploaded a note)
    sender: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: false // Can be null for system notifications
    },

    // Type of notification
    type: {
        type: String,
        required: true,
        enum: [
            'like',           // Someone liked your post
            'comment',        // Someone commented on your post
            'new_note',       // New note uploaded in your subject/interest
            'note_approved',  // Your uploaded note was approved
            'note_rejected',  // Your uploaded note was rejected
            'follow',         // Someone followed you
            'message',        // New chat message
            'system'          // System notifications
        ]
    },

    // Title/summary of the notification
    title: {
        type: String,
        required: true,
        maxlength: 100
    },

    // Detailed message
    message: {
        type: String,
        required: true,
        maxlength: 500
    },

    // Reference to the related object (post, note, comment, etc.)
    relatedId: {
        type: mongoose.Schema.Types.ObjectId,
        required: false
    },

    // Type of the related object
    relatedType: {
        type: String,
        enum: ['Post', 'Note', 'Comment', 'User'],
        required: false
    },

    // Whether the notification has been read
    isRead: {
        type: Boolean,
        default: false,
        index: true
    },

    // Priority level
    priority: {
        type: String,
        enum: ['low', 'medium', 'high'],
        default: 'medium'
    },

    // Optional data payload for rich notifications
    data: {
        type: mongoose.Schema.Types.Mixed,
        default: {}
    }
}, {
    timestamps: true // Creates createdAt and updatedAt fields
});

// Indexes for efficient queries
notificationSchema.index({ recipient: 1, createdAt: -1 });
notificationSchema.index({ recipient: 1, isRead: 1 });
notificationSchema.index({ recipient: 1, type: 1 });

// Instance methods
notificationSchema.methods.markAsRead = function () {
    this.isRead = true;
    return this.save();
};

// Static methods
notificationSchema.statics.createNotification = async function (data) {
    const notification = new this(data);
    return await notification.save();
};

notificationSchema.statics.getUnreadCount = async function (userId) {
    return await this.countDocuments({
        recipient: userId,
        isRead: false
    });
};

notificationSchema.statics.markAllAsRead = async function (userId) {
    return await this.updateMany(
        { recipient: userId, isRead: false },
        { isRead: true }
    );
};

// Pre-save middleware to populate sender info
notificationSchema.pre('save', function (next) {
    if (this.isNew && this.type === 'system') {
        this.sender = null; // System notifications don't have a sender
    }
    next();
});

const Notification = mongoose.model('Notification', notificationSchema);

export default Notification;