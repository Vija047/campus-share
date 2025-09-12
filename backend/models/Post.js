import mongoose from 'mongoose';

const postSchema = new mongoose.Schema({
    content: {
        type: String,
        required: [true, 'Content is required'],
        maxlength: [1000, 'Content cannot exceed 1000 characters']
    },
    author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    semester: {
        type: String,
        required: [true, 'Semester is required'],
        enum: ['1', '2', '3', '4', '5', '6', '7', '8', 'general']
    },
    upvotes: [{
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        createdAt: {
            type: Date,
            default: Date.now
        }
    }],
    downvotes: [{
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        createdAt: {
            type: Date,
            default: Date.now
        }
    }],
    replies: [{
        content: {
            type: String,
            required: true,
            maxlength: [500, 'Reply cannot exceed 500 characters']
        },
        author: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        createdAt: {
            type: Date,
            default: Date.now
        },
        upvotes: [{
            user: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'User'
            },
            createdAt: {
                type: Date,
                default: Date.now
            }
        }]
    }],
    tags: [{
        type: String,
        trim: true
    }],
    attachments: [{
        url: String,
        type: String,
        name: String
    }],
    isReported: {
        type: Boolean,
        default: false
    },
    reportCount: {
        type: Number,
        default: 0
    }
}, {
    timestamps: true
});

// Indexes
postSchema.index({ semester: 1, createdAt: -1 });
postSchema.index({ author: 1 });
postSchema.index({ upvotes: -1 });

// Virtual for upvotes count
postSchema.virtual('upvotesCount').get(function () {
    return this.upvotes.length;
});

// Virtual for downvotes count
postSchema.virtual('downvotesCount').get(function () {
    return this.downvotes.length;
});

// Virtual for replies count
postSchema.virtual('repliesCount').get(function () {
    return this.replies.length;
});

// Ensure virtuals are included when converting to JSON
postSchema.set('toJSON', { virtuals: true });
postSchema.set('toObject', { virtuals: true });

export default mongoose.model('Post', postSchema);
