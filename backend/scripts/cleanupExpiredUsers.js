// Cleanup script to remove expired unverified users from the database
import mongoose from 'mongoose';
import User from '../models/User.js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables from the correct path
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const cleanupExpiredUsers = async () => {
    try {
        console.log('Starting expired users cleanup script...');
        console.log('MongoDB URI:', process.env.MONGODB_URI ? 'Found' : 'Not found');

        // Connect to MongoDB
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/student-notes-hub');
        console.log('Connected to MongoDB successfully!');

        // Find expired unverified users
        const expiredUsers = await User.find({
            isEmailVerified: false,
            emailVerificationExpires: { $lt: new Date() }
        });

        console.log(`Found ${expiredUsers.length} expired unverified users`);

        if (expiredUsers.length > 0) {
            // Log the users that will be deleted
            console.log('Users to be deleted:');
            expiredUsers.forEach(user => {
                console.log(`- ${user.email} (expired: ${user.emailVerificationExpires})`);
            });

            // Delete expired unverified users
            const result = await User.deleteMany({
                isEmailVerified: false,
                emailVerificationExpires: { $lt: new Date() }
            });

            console.log(`Successfully deleted ${result.deletedCount} expired unverified users`);
        } else {
            console.log('No expired unverified users found');
        }

        // Also show stats
        const totalUsers = await User.countDocuments();
        const verifiedUsers = await User.countDocuments({ isEmailVerified: true });
        const unverifiedUsers = await User.countDocuments({ isEmailVerified: false });

        console.log('\n=== User Statistics ===');
        console.log(`Total users: ${totalUsers}`);
        console.log(`Verified users: ${verifiedUsers}`);
        console.log(`Unverified users: ${unverifiedUsers}`);
        console.log('=======================');

        await mongoose.disconnect();
        console.log('Disconnected from MongoDB');
        process.exit(0);
    } catch (error) {
        console.error('Error in cleanup script:', error);
        process.exit(1);
    }
};

cleanupExpiredUsers();