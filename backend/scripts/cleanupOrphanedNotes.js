// Cleanup script to remove orphaned notes from the database
import mongoose from 'mongoose';
import Note from '../models/Note.js';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables from the correct path
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const cleanupOrphanedNotes = async () => {
    try {
        console.log('Starting cleanup script...');
        console.log('MongoDB URI:', process.env.MONGODB_URI ? 'Found' : 'Not found');

        // Connect to MongoDB
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/student-notes-hub');
        console.log('Connected to MongoDB successfully!');

        // Find all notes with local files
        const notes = await Note.find({ localFileName: { $exists: true, $ne: null } });
        console.log(`Checking ${notes.length} notes with local files...`);

        const orphanedNotes = [];

        for (const note of notes) {
            const filePath = path.join(__dirname, '..', 'uploads', note.localFileName);

            try {
                await fs.access(filePath);
                // File exists, note is not orphaned
            } catch (error) {
                // File doesn't exist, note is orphaned
                orphanedNotes.push({
                    id: note._id,
                    title: note.title,
                    fileName: note.fileName,
                    localFileName: note.localFileName,
                    uploader: note.uploader
                });
            }
        }

        console.log(`Found ${orphanedNotes.length} orphaned notes:`);

        if (orphanedNotes.length > 0) {
            orphanedNotes.forEach(note => {
                console.log(`- ID: ${note.id}, Title: "${note.title}", Missing file: ${note.localFileName}`);
            });

            // Confirm deletion
            console.log('\nRemoving orphaned notes from database...');

            const noteIds = orphanedNotes.map(note => note.id);
            const deleteResult = await Note.deleteMany({ _id: { $in: noteIds } });

            console.log(`Successfully removed ${deleteResult.deletedCount} orphaned notes from database.`);
        } else {
            console.log('No orphaned notes found. Database is clean.');
        }

        console.log('\nCleanup completed successfully!');

    } catch (error) {
        console.error('Cleanup failed:', error.message);
        console.error('Full error:', error);
    } finally {
        // Close MongoDB connection
        await mongoose.connection.close();
        console.log('Database connection closed.');
    }
};

// Run the cleanup if this script is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
    cleanupOrphanedNotes();
}

export default cleanupOrphanedNotes;