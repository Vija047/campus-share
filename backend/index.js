import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { createServer } from 'http';
import path from 'path';
import { fileURLToPath } from 'url';

// Routes
import authRoutes from './routes/auth.js';
import noteRoutes from './routes/notes.js';
import postRoutes from './routes/posts.js';
import chatRoutes from './routes/chat.js';
import statsRoutes from './routes/stats.js';
import notificationRoutes from './routes/notifications.js';
import chatbotRoutes from './routes/chatbot.js';

// Middleware
import { errorHandler, notFound } from './middleware/errorHandler.js';
import { generalLimiter } from './middleware/rateLimiter.js';

// Socket handler
import { initializeSocket } from './socket/socketHandler.js';

// Config
dotenv.config();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ------------------- Express setup -------------------
const app = express();
const server = createServer(app);

const allowedOrigins = [
  'http://localhost:3000'
];

// Security & CORS
app.set('trust proxy', 1);
app.use(helmet({
  contentSecurityPolicy: false,
  crossOriginEmbedderPolicy: false
}));
app.use(cors({
  origin: (origin, cb) => {
    // Allow requests with no origin (mobile apps, Postman, etc.)
    if (!origin) return cb(null, true);

    if (allowedOrigins.includes(origin)) {
      return cb(null, true);
    }

    // For development, be more permissive
    if (process.env.NODE_ENV !== 'production' &&
      (origin.includes('localhost') || origin.includes('127.0.0.1'))) {
      return cb(null, true);
    }

    console.warn('CORS blocked origin:', origin);
    return cb(new Error('Not allowed by CORS'), false);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  maxAge: 86400 // 24 hours
}));

// Body parser
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Rate limiter
app.use(generalLimiter);

// ------------------- Routes -------------------
app.use('/api/notifications', notificationRoutes); // No rate limiter
app.use('/api/auth', authRoutes);
app.use('/api/notes', noteRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/stats', statsRoutes);
app.use('/api/chatbot', chatbotRoutes);

// Serve uploaded files
app.get('/uploads/:filename', async (req, res) => {
  const filePath = path.join(__dirname, 'uploads', req.params.filename);
  try {
    const fs = await import('fs/promises');
    await fs.access(filePath);
    res.sendFile(filePath);
  } catch {
    res.status(404).json({ success: false, message: 'File not found' });
  }
});

// Health & Root
app.get('/', (req, res) => res.send('🚀 Server started successfully'));
app.get('/health', (req, res) => res.json({ status: 'OK', uptime: process.uptime() }));
app.get('/api/test', (req, res) => res.json({ success: true, message: 'Backend is connected' }));

// 404 & Error
app.use(notFound);
app.use(errorHandler);

// ------------------- Database -------------------
const connectDB = async () => {
  if (!process.env.MONGODB_URI) {
    console.warn('⚠️ MongoDB URI not found, skipping DB connection');
    return;
  }
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (err) {
    console.error('MongoDB connection error:', err);
  }
};

// ------------------- Server & Socket -------------------
const PORT = process.env.PORT || 5000;
const startServer = async () => {
  await connectDB();
  initializeSocket(server); // Socket.IO initialized here
  server.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT} in ${process.env.NODE_ENV || 'development'} mode`);
  });
};

startServer();

// ------------------- Graceful shutdown -------------------
const gracefulShutdown = async (signal) => {
  console.log(`Received ${signal}. Shutting down...`);
  server.close(async () => {
    await mongoose.connection.close();
    process.exit(0);
  });
};

['SIGTERM', 'SIGINT'].forEach(sig => process.on(sig, () => gracefulShutdown(sig)));

process.on('uncaughtException', e => { console.error('Uncaught Exception:', e); process.exit(1); });
process.on('unhandledRejection', e => { console.error('Unhandled Rejection:', e); server.close(() => process.exit(1)); });
