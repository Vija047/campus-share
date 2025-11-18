// User statistics and general cleanup script
import mongoose from 'mongoose';
import User from '../models/User.js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables from the correct path
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const getUserStats = async () => {
    try {
        console.log('Starting user statistics script...');
        console.log('MongoDB URI:', process.env.MONGODB_URI ? 'Found' : 'Not found');

        // Connect to MongoDB
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/student-notes-hub');
        console.log('Connected to MongoDB successfully!');

        // Get user statistics
        const totalUsers = await User.countDocuments();
        const activeUsers = await User.countDocuments({ isActive: true });
        const inactiveUsers = await User.countDocuments({ isActive: false });
        const lockedUsers = await User.countDocuments({ accountLockedUntil: { $gt: new Date() } });

        // Get users by role
        const adminUsers = await User.countDocuments({ role: 'admin' });
        const studentUsers = await User.countDocuments({ role: 'student' });

        console.log('\n=== User Statistics ===');
        console.log(`Total users: ${totalUsers}`);
        console.log(`Active users: ${activeUsers}`);
        console.log(`Inactive users: ${inactiveUsers}`);
        console.log(`Currently locked users: ${lockedUsers}`);
        console.log(`Admin users: ${adminUsers}`);
        console.log(`Student users: ${studentUsers}`);
        console.log('=======================');

        await mongoose.disconnect();
        console.log('Disconnected from MongoDB');
        process.exit(0);
    } catch (error) {
        console.error('Error in user stats script:', error);
        process.exit(1);
    }
};

getUserStats();