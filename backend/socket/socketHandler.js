import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import Chat from '../models/Chat.js';

let io;

// You can define allowed origins here directly
const allowedOrigins = ['http://localhost:3000', 'http://localhost:3001']; // Add more if needed

export const initializeSocket = (server) => {
  io = new Server(server, {
    cors: { origin: allowedOrigins, methods: ['GET', 'POST'], credentials: true }
  });

  // Authenticate socket connections
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      if (!token) return next(new Error('Authentication error'));

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id).select('-password');
      if (!user || !user.isActive) return next(new Error('Authentication error'));

      socket.user = {
        id: user._id.toString(),
        name: user.name,
        semester: user.semester
      };
      next();
    } catch {
      next(new Error('Authentication error'));
    }
  });

  io.on('connection', (socket) => {
    const { id, name, semester } = socket.user;
    console.log(`User ${name} connected`);

    const semesterRoom = `semester-${semester}`;
    const userRoom = `user-${id}`;
    ['general', semesterRoom, userRoom].forEach(r => socket.join(r));

    socket.to(semesterRoom).emit('user-connected', { userId: id, userName: name });

    ['join-room', 'leave-room'].forEach(evt => {
      socket.on(evt, (room) => {
        socket[evt === 'join-room' ? 'join' : 'leave'](room);
      });
    });

    ['send-message', 'edit-message', 'delete-message', 'add-reaction']
      .forEach(evt => socket.on(evt, data => handleChatEvent(evt, socket, data)));

    ['typing-start', 'typing-stop'].forEach(evt => {
      socket.on(evt, ({ semesterId }) => {
        socket.to(semesterId === 'general' ? 'general' : `semester-${semesterId}`).emit('user-typing', {
          userId: id,
          userName: name,
          isTyping: evt === 'typing-start'
        });
      });
    });

    socket.on('disconnect', () => {
      socket.to(semesterRoom).emit('user-disconnected', { userId: id, userName: name });
    });
  });

  return io;
};

// ------------------- Chat event handler -------------------
const handleChatEvent = async (event, socket, data) => {
  try {
    const { id: userId, semester: userSemester } = socket.user;

    if (event === 'send-message') {
      const { semesterId, message, messageType = 'text', replyTo } = data;
      if (semesterId !== 'general' && semesterId !== userSemester) {
        return socket.emit('error', { message: 'Access denied to this semester chat' });
      }

      const chat = await Chat.create({ semesterId, sender: userId, message, messageType, replyTo: replyTo || null });
      const populated = await Chat.findById(chat._id)
        .populate('sender', 'name profilePicture')
        .populate({ path: 'replyTo', select: 'message sender', populate: { path: 'sender', select: 'name' } });

      io.to(semesterId === 'general' ? 'general' : `semester-${semesterId}`).emit('new-message', populated);
    }

    if (event === 'edit-message') {
      const { messageId, newMessage } = data;
      const chat = await Chat.findById(messageId);
      if (!chat || chat.sender.toString() !== userId) return socket.emit('error', { message: 'Invalid edit' });

      const age = Date.now() - chat.createdAt.getTime();
      if (age > 15 * 60 * 1000) return socket.emit('error', { message: 'Cannot edit messages older than 15 mins' });

      chat.message = newMessage;
      chat.isEdited = true;
      chat.editedAt = new Date();
      await chat.save();

      const populated = await Chat.findById(messageId).populate('sender', 'name profilePicture');
      io.to(chat.semesterId === 'general' ? 'general' : `semester-${chat.semesterId}`).emit('message-edited', populated);
    }

    if (event === 'delete-message') {
      const { messageId } = data;
      const chat = await Chat.findById(messageId);
      if (!chat || chat.sender.toString() !== userId) return socket.emit('error', { message: 'Invalid delete' });

      chat.isDeleted = true;
      chat.message = 'This message was deleted';
      await chat.save();

      io.to(chat.semesterId === 'general' ? 'general' : `semester-${chat.semesterId}`)
        .emit('message-deleted', { messageId, semesterId: chat.semesterId });
    }

    if (event === 'add-reaction') {
      const { messageId, emoji } = data;
      const chat = await Chat.findById(messageId);
      if (!chat) return socket.emit('error', { message: 'Message not found' });

      const index = chat.reactions.findIndex(r => r.user.toString() === userId && r.emoji === emoji);
      if (index > -1) chat.reactions.splice(index, 1);
      else chat.reactions.push({ user: userId, emoji });
      await chat.save();

      io.to(chat.semesterId === 'general' ? 'general' : `semester-${chat.semesterId}`)
        .emit('reaction-updated', { messageId, reactions: chat.reactions });
    }
  } catch (err) {
    console.error(`Socket event error (${event}):`, err);
    socket.emit('error', { message: 'Action failed' });
  }
};

// ------------------- Notification emitters -------------------
export const emitNotification = (userId, notification) => io?.to(`user-${userId}`).emit('notification', notification);
export const emitNewNoteNotification = (semester, notification) => io?.to(`semester-${semester}`).emit('new-note-notification', notification);

export { io };
