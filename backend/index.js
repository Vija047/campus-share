import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { createServer } from 'http';
import path from 'path';
import { fileURLToPath } from 'url';
import { initializeSocket } from './socket/socketHandler.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Import middleware
import { errorHandler, notFound } from './middleware/errorHandler.js';
import { generalLimiter } from './middleware/rateLimiter.js';

// Import routes
import authRoutes from './routes/auth.js';
import noteRoutes from './routes/notes.js';
import postRoutes from './routes/posts.js';
import chatRoutes from './routes/chat.js';
import statsRoutes from './routes/stats.js';
import notificationRoutes from './routes/notifications.js';

// Load environment variables
dotenv.config();

// Create Express app
const app = express();
const server = createServer(app);

// Initialize Socket.IO
const io = initializeSocket(server);

// Trust proxy for rate limiting behind reverse proxy
app.set('trust proxy', 1);

// Security middleware
app.use(helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
    contentSecurityPolicy: false // Disable CSP for better PDF viewing compatibility
}));

// CORS configuration
app.use(cors({
    origin: ['http://localhost:3000'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Accept-Version', 'Content-Length', 'Content-MD5', 'Date', 'X-Api-Version', 'Range'],
    exposedHeaders: ['Content-Length', 'Content-Range', 'Accept-Ranges'], // Allow range headers for file streaming
    optionsSuccessStatus: 200 // some legacy browsers (IE11, various SmartTVs) choke on 204
}));

// Body parsing middleware
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Handle preflight requests
app.options('*', cors());

// API routes for notifications (before rate limiting to allow frequent polling)
app.use('/api/notifications', notificationRoutes);

// Rate limiting for other routes
app.use(generalLimiter);

// Custom file serving route with proper error handling and MIME types
app.get('/uploads/:filename', async (req, res) => {
    try {
        const filename = req.params.filename;
        const filePath = path.join(__dirname, 'uploads', filename);

        // Check if file exists
        try {
            await import('fs/promises').then(fs => fs.access(filePath));
        } catch (error) {
            return res.status(404).json({
                success: false,
                message: `File not found: ${filename}`,
                error: 'The requested file does not exist on the server'
            });
        }

        // Determine MIME type based on file extension
        const ext = path.extname(filename).toLowerCase();
        let mimeType = 'application/octet-stream'; // Default fallback

        switch (ext) {
            case '.pdf':
                mimeType = 'application/pdf';
                break;
            case '.doc':
                mimeType = 'application/msword';
                break;
            case '.docx':
                mimeType = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
                break;
            case '.txt':
                mimeType = 'text/plain';
                break;
            case '.ppt':
                mimeType = 'application/vnd.ms-powerpoint';
                break;
            case '.pptx':
                mimeType = 'application/vnd.openxmlformats-officedocument.presentationml.presentation';
                break;
            case '.xls':
                mimeType = 'application/vnd.ms-excel';
                break;
            case '.xlsx':
                mimeType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
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

        // Set proper headers for inline viewing
        res.setHeader('Content-Type', mimeType);
        res.setHeader('Content-Disposition', 'inline; filename="' + filename + '"');
        res.setHeader('Cache-Control', 'public, max-age=31536000'); // Cache for 1 year
        res.setHeader('Accept-Ranges', 'bytes'); // Enable range requests for better streaming

        // Special handling for PDFs to ensure proper rendering
        if (ext === '.pdf') {
            res.setHeader('X-Content-Type-Options', 'nosniff');
            res.setHeader('Content-Security-Policy', "default-src 'self'; script-src 'unsafe-inline' 'unsafe-eval'; style-src 'unsafe-inline';");
        }

        // Serve the file
        res.sendFile(filePath, (err) => {
            if (err) {
                console.error('Error serving file:', err);
                res.status(500).json({
                    success: false,
                    message: 'Error serving file',
                    error: err.message
                });
            }
        });
    } catch (error) {
        console.error('File serving error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error while serving file',
            error: error.message
        });
    }
});

// Handle favicon.ico requests
app.get('/favicon.ico', (req, res) => {
    res.status(204).end();
});


// API routes
app.use('/api/auth', authRoutes);
app.use('/api/notes', noteRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/stats', statsRoutes);

// Test endpoint for CORS debugging
app.get('/api/test', (req, res) => {
    res.json({ message: 'CORS test successful', timestamp: new Date().toISOString() });
});

// Test endpoint for file upload debugging  
app.post('/api/test-upload', (req, res) => {
    console.log('Test upload hit:', {
        body: req.body,
        headers: req.headers,
        contentType: req.get('content-type')
    });
    res.json({ message: 'Test upload endpoint reached', body: req.body });
});

app.get("/", (req, res) => {
    res.send("hello sever started");
});

// Handle 404 routes
app.use(notFound);

// Error handling middleware
app.use(errorHandler);

// Database connection
const connectDB = async () => {
    try {
        if (!process.env.MONGODB_URI) {
            console.log('⚠️  MongoDB URI not found, skipping database connection for testing');
            return;
        }
        const conn = await mongoose.connect(process.env.MONGODB_URI);
        console.log(`MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
        console.error('MongoDB connection error:', error);
        console.log('⚠️  Continuing without database for testing purposes');
    }
};

// Graceful shutdown
const gracefulShutdown = () => {
    console.log('Received shutdown signal, closing server gracefully...');

    server.close(() => {
        console.log('HTTP server closed');

        mongoose.connection.close(false, () => {
            console.log('MongoDB connection closed');
            process.exit(0);
        });
    });
};

// Handle process termination
process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
    console.error('Uncaught Exception:', error);
    process.exit(1);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (error) => {
    console.error('Unhandled Rejection:', error);
    server.close(() => {
        process.exit(1);
    });
});

// Start server
const PORT = process.env.PORT || 5000;

const startServer = async () => {
    try {
        await connectDB();

        server.listen(PORT, () => {
            console.log(`🚀 Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);

        });
    } catch (error) {
        console.error('Failed to start server:', error);
        process.exit(1);
    }
};

startServer();