import { useState, useEffect } from 'react';
import socketService from '../services/socketService';

export const useSocket = () => {
    const [isConnected, setIsConnected] = useState(false);
    const [onlineUsers, setOnlineUsers] = useState([]);

    useEffect(() => {
        // Update connection status
        const updateConnectionStatus = () => {
            setIsConnected(socketService.isConnected);
        };

        updateConnectionStatus();

        // Listen for connection events only if socket exists
        if (socketService.socket) {
            socketService.onUserConnected((data) => {
                setOnlineUsers(prev => [...prev.filter(u => u.userId !== data.userId), data]);
            });

            socketService.onUserDisconnected((data) => {
                setOnlineUsers(prev => prev.filter(u => u.userId !== data.userId));
            });

            // Listen for connection changes
            socketService.socket.on('connect', updateConnectionStatus);
            socketService.socket.on('disconnect', updateConnectionStatus);
        }

        return () => {
            if (socketService.socket) {
                socketService.off('user-connected');
                socketService.off('user-disconnected');
                socketService.socket.off('connect', updateConnectionStatus);
                socketService.socket.off('disconnect', updateConnectionStatus);
            }
        };
    }, []);

    const joinRoom = (room) => {
        if (socketService.isConnected) {
            socketService.joinRoom(room);
        }
    };

    const leaveRoom = (room) => {
        if (socketService.isConnected) {
            socketService.leaveRoom(room);
        }
    };

    const sendMessage = (data) => {
        if (socketService.isConnected) {
            socketService.sendMessage(data);
        } else {
            console.warn('Cannot send message: Socket not connected');
        }
    };

    return {
        socket: socketService.socket,
        isConnected,
        onlineUsers,
        joinRoom,
        leaveRoom,
        sendMessage,
        socketService,
    };
};
