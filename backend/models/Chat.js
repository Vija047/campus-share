import mongoose from 'mongoose';

const chatSchema = new mongoose.Schema({
    semesterId: {
        type: String,
        required: [true, 'Semester ID is required'],
        enum: ['1', '2', '3', '4', '5', '6', '7', '8', 'general']
    },
    sender: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    message: {
        type: String,
        required: [true, 'Message is required'],
        maxlength: [1000, 'Message cannot exceed 1000 characters']
    },
    messageType: {
        type: String,
        enum: ['text', 'file', 'image'],
        default: 'text'
    },
    fileURL: {
        type: String
    },
    fileName: {
        type: String
    },
    isEdited: {
        type: Boolean,
        default: false
    },
    editedAt: {
        type: Date
    },
    replyTo: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Chat'
    },
    reactions: [{
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        emoji: {
            type: String,
            required: true
        },
        createdAt: {
            type: Date,
            default: Date.now
        }
    }],
    readBy: [{
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        readAt: {
            type: Date,
            default: Date.now
        }
    }],
    isDeleted: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
});

// Indexes for better performance
chatSchema.index({ semesterId: 1, createdAt: -1 });
chatSchema.index({ sender: 1 });
chatSchema.index({ createdAt: -1 });

export default mongoose.model('Chat', chatSchema);
