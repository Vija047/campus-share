import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import Chat from '../models/Chat.js';

let io;

export const initializeSocket = (server) => {
    io = new Server(server, {
        cors: {
            origin: allowedOrigins, // 👈 USE the imported array
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

// Function to emit notifications to specific users
export const emitNotification = (userId, notification) => {
    if (io) {
        io.to(`user-${userId}`).emit('notification', notification);
    }
};

// Function to emit new note notifications to semester users
export const emitNewNoteNotification = (semester, notification) => {
    if (io) {
        io.to(`semester-${semester}`).emit('new-note-notification', notification);
    }
};

export { io };