import User from '../models/User.js';
import { generateToken } from '../utils/jwt.js';
import {
    sendWelcomeEmail,
    sendOTPEmail,
    sendPasswordResetSuccessEmail,
    sendAccountLockedEmail,
    sendEmailVerificationCode
} from '../utils/email.js';
import crypto from 'crypto';

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
export const register = async (req, res) => {
    try {
        const { name, email, password, semester, department, gender } = req.body;

        // Basic email format validation - only local validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({
                success: false,
                message: 'Please enter a valid email address'
            });
        }

        // Check if user exists in database - only database check, no external validation
        const existingUser = await User.findOne({ email: email.toLowerCase() });
        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: 'User already exists with this email'
            });
        }

        // Generate verification code
        const verificationCode = crypto.randomInt(100000, 999999).toString();

        // Create user with verification code
        const user = await User.create({
            name,
            email: email.toLowerCase(),
            password,
            semester,
            department,
            gender,
            emailVerificationCode: verificationCode,
            emailVerificationExpires: new Date(Date.now() + 15 * 60 * 1000) // 15 minutes
        });

        // Send verification email (don't wait for it)
        try {
            await sendEmailVerificationCode(user, verificationCode);
            console.log('Verification email sent successfully');
        } catch (err) {
            console.error('Verification email failed:', err);
            // Continue with registration even if email fails
        }

        res.status(201).json({
            success: true,
            message: 'Registration successful! Please check your email for the verification code.',
            data: {
                user: {
                    id: user._id,
                    email: user.email,
                    isEmailVerified: user.isEmailVerified
                }
            }
        });
    } catch (error) {
        console.error('Registration error:', error);
        if (error.code === 11000) {
            return res.status(400).json({
                success: false,
                message: 'User already exists with this email'
            });
        }
        res.status(500).json({
            success: false,
            message: 'Registration failed',
            error: error.message
        });
    }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
export const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        const ipAddress = req.ip || req.connection.remoteAddress || 'Unknown';

        // Check if user exists and select password and account lock fields
        const user = await User.findOne({ email: email.toLowerCase() })
            .select('+password +failedLoginAttempts +accountLockedUntil');

        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials'
            });
        }

        // Check if account is locked
        if (user.isLocked) {
            const lockTimeRemaining = Math.ceil((user.accountLockedUntil - Date.now()) / (1000 * 60)); // minutes
            return res.status(423).json({
                success: false,
                message: `Account is temporarily locked due to too many failed login attempts. Please try again in ${lockTimeRemaining} minutes.`,
                accountLocked: true,
                lockTimeRemaining
            });
        }

        // Check if account is active
        if (!user.isActive) {
            await user.incLoginAttempts();
            return res.status(401).json({
                success: false,
                message: 'Account is deactivated'
            });
        }

        // Check if email is verified
        if (!user.isEmailVerified) {
            return res.status(403).json({
                success: false,
                message: 'Please verify your email address before logging in',
                emailNotVerified: true,
                email: user.email
            });
        }



        // Check password
        const isPasswordCorrect = await user.comparePassword(password);
        if (!isPasswordCorrect) {
            await user.incLoginAttempts();

            // Check if account should be locked after this attempt
            const updatedUser = await User.findById(user._id).select('+failedLoginAttempts +accountLockedUntil');
            if (updatedUser.isLocked) {
                // Send account locked email
                sendAccountLockedEmail(user).catch(err => console.error('Account locked email failed:', err));

                return res.status(423).json({
                    success: false,
                    message: 'Too many failed login attempts. Your account has been temporarily locked for 2 hours.',
                    accountLocked: true
                });
            }

            const remainingAttempts = 5 - updatedUser.failedLoginAttempts;
            return res.status(401).json({
                success: false,
                message: `Invalid credentials. ${remainingAttempts} attempts remaining before account lock.`,
                remainingAttempts
            });
        }

        // Reset failed login attempts on successful login
        if (user.failedLoginAttempts > 0) {
            await user.resetLoginAttempts();
        }

        // Update last login
        user.updateLastLogin();

        // Generate token
        const token = generateToken(user._id);

        res.json({
            success: true,
            message: 'Login successful',
            data: {
                user: {
                    id: user._id,
                    name: user.name,
                    email: user.email,
                    semester: user.semester,
                    department: user.department,
                    gender: user.gender,
                    role: user.role,
                    profilePicture: user.profilePicture,
                    bio: user.bio,
                    notesUploaded: user.notesUploaded,
                    likesReceived: user.likesReceived,
                    createdAt: user.createdAt,
                    lastLogin: user.lastLogin
                },
                token
            }
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({
            success: false,
            message: 'Login failed',
            error: error.message
        });
    }
};

