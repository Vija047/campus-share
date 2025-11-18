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
        enum: [
            'Computer Science',
            'Information Technology',
            'Electronics and Communication',
            'Electrical Engineering',
            'Mechanical Engineering',
            'Civil Engineering',
            'Chemical Engineering',
            'Biotechnology',
            'Mathematics',
            'Physics',
            'Chemistry',
            'Business Administration',
            'Other'
        ]
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
    },
    resetOTP: {
        type: String,
        select: false
    },
    resetOTPExpires: {
        type: Date,
        select: false
    },
    resetOTPUsed: {
        type: Boolean,
        default: false,
        select: false
    },
    isEmailVerified: {
        type: Boolean,
        default: true  // Set to true by default since we're removing email verification
    },
    failedLoginAttempts: {
        type: Number,
        default: 0
    },
    accountLockedUntil: {
        type: Date
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

// Virtual for checking if account is locked
userSchema.virtual('isLocked').get(function () {
    return !!(this.failedLoginAttempts >= 5 && this.accountLockedUntil && Date.now() < this.accountLockedUntil);
});

// Increment failed login attempts
userSchema.methods.incLoginAttempts = function () {
    // If we have a previous lock that has expired, restart at 1
    if (this.accountLockedUntil && this.accountLockedUntil < Date.now()) {
        return this.updateOne({
            $unset: { accountLockedUntil: 1 },
            $set: { failedLoginAttempts: 1 }
        });
    }

    const updates = { $inc: { failedLoginAttempts: 1 } };

    // Lock account after 5 failed attempts for 2 hours
    if (this.failedLoginAttempts + 1 >= 5 && !this.isLocked) {
        updates.$set = { accountLockedUntil: Date.now() + 2 * 60 * 60 * 1000 }; // 2 hours
    }

    return this.updateOne(updates);
};

// Reset failed login attempts
userSchema.methods.resetLoginAttempts = function () {
    return this.updateOne({
        $unset: { failedLoginAttempts: 1, accountLockedUntil: 1 }
    });
};

export default mongoose.model('User', userSchema);
