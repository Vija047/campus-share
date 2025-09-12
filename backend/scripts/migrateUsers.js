// Migration script to add missing required fields to existing users
import mongoose from 'mongoose';
import User from '../models/User.js';
import dotenv from 'dotenv';

dotenv.config();

const migrateUsers = async () => {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/student-notes-hub');
        console.log('Connected to MongoDB');

        // Find users missing required fields
        const usersWithMissingFields = await User.find({
            $or: [
                { gender: { $exists: false } },
                { department: { $exists: false } },
                { gender: null },
                { department: null },
                { gender: '' },
                { department: '' }
            ]
        });

        console.log(`Found ${usersWithMissingFields.length} users with missing required fields`);

        if (usersWithMissingFields.length === 0) {
            console.log('No users need migration');
            return;
        }

        // Update users with default values
        const result = await User.updateMany(
            {
                $or: [
                    { gender: { $exists: false } },
                    { department: { $exists: false } },
                    { gender: null },
                    { department: null },
                    { gender: '' },
                    { department: '' }
                ]
            },
            {
                $set: {
                    gender: 'other',
                    department: 'Other'
                }
            }
        );

        console.log(`Migration completed. Updated ${result.modifiedCount} users`);

        // Verify the migration
        const remainingUsers = await User.find({
            $or: [
                { gender: { $exists: false } },
                { department: { $exists: false } },
                { gender: null },
                { department: null },
                { gender: '' },
                { department: '' }
            ]
        });

        console.log(`Remaining users with missing fields: ${remainingUsers.length}`);

    } catch (error) {
        console.error('Migration failed:', error);
    } finally {
        await mongoose.connection.close();
        console.log('Disconnected from MongoDB');
    }
};

// Run the migration
migrateUsers();