// @desc    Get current user
// @route   GET /api/auth/me
// @access  Private
export const getMe = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);

        res.json({
            success: true,
            data: {
                user: {
                    id: user._id,
                    name: user.name,
                    email: user.email,
                    semester: user.semester,
                    department: user.department,
                    gender: user.gender,
                    role: user.role,
                    profilePicture: user.profilePicture,
                    bio: user.bio,
                    notesUploaded: user.notesUploaded,
                    likesReceived: user.likesReceived,
                    createdAt: user.createdAt,
                    lastLogin: user.lastLogin
                }
            }
        });
    } catch (error) {
        console.error('Get me error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get user data',
            error: error.message
        });
    }
};

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
export const updateProfile = async (req, res) => {
    try {
        const { name, bio, semester, department, gender, profilePicture } = req.body;

        const updateData = {};
        if (name) updateData.name = name;
        if (bio !== undefined) updateData.bio = bio;
        if (semester) updateData.semester = semester;
        if (department) updateData.department = department;
        if (gender) updateData.gender = gender;
        if (profilePicture) updateData.profilePicture = profilePicture;

        const user = await User.findByIdAndUpdate(
            req.user.id,
            updateData,
            { new: true, runValidators: true }
        );

        res.json({
            success: true,
            message: 'Profile updated successfully',
            data: {
                user: {
                    id: user._id,
                    name: user.name,
                    email: user.email,
                    semester: user.semester,
                    department: user.department,
                    gender: user.gender,
                    role: user.role,
                    profilePicture: user.profilePicture,
                    bio: user.bio,
                    notesUploaded: user.notesUploaded,
                    likesReceived: user.likesReceived,
                    createdAt: user.createdAt
                }
            }
        });
    } catch (error) {
        console.error('Update profile error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update profile',
            error: error.message
        });
    }
};



// @desc    Forgot password - Send OTP
// @route   POST /api/auth/forgot-password
// @access  Public
export const forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;
        const ipAddress = req.ip || req.connection.remoteAddress || 'Unknown';

        // Find user by email
        const user = await User.findOne({ email: email.toLowerCase() });
        if (!user) {
            // Don't reveal if email exists or not for security
            return res.status(200).json({
                success: true,
                message: 'If an account with this email exists, you will receive a password reset OTP shortly.'
            });
        }



        // Generate secure 6-digit OTP
        const otp = crypto.randomInt(100000, 999999).toString();

        // Set OTP, expiration and mark as unused (10 minutes)
        user.resetOTP = crypto.createHash('sha256').update(otp).digest('hex'); // Hash the OTP for storage
        user.resetOTPExpires = Date.now() + 10 * 60 * 1000; // 10 minutes
        user.resetOTPUsed = false;
        await user.save();

        // Send OTP email with IP address for security
        await sendOTPEmail(user, otp, ipAddress);

        res.status(200).json({
            success: true,
            message: 'OTP sent to your email address'
        });
    } catch (error) {
        console.error('Forgot password error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to send OTP',
            error: error.message
        });
    }
};

// @desc    Verify OTP
// @route   POST /api/auth/verify-otp
// @access  Public
export const verifyOTP = async (req, res) => {
    try {
        const { email, otp } = req.body;

        // Hash the provided OTP to compare with stored hash
        const hashedOTP = crypto.createHash('sha256').update(otp).digest('hex');

        // Find user with valid OTP
        const user = await User.findOne({
            email: email.toLowerCase(),
            resetOTP: hashedOTP,
            resetOTPExpires: { $gt: Date.now() },
            resetOTPUsed: false
        });

        if (!user) {
            return res.status(400).json({
                success: false,
                message: 'Invalid or expired OTP'
            });
        }

        res.status(200).json({
            success: true,
            message: 'OTP verified successfully'
        });
    } catch (error) {
        console.error('Verify OTP error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to verify OTP',
            error: error.message
        });
    }
};

