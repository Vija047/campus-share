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

// Helper function to clean up expired unverified users
const cleanupExpiredUnverifiedUsers = async () => {
    try {
        const expiredUsers = await User.deleteMany({
            isEmailVerified: false,
            emailVerificationExpires: { $lt: new Date() }
        });
        if (expiredUsers.deletedCount > 0) {
            console.log(`Cleaned up ${expiredUsers.deletedCount} expired unverified users`);
        }
    } catch (error) {
        console.error('Error cleaning up expired users:', error);
    }
};

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
export const register = async (req, res) => {
    try {
        const { name, email, password, semester, department, gender } = req.body;

        // Validate required fields
        if (!name || !email || !password || !semester || !department || !gender) {
            return res.status(400).json({
                success: false,
                message: 'All fields are required'
            });
        }

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({
                success: false,
                message: 'Please provide a valid email address'
            });
        }

        // Validate password length
        if (password.length < 6) {
            return res.status(400).json({
                success: false,
                message: 'Password must be at least 6 characters long'
            });
        }

        // Clean up expired unverified users (non-blocking)
        cleanupExpiredUnverifiedUsers().catch(err =>
            console.error('Cleanup failed:', err)
        );

        // Check if user already exists
        const existingUser = await User.findOne({ email: email.toLowerCase() });
        if (existingUser) {
            // If user exists but email is not verified, allow re-registration by updating the existing user
            if (!existingUser.isEmailVerified) {
                // Generate new verification code
                const verificationCode = crypto.randomInt(100000, 999999).toString();

                // Update existing user with new details
                existingUser.name = name;
                existingUser.password = password; // This will be hashed by the pre-save middleware
                existingUser.semester = semester;
                existingUser.department = department;
                existingUser.gender = gender;
                existingUser.emailVerificationCode = verificationCode;
                existingUser.emailVerificationExpires = new Date(Date.now() + 15 * 60 * 1000);

                await existingUser.save();

                // Send verification email (with proper error handling for production)
                try {
                    const emailResult = await sendEmailVerificationCode(existingUser, verificationCode);
                    if (emailResult && !emailResult.error) {
                        console.log('Verification email sent successfully');
                    } else {
                        console.error('Verification email failed:', emailResult?.error || 'Unknown error');

                        // In production, if email fails, we should still allow registration
                        // but inform the user about the email issue
                        if (process.env.NODE_ENV === 'production') {
                            return res.status(201).json({
                                success: true,
                                message: 'Registration updated! However, there was an issue sending the verification email. Please try to resend the verification code.',
                                emailWarning: true,
                                data: {
                                    user: {
                                        id: existingUser._id,
                                        email: existingUser.email,
                                        isEmailVerified: existingUser.isEmailVerified
                                    }
                                }
                            });
                        }
                    }
                } catch (err) {
                    console.error('Verification email failed:', err);

                    // In production, if email completely fails, still allow registration
                    if (process.env.NODE_ENV === 'production') {
                        return res.status(201).json({
                            success: true,
                            message: 'Registration updated! However, we could not send the verification email at this time. Please try to resend the verification code later.',
                            emailError: true,
                            data: {
                                user: {
                                    id: existingUser._id,
                                    email: existingUser.email,
                                    isEmailVerified: existingUser.isEmailVerified
                                }
                            }
                        });
                    }
                }

                return res.status(201).json({
                    success: true,
                    message: 'Registration updated! Please check your email for the verification code.',
                    data: {
                        user: {
                            id: existingUser._id,
                            email: existingUser.email,
                            isEmailVerified: existingUser.isEmailVerified
                        }
                    }
                });
            } else {
                // User exists and is verified
                return res.status(400).json({
                    success: false,
                    message: 'User with this email already exists and is verified. Please login instead.'
                });
            }
        }

        // Generate verification code
        const verificationCode = crypto.randomInt(100000, 999999).toString();

        // Create user directly
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

        // Send verification email (with proper error handling for production)
        try {
            const emailResult = await sendEmailVerificationCode(user, verificationCode);
            if (emailResult && !emailResult.error) {
                console.log('Verification email sent successfully');
            } else {
                console.error('Verification email failed:', emailResult?.error || 'Unknown error');

                // In production, if email fails, we should still allow registration
                // but inform the user about the email issue
                if (process.env.NODE_ENV === 'production') {
                    return res.status(201).json({
                        success: true,
                        message: 'Registration successful! However, there was an issue sending the verification email. Please try to resend the verification code.',
                        emailWarning: true,
                        data: {
                            user: {
                                id: user._id,
                                email: user.email,
                                isEmailVerified: user.isEmailVerified
                            }
                        }
                    });
                }
            }
        } catch (err) {
            console.error('Verification email failed:', err);

            // In production, if email completely fails, still allow registration
            if (process.env.NODE_ENV === 'production') {
                return res.status(201).json({
                    success: true,
                    message: 'Registration successful! However, we could not send the verification email at this time. Please try to resend the verification code later.',
                    emailError: true,
                    data: {
                        user: {
                            id: user._id,
                            email: user.email,
                            isEmailVerified: user.isEmailVerified
                        }
                    }
                });
            }
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

        // ✅ Only check if the email exists in the database
        const user = await User.findOne({ email: email.toLowerCase() })
            .select('+password +failedLoginAttempts +accountLockedUntil');

        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Email not found. Please register first.'
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

            const updatedUser = await User.findById(user._id).select('+failedLoginAttempts +accountLockedUntil');
            if (updatedUser.isLocked) {
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

        const user = await User.findOne({ email: email.toLowerCase() });
        if (!user) {
            return res.status(200).json({
                success: true,
                message: 'If an account with this email exists, you will receive a password reset OTP shortly.'
            });
        }

        const otp = crypto.randomInt(100000, 999999).toString();
        user.resetOTP = crypto.createHash('sha256').update(otp).digest('hex');
        user.resetOTPExpires = Date.now() + 10 * 60 * 1000;
        user.resetOTPUsed = false;
        await user.save();

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

        const hashedOTP = crypto.createHash('sha256').update(otp).digest('hex');

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

        const hashedOTP = crypto.createHash('sha256').update(otp).digest('hex');

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

        user.resetOTPUsed = true;
        await user.save();

        user.password = newPassword;
        user.resetOTP = undefined;
        user.resetOTPExpires = undefined;
        user.resetOTPUsed = undefined;
        user.failedLoginAttempts = 0;
        user.accountLockedUntil = undefined;

        await user.save();

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

        if (user.emailVerificationExpires < new Date()) {
            return res.status(400).json({
                success: false,
                message: 'Verification code has expired. Please request a new one.'
            });
        }

        user.isEmailVerified = true;
        user.emailVerificationCode = undefined;
        user.emailVerificationExpires = undefined;
        await user.save();

        try {
            await sendWelcomeEmail(user);
            console.log('Welcome email sent successfully');
        } catch (err) {
            console.error('Welcome email failed:', err);
        }

        const token = generateToken(user._id);

        res.status(200).json({
            success: true,
            message: 'Email verified successfully!',
            data: {
                user,
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

        const verificationCode = crypto.randomInt(100000, 999999).toString();
        user.emailVerificationCode = verificationCode;
        user.emailVerificationExpires = new Date(Date.now() + 15 * 60 * 1000);
        await user.save();

        try {
            const emailResult = await sendEmailVerificationCode(user, verificationCode);
            if (emailResult && !emailResult.error) {
                console.log('Verification email resent successfully');
                return res.status(200).json({
                    success: true,
                    message: 'Verification code sent successfully! Please check your email.'
                });
            } else {
                console.error('Verification email failed:', emailResult?.error || 'Unknown error');

                // In production, return error if email fails
                if (process.env.NODE_ENV === 'production') {
                    return res.status(500).json({
                        success: false,
                        message: 'Failed to send verification email. Please check your email configuration or try again later.',
                        error: emailResult?.error || 'Email service unavailable'
                    });
                }

                // In development, still return success for testing
                return res.status(200).json({
                    success: true,
                    message: 'Verification code generated (email sending failed in development mode).',
                    emailWarning: true
                });
            }
        } catch (err) {
            console.error('Verification email failed:', err);

            // In production, return error if email completely fails
            if (process.env.NODE_ENV === 'production') {
                return res.status(500).json({
                    success: false,
                    message: 'Email service is currently unavailable. Please try again later.',
                    error: err.message
                });
            }

            // In development, still return success for testing
            return res.status(200).json({
                success: true,
                message: 'Verification code generated (email sending failed in development mode).',
                emailError: true
            });
        }
    } catch (error) {
        console.error('Resend verification error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to resend verification code',
            error: error.message
        });
    }
};
