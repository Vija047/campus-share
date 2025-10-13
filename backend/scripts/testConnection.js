console.log('Script starting...');

import mongoose from 'mongoose';
import dotenv from 'dotenv';

console.log('Imports loaded...');

dotenv.config();
console.log('Environment loaded...');

console.log('MongoDB URI present:', !!process.env.MONGODB_URI);

try {
    console.log('Attempting to connect to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB successfully!');

    // Simple query to test connection
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log('Available collections:', collections.map(c => c.name));

    await mongoose.connection.close();
    console.log('Connection closed');
} catch (error) {
    console.error('Error:', error.message);
}