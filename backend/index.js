import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { createServer } from 'http';
import path from 'path';
import { fileURLToPath } from 'url';
import { initializeSocket } from './socket/socketHandler.js';

// Middleware
import { errorHandler, notFound } from './middleware/errorHandler.js';
import { generalLimiter } from './middleware/rateLimiter.js';

// Routes
import authRoutes from './routes/auth.js';
import noteRoutes from './routes/notes.js';
import postRoutes from './routes/posts.js';
import chatRoutes from './routes/chat.js';
import statsRoutes from './routes/stats.js';
import notificationRoutes from './routes/notifications.js';

// Setup
dotenv.config();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const server = createServer(app);
const io = initializeSocket(server);

// Trust proxy
app.set('trust proxy', 1);

// Helmet security
app.use(
    helmet({
        crossOriginResourcePolicy: { policy: 'cross-origin' },
        contentSecurityPolicy: false,
    })
);

// Allowed origins
const allowedOrigins = [
    'https://campus-share-nine.vercel.app',
    'http://localhost:3000'
];

// CORS middleware
app.use(
    cors({
        origin: (origin, callback) => {
            if (!origin || allowedOrigins.includes(origin)) {
                callback(null, true);
            } else {
                callback(new Error('Not allowed by CORS'));
            }
        },
        credentials: true,
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
        allowedHeaders: [
            'Content-Type',
            'Authorization',
            'X-Requested-With',
            'Accept',
            'Accept-Version',
            'Content-Length',
            'Content-MD5',
            'Date',
            'X-Api-Version',
            'Range',
            'Origin',
        ],
        exposedHeaders: ['Content-Length', 'Content-Range', 'Accept-Ranges'],
        optionsSuccessStatus: 200,
        preflightContinue: false,
    })
);

// Body parser
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Preflight
app.options('*', cors());

// ================== ROUTES ==================
// Notifications (no rate limit for polling)
app.use('/api/notifications', notificationRoutes);

// Rate limiter
app.use(generalLimiter);

// File serving
app.get('/uploads/:filename', async (req, res) => {
    try {
        const filename = req.params.filename;
        const filePath = path.join(__dirname, 'uploads', filename);

        const fs = await import('fs/promises');
        try {
            await fs.access(filePath);
        } catch {
            return res.status(404).json({
                success: false,
                message: `File not found: ${filename}`,
            });
        }

        const ext = path.extname(filename).toLowerCase();
        let mimeType = 'application/octet-stream';
        switch (ext) {
            case '.pdf':
                mimeType = 'application/pdf';
                break;
            case '.doc':
                mimeType = 'application/msword';
                break;
            case '.docx':
                mimeType =
                    'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
                break;
            case '.txt':
                mimeType = 'text/plain';
                break;
            case '.ppt':
                mimeType = 'application/vnd.ms-powerpoint';
                break;
            case '.pptx':
                mimeType =
                    'application/vnd.openxmlformats-officedocument.presentationml.presentation';
                break;
            case '.xls':
                mimeType = 'application/vnd.ms-excel';
                break;
            case '.xlsx':
                mimeType =
                    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
                break;
            case '.jpg':
            case '.jpeg':
                mimeType = 'image/jpeg';
                break;
            case '.png':
                mimeType = 'image/png';
                break;
            case '.gif':
                mimeType = 'image/gif';
                break;
        }

        res.setHeader('Content-Type', mimeType);
        res.setHeader('Content-Disposition', `inline; filename="${filename}"`);
        res.setHeader('Cache-Control', 'public, max-age=31536000');
        res.setHeader('Accept-Ranges', 'bytes');

        if (ext === '.pdf') {
            res.setHeader('X-Content-Type-Options', 'nosniff');
            res.setHeader(
                'Content-Security-Policy',
                "default-src 'self'; script-src 'unsafe-inline' 'unsafe-eval'; style-src 'unsafe-inline';"
            );
        }

        res.sendFile(filePath, (err) => {
            if (err) {
                console.error('Error serving file:', err);
                res.status(500).json({ success: false, message: 'Error serving file' });
            }
        });
    } catch (error) {
        console.error('File serving error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error while serving file',
        });
    }
});

// Favicon
app.get('/favicon.ico', (req, res) => res.status(204).end());

// Health check endpoint for Render
app.get('/health', (req, res) => {
    res.status(200).json({
        status: 'OK',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        environment: process.env.NODE_ENV || 'development'
    });
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/notes', noteRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/stats', statsRoutes);

// Root route
app.get('/', (req, res) => res.send('🚀 Server started successfully'));

// 404 + error handlers
app.use(notFound);
app.use(errorHandler);

// DB connection
const connectDB = async () => {
    try {
        if (!process.env.MONGODB_URI) {
            console.log('⚠️ MongoDB URI not found, skipping DB connection');
            return;
        }
        const conn = await mongoose.connect(process.env.MONGODB_URI);
        console.log(`MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
        console.error('MongoDB connection error:', error);
    }
};
process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);
process.on('uncaughtException', (err) => {
    console.error('Uncaught Exception:', err);
    process.exit(1);
});
process.on('unhandledRejection', (err) => {
    console.error('Unhandled Rejection:', err);
    server.close(() => process.exit(1));
});

// Start server
const PORT = process.env.PORT || 5000;
const startServer = async () => {
    await connectDB();
    server.listen(PORT, () =>
        console.log(`🚀 Server running on port ${PORT} in ${process.env.NODE_ENV} mode`)
    );
};
startServer();
