import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Name is required'],
        trim: true,
        maxlength: [50, 'Name cannot exceed 50 characters']
    },
    email: {
        type: String,
        required: [true, 'Email is required'],
        unique: true,
        lowercase: true,
        match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
    },
    password: {
        type: String,
        required: [true, 'Password is required'],
        minlength: [6, 'Password must be at least 6 characters'],
        select: false
    },
    semester: {
        type: String,
        required: [true, 'Semester is required'],
        enum: ['1', '2', '3', '4', '5', '6', '7', '8']
    },
    department: {
        type: String,
        required: [true, 'Department is required'],
        enum: ['Computer Science', 'Information Technology', 'Electronics', 'Mechanical', 'Civil', 'Electrical', 'Chemical', 'Biotechnology', 'Other']
    },
    gender: {
        type: String,
        required: [true, 'Gender is required'],
        enum: ['male', 'female', 'other']
    },
    role: {
        type: String,
        enum: ['student', 'admin'],
        default: 'student'
    },
    bookmarkedNotes: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Note',
        default: []
    }],
    recentlyViewedNotes: [{
        noteId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Note'
        },
        viewedAt: {
            type: Date,
            default: Date.now
        }
    }],
    profilePicture: {
        type: String,
        default: ''
    },
    bio: {
        type: String,
        maxlength: [200, 'Bio cannot exceed 200 characters']
    },
    notesUploaded: {
        type: Number,
        default: 0
    },
    likesReceived: {
        type: Number,
        default: 0
    },
    isActive: {
        type: Boolean,
        default: true
    },
    lastLogin: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

// Hash password before saving
userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next();

    this.password = await bcrypt.hash(this.password, 12);
    next();
});

// Compare password method
userSchema.methods.comparePassword = async function (candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password);
};

// Update last login
userSchema.methods.updateLastLogin = function () {
    this.lastLogin = new Date();
    return this.save({ validateBeforeSave: false });
};

export default mongoose.model('User', userSchema);
