import User from '../models/User.js';
import { generateToken } from '../utils/jwt.js';
import { sendWelcomeEmail, sendOTPEmail } from '../utils/email.js';
import crypto from 'crypto';

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
export const register = async (req, res) => {
    try {
        const { name, email, password, semester, department, gender } = req.body;

        // Check if user exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: 'User already exists with this email'
            });
        }

        // Create user
        const user = await User.create({
            name,
            email,
            password,
            semester,
            department,
            gender
        });

        // Generate token
        const token = generateToken(user._id);

        // Send welcome email (don't wait for it)
        sendWelcomeEmail(user).catch(err => console.error('Welcome email failed:', err));

        res.status(201).json({
            success: true,
            message: 'User registered successfully',
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
                },
                token
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

        // Check if user exists and select password
        const user = await User.findOne({ email }).select('+password');
        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials'
            });
        }

        // Check if account is active
        if (!user.isActive) {
            return res.status(401).json({
                success: false,
                message: 'Account is deactivated'
            });
        }

        // Check password
        const isPasswordCorrect = await user.comparePassword(password);
        if (!isPasswordCorrect) {
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials'
            });
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

        // Find user by email
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found with this email address'
            });
        }

        // Generate 6-digit OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString();

        // Set OTP and expiration (10 minutes)
        user.resetOTP = otp;
        user.resetOTPExpires = Date.now() + 10 * 60 * 1000; // 10 minutes
        await user.save();

        // Send OTP email
        await sendOTPEmail(user, otp);

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

        // Find user with OTP
        const user = await User.findOne({
            email,
            resetOTP: otp,
            resetOTPExpires: { $gt: Date.now() }
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

        // Find user with valid OTP
        const user = await User.findOne({
            email,
            resetOTP: otp,
            resetOTPExpires: { $gt: Date.now() }
        }).select('+password');

        if (!user) {
            return res.status(400).json({
                success: false,
                message: 'Invalid or expired OTP'
            });
        }

        // Update password and clear OTP fields
        user.password = newPassword;
        user.resetOTP = undefined;
        user.resetOTPExpires = undefined;
        await user.save();

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
