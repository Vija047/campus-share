import { io } from 'socket.io-client';

class SocketService {
    constructor() {
        this.socket = null;
        this.isConnected = false;
    }

    connect(token) {
        if (this.socket?.connected) {
            return;
        }

        // Use environment variable for socket URL, fallback to localhost for development
        const socketUrl = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';

        try {
            this.socket = io(socketUrl, {
                auth: {
                    token,
                },
                autoConnect: true,
                transports: ['websocket', 'polling'],
                reconnection: true,
                reconnectionAttempts: 5,
                reconnectionDelay: 1000,
                timeout: 10000,
            });

            this.socket.on('connect', () => {
                console.log('✓ Connected to socket server');
                this.isConnected = true;
            });

            this.socket.on('disconnect', (reason) => {
                console.log('✗ Disconnected from socket server:', reason);
                this.isConnected = false;
            });

            this.socket.on('connect_error', (error) => {
                console.warn('Socket connection error:', error.message);
                this.isConnected = false;
                // Don't throw error, just log it
            });

            this.socket.on('error', (error) => {
                console.error('Socket error:', error.message);
            });

            return this.socket;
        } catch (error) {
            console.error('Failed to initialize socket:', error);
            this.isConnected = false;
            return null;
        }
    }

    disconnect() {
        if (this.socket) {
            this.socket.disconnect();
            this.socket = null;
            this.isConnected = false;
        }
    }

    // Join a room (semester chat)
    joinRoom(room) {
        if (this.socket) {
            this.socket.emit('join-room', room);
        }
    }

    // Leave a room
    leaveRoom(room) {
        if (this.socket) {
            this.socket.emit('leave-room', room);
        }
    }

    // Send message
    sendMessage(data) {
        if (this.socket) {
            this.socket.emit('send-message', data);
        }
    }

    // Edit message
    editMessage(data) {
        if (this.socket) {
            this.socket.emit('edit-message', data);
        }
    }

    // Delete message
    deleteMessage(data) {
        if (this.socket) {
            this.socket.emit('delete-message', data);
        }
    }

    // Add reaction
    addReaction(data) {
        if (this.socket) {
            this.socket.emit('add-reaction', data);
        }
    }

    // Typing indicators
    startTyping(semesterId) {
        if (this.socket) {
            this.socket.emit('typing-start', { semesterId });
        }
    }

    stopTyping(semesterId) {
        if (this.socket) {
            this.socket.emit('typing-stop', { semesterId });
        }
    }

    // Event listeners
    onNewMessage(callback) {
        if (this.socket) {
            this.socket.on('new-message', callback);
        }
    }

    onMessageEdited(callback) {
        if (this.socket) {
            this.socket.on('message-edited', callback);
        }
    }

    onMessageDeleted(callback) {
        if (this.socket) {
            this.socket.on('message-deleted', callback);
        }
    }

    onReactionUpdated(callback) {
        if (this.socket) {
            this.socket.on('reaction-updated', callback);
        }
    }

    onUserTyping(callback) {
        if (this.socket) {
            this.socket.on('user-typing', callback);
        }
    }

    onUserConnected(callback) {
        if (this.socket) {
            this.socket.on('user-connected', callback);
        }
    }

    onUserDisconnected(callback) {
        if (this.socket) {
            this.socket.on('user-disconnected', callback);
        }
    }

    onNotification(callback) {
        if (this.socket) {
            this.socket.on('notification', callback);
        }
    }

    onNewNoteNotification(callback) {
        if (this.socket) {
            this.socket.on('new-note-notification', callback);
        }
    }

    // Remove event listeners
    off(event, callback) {
        if (this.socket) {
            this.socket.off(event, callback);
        }
    }
}

// Create singleton instance
const socketService = new SocketService();
export default socketService;
