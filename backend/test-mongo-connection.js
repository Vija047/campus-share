#!/usr/bin/env node

import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

async function testConnection() {
  try {
    console.log('Testing MongoDB connection...');
    
    if (!process.env.MONGODB_URI) {
      throw new Error('MONGODB_URI not found in environment variables');
    }

    console.log('Connecting to:', process.env.MONGODB_URI.replace(/:[^:]*@/, ':****@'));

    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 45000,
      retryWrites: true,
      w: 'majority',
      connectTimeoutMS: 15000,
      heartbeatFrequencyMS: 10000,
      maxIdleTimeMS: 30000,
    });

    console.log('✅ MongoDB Connected successfully!');
    console.log('Host:', conn.connection.host);
    console.log('Database:', conn.connection.db.databaseName);
    console.log('Ready state:', conn.connection.readyState);

    // Test a simple operation
    const collections = await conn.connection.db.listCollections().toArray();
    console.log('Collections:', collections.map(c => c.name));

    await mongoose.disconnect();
    console.log('✅ Test completed successfully!');
    process.exit(0);

  } catch (error) {
    console.error('❌ Connection failed:', error.message);
    console.error('Full error:', error);
    process.exit(1);
  }
}

testConnection();