// @desc    Reset password
// @route   POST /api/auth/reset-password
// @access  Public
export const resetPassword = async (req, res) => {
    try {
        const { email, otp, newPassword } = req.body;
        const ipAddress = req.ip || req.connection.remoteAddress || 'Unknown';

        // Hash the provided OTP to compare with stored hash
        const hashedOTP = crypto.createHash('sha256').update(otp).digest('hex');

        // Find user with valid OTP
        const user = await User.findOne({
            email: email.toLowerCase(),
            resetOTP: hashedOTP,
            resetOTPExpires: { $gt: Date.now() },
            resetOTPUsed: false
        }).select('+password');

        if (!user) {
            return res.status(400).json({
                success: false,
                message: 'Invalid or expired OTP'
            });
        }

        // Mark OTP as used to prevent reuse
        user.resetOTPUsed = true;
        await user.save();

        // Update password and clear OTP fields
        user.password = newPassword;
        user.resetOTP = undefined;
        user.resetOTPExpires = undefined;
        user.resetOTPUsed = undefined;

        // Reset any failed login attempts
        user.failedLoginAttempts = 0;
        user.accountLockedUntil = undefined;

        await user.save();

        // Send password reset success email
        sendPasswordResetSuccessEmail(user, ipAddress).catch(err =>
            console.error('Password reset success email failed:', err)
        );

        res.status(200).json({
            success: true,
            message: 'Password reset successfully'
        });
    } catch (error) {
        console.error('Reset password error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to reset password',
            error: error.message
        });
    }
};

// @desc    Verify email with code
// @route   POST /api/auth/verify-email
// @access  Public
export const verifyEmail = async (req, res) => {
    try {
        const { email, verificationCode } = req.body;

        if (!email || !verificationCode) {
            return res.status(400).json({
                success: false,
                message: 'Email and verification code are required'
            });
        }

        // Find user with verification code
        const user = await User.findOne({
            email: email.toLowerCase(),
            emailVerificationCode: verificationCode
        }).select('+emailVerificationCode +emailVerificationExpires');

        if (!user) {
            return res.status(400).json({
                success: false,
                message: 'Invalid verification code'
            });
        }

        // Check if code has expired
        if (user.emailVerificationExpires < new Date()) {
            return res.status(400).json({
                success: false,
                message: 'Verification code has expired. Please request a new one.'
            });
        }

        // Verify email
        user.isEmailVerified = true;
        user.emailVerificationCode = undefined;
        user.emailVerificationExpires = undefined;
        await user.save();

        // Send welcome email (don't wait for it)
        try {
            await sendWelcomeEmail(user);
            console.log('Welcome email sent successfully');
        } catch (err) {
            console.error('Welcome email failed:', err);
        }

        // Generate token for login
        const token = generateToken(user._id);

        res.status(200).json({
            success: true,
            message: 'Email verified successfully! Welcome to Student Notes Hub.',
            data: {
                user: {
                    id: user._id,
                    name: user.name,
                    email: user.email,
                    semester: user.semester,
                    department: user.department,
                    gender: user.gender,
                    role: user.role,
                    profilePicture: user.profilePicture,
                    bio: user.bio,
                    notesUploaded: user.notesUploaded,
                    likesReceived: user.likesReceived,
                    isEmailVerified: user.isEmailVerified,
                    createdAt: user.createdAt
                },
                token
            }
        });
    } catch (error) {
        console.error('Email verification error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to verify email',
            error: error.message
        });
    }
};

// @desc    Resend verification code
// @route   POST /api/auth/resend-verification
// @access  Public
export const resendVerificationCode = async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({
                success: false,
                message: 'Email is required'
            });
        }

        // Find user
        const user = await User.findOne({
            email: email.toLowerCase(),
            isEmailVerified: false
        });

        if (!user) {
            return res.status(400).json({
                success: false,
                message: 'User not found or already verified'
            });
        }

        // Generate new verification code
        const verificationCode = crypto.randomInt(100000, 999999).toString();

        user.emailVerificationCode = verificationCode;
        user.emailVerificationExpires = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes
        await user.save();

        // Send verification email (don't wait for it)
        try {
            await sendEmailVerificationCode(user, verificationCode);
            console.log('Verification email resent successfully');
        } catch (err) {
            console.error('Verification email failed:', err);
        }

        res.status(200).json({
            success: true,
            message: 'Verification code sent successfully! Please check your email.'
        });
    } catch (error) {
        console.error('Resend verification error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to resend verification code',
            error: error.message
        });
    }
};
