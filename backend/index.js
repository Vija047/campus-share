import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { createServer } from 'http';
import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';
import path from 'path';
import { fileURLToPath } from 'url';

// Models for socket functionality
import User from './models/User.js';
import Chat from './models/Chat.js';

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

// Initialize Socket.IO
let io;
const initializeSocket = () => {
    io = new Server(server, {
        cors: {
            origin: allowedOrigins,
            methods: ["GET", "POST"],
            credentials: true
        }
    });

    // Socket authentication middleware
    io.use(async (socket, next) => {
        try {
            const token = socket.handshake.auth.token;

            if (!token) {
                return next(new Error('Authentication error'));
            }

            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            const user = await User.findById(decoded.id).select('-password');

            if (!user || !user.isActive) {
                return next(new Error('Authentication error'));
            }

            socket.userId = user._id.toString();
            socket.userSemester = user.semester;
            socket.userName = user.name;

            next();
        } catch (error) {
            next(new Error('Authentication error'));
        }
    });

    io.on('connection', (socket) => {
        console.log(`User ${socket.userName} connected with ID: ${socket.id}`);

        // Join user to their semester room and general room
        socket.join(`semester-${socket.userSemester}`);
        socket.join('general');
        socket.join(`user-${socket.userId}`); // Join user-specific room for targeted notifications

        // Send connection status to semester room
        socket.to(`semester-${socket.userSemester}`).emit('user-connected', {
            userId: socket.userId,
            userName: socket.userName
        });

        // Handle joining specific rooms
        socket.on('join-room', (room) => {
            if (room === 'general' || room === `semester-${socket.userSemester}`) {
                socket.join(room);
                console.log(`${socket.userName} joined room: ${room}`);
            }
        });

        // Handle leaving rooms
        socket.on('leave-room', (room) => {
            socket.leave(room);
            console.log(`${socket.userName} left room: ${room}`);
        });

        // Handle sending messages
        socket.on('send-message', async (data) => {
            try {
                const { semesterId, message, messageType = 'text', replyTo } = data;

                // Validate semester access
                if (semesterId !== 'general' && semesterId !== socket.userSemester) {
                    socket.emit('error', { message: 'Access denied to this semester chat' });
                    return;
                }

                // Create chat message
                const chatMessage = await Chat.create({
                    semesterId,
                    sender: socket.userId,
                    message,
                    messageType,
                    replyTo: replyTo || null
                });

                // Populate the message
                const populatedMessage = await Chat.findById(chatMessage._id)
                    .populate('sender', 'name profilePicture')
                    .populate({
                        path: 'replyTo',
                        select: 'message sender',
                        populate: {
                            path: 'sender',
                            select: 'name'
                        }
                    });

                // Emit to the appropriate room
                const roomName = semesterId === 'general' ? 'general' : `semester-${semesterId}`;
                io.to(roomName).emit('new-message', populatedMessage);

            } catch (error) {
                console.error('Send message error:', error);
                socket.emit('error', { message: 'Failed to send message' });
            }
        });

        // Handle message editing
        socket.on('edit-message', async (data) => {
            try {
                const { messageId, newMessage } = data;
                const chatMessage = await Chat.findById(messageId);

                if (!chatMessage) {
                    return socket.emit('error', { message: 'Message not found' });
                }

                if (chatMessage.sender.toString() !== socket.userId) {
                    return socket.emit('error', { message: 'You can only edit your own messages' });
                }

                const timeDiff = Date.now() - chatMessage.createdAt.getTime();
                if (timeDiff > 15 * 60 * 1000) { // 15 minutes
                    return socket.emit('error', { message: 'Cannot edit messages older than 15 minutes' });
                }

                chatMessage.message = newMessage;
                chatMessage.isEdited = true;
                chatMessage.editedAt = new Date();
                await chatMessage.save();

                const populatedMessage = await Chat.findById(messageId)
                    .populate('sender', 'name profilePicture');

                const roomName = chatMessage.semesterId === 'general' ? 'general' : `semester-${chatMessage.semesterId}`;
                io.to(roomName).emit('message-edited', populatedMessage);

            } catch (error) {
                console.error('Edit message error:', error);
                socket.emit('error', { message: 'Failed to edit message' });
            }
        });

        // Handle message deletion
        socket.on('delete-message', async (data) => {
            try {
                const { messageId } = data;
                const chatMessage = await Chat.findById(messageId);

                if (!chatMessage) {
                    return socket.emit('error', { message: 'Message not found' });
                }

                if (chatMessage.sender.toString() !== socket.userId) {
                    return socket.emit('error', { message: 'You can only delete your own messages' });
                }

                chatMessage.isDeleted = true;
                chatMessage.message = 'This message was deleted';
                await chatMessage.save();

                const roomName = chatMessage.semesterId === 'general' ? 'general' : `semester-${chatMessage.semesterId}`;
                io.to(roomName).emit('message-deleted', { messageId, semesterId: chatMessage.semesterId });

            } catch (error) {
                console.error('Delete message error:', error);
                socket.emit('error', { message: 'Failed to delete message' });
            }
        });

        // Handle reactions
        socket.on('add-reaction', async (data) => {
            try {
                const { messageId, emoji } = data;
                const chatMessage = await Chat.findById(messageId);

                if (!chatMessage) {
                    return socket.emit('error', { message: 'Message not found' });
                }

                const reactionIndex = chatMessage.reactions.findIndex(
                    r => r.user.toString() === socket.userId && r.emoji === emoji
                );

                if (reactionIndex > -1) {
                    // User is removing their reaction
                    chatMessage.reactions.splice(reactionIndex, 1);
                } else {
                    // Add new reaction
                    chatMessage.reactions.push({ user: socket.userId, emoji });
                }

                await chatMessage.save();

                const roomName = chatMessage.semesterId === 'general' ? 'general' : `semester-${chatMessage.semesterId}`;
                io.to(roomName).emit('reaction-updated', {
                    messageId,
                    reactions: chatMessage.reactions
                });

            } catch (error) {
                console.error('Add reaction error:', error);
                socket.emit('error', { message: 'Failed to add reaction' });
            }
        });

        // Handle typing indicators
        socket.on('typing-start', (data) => {
            const { semesterId } = data;
            const roomName = semesterId === 'general' ? 'general' : `semester-${semesterId}`;
            socket.to(roomName).emit('user-typing', {
                userId: socket.userId,
                userName: socket.userName,
                isTyping: true
            });
        });

        socket.on('typing-stop', (data) => {
            const { semesterId } = data;
            const roomName = semesterId === 'general' ? 'general' : `semester-${semesterId}`;
            socket.to(roomName).emit('user-typing', {
                userId: socket.userId,
                userName: socket.userName,
                isTyping: false
            });
        });

        // Handle disconnection
        socket.on('disconnect', () => {
            console.log(`User ${socket.userName} disconnected`);

            socket.to(`semester-${socket.userSemester}`).emit('user-disconnected', {
                userId: socket.userId,
                userName: socket.userName
            });
        });
    });

    return io;
};

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
    'http://localhost:3000',
].filter(Boolean);

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

// Socket notification functions
export const emitNotification = (userId, notification) => {
    if (io) {
        io.to(`user-${userId}`).emit('notification', notification);
    }
};

export const emitNewNoteNotification = (semester, notification) => {
    if (io) {
        io.to(`semester-${semester}`).emit('new-note-notification', notification);
    }
};

// Graceful shutdown function
const gracefulShutdown = (signal) => {
    console.log(`Received ${signal}. Shutting down gracefully...`);

    if (io) {
        io.close(() => {
            console.log('Socket.IO server closed');
        });
    }

    if (server) {
        server.close(() => {
            console.log('HTTP server closed');
            mongoose.connection.close(false, () => {
                console.log('MongoDB connection closed');
                process.exit(0);
            });
        });
    }
};

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
    initializeSocket(); // Initialize socket after DB connection
    server.listen(PORT, () =>
        console.log(`🚀 Server running on port ${PORT} in ${process.env.NODE_ENV} mode`)
    );
};
startServer();
