import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema({
    recipient: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    sender: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    type: {
        type: String,
        required: true,
        enum: [
            'new_note',
            'note_liked',
            'post_reply',
            'post_upvote',
            'semester_chat',
            'note_downloaded',
            'admin_message'
        ]
    },
    title: {
        type: String,
        required: true
    },
    message: {
        type: String,
        required: true
    },
    data: {
        noteId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Note'
        },
        postId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Post'
        },
        chatId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Chat'
        }
    },
    isRead: {
        type: Boolean,
        default: false
    },
    readAt: {
        type: Date
    }
}, {
    timestamps: true
});

// Indexes
notificationSchema.index({ recipient: 1, isRead: 1, createdAt: -1 });
notificationSchema.index({ createdAt: -1 });

export default mongoose.model('Notification', notificationSchema);
