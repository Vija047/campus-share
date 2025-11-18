import User from '../models/User.js';
import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const updateEmailVerificationStatus = async () => {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        // Update all users to have isEmailVerified set to true
        const result = await User.updateMany(
            {}, // Empty filter to match all users
            {
                $set: { isEmailVerified: true },
                $unset: {
                    emailVerificationCode: "",
                    emailVerificationExpires: ""
                }
            }
        );

        console.log(`Updated ${result.modifiedCount} users`);
        console.log('All users now have email verification disabled');

        await mongoose.disconnect();
        console.log('Disconnected from MongoDB');
    } catch (error) {
        console.error('Error updating users:', error);
        process.exit(1);
    }
};

updateEmailVerificationStatus();