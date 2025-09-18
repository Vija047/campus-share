import mongoose from 'mongoose';

const noteSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Title is required'],
        trim: true,
        maxlength: [100, 'Title cannot exceed 100 characters']
    },
    subject: {
        type: String,
        required: [true, 'Subject is required'],
        trim: true
    },
    semester: {
        type: String,
        required: [true, 'Semester is required'],
        enum: ['1', '2', '3', '4', '5', '6', '7', '8']
    },
    examType: {
        type: String,
        required: [true, 'Exam type is required'],
        enum: ['Mid-term', 'Final', 'Quiz', 'Assignment', 'Lab Report', 'Project', 'Study Material', 'Other'],
        default: 'Study Material'
    },
    description: {
        type: String,
        required: [true, 'Description is required'],
        trim: true,
        maxlength: [500, 'Description cannot exceed 500 characters'],
        default: 'No description provided'
    },
    fileURL: {
        type: String,
        required: [true, 'File URL is required']
    },
    fileName: {
        type: String,
        required: true
    },
    localFileName: {
        type: String,
        default: null // Will be set if file is stored locally instead of Cloudinary
    },
    fileType: {
        type: String,
        required: true,
        enum: ['pdf', 'docx', 'ppt', 'pptx']
    },
    fileSize: {
        type: Number,
        required: true
    },
    uploader: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    likes: [{
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        createdAt: {
            type: Date,
            default: Date.now
        }
    }],
    downloads: {
        type: Number,
        default: 0
    },
    downloadedBy: [{
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        downloadedAt: {
            type: Date,
            default: Date.now
        }
    }],
    shareLink: {
        type: String,
        unique: true
    },
    tags: [{
        type: String,
        trim: true
    }],
    isApproved: {
        type: Boolean,
        default: true
    },
    views: {
        type: Number,
        default: 0
    },
    viewedBy: [{
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        date: {
            type: Date,
            default: Date.now
        }
    }]
}, {
    timestamps: true
});

// Indexes for better query performance
noteSchema.index({ semester: 1, subject: 1, examType: 1 });
noteSchema.index({ uploader: 1 });
noteSchema.index({ createdAt: -1 });
noteSchema.index({ likes: -1 });

// Virtual for likes count
noteSchema.virtual('likesCount').get(function () {
    return this.likes ? this.likes.length : 0;
});

// Virtual for downloads count
noteSchema.virtual('downloadsCount').get(function () {
    return this.downloadedBy ? this.downloadedBy.length : 0;
});

// Ensure virtuals are included when converting to JSON
noteSchema.set('toJSON', { virtuals: true });
noteSchema.set('toObject', { virtuals: true });

export default mongoose.model('Note', noteSchema);
