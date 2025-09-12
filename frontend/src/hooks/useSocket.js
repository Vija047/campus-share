import { useState, useEffect } from 'react';
import socketService from '../services/socketService';

export const useSocket = () => {
    const [isConnected, setIsConnected] = useState(false);
    const [onlineUsers, setOnlineUsers] = useState([]);

    useEffect(() => {
        setIsConnected(socketService.isConnected);

        // Listen for connection events
        socketService.onUserConnected((data) => {
            setOnlineUsers(prev => [...prev.filter(u => u.userId !== data.userId), data]);
        });

        socketService.onUserDisconnected((data) => {
            setOnlineUsers(prev => prev.filter(u => u.userId !== data.userId));
        });

        return () => {
            socketService.off('user-connected');
            socketService.off('user-disconnected');
        };
    }, []);

    const joinRoom = (room) => {
        socketService.joinRoom(room);
    };

    const leaveRoom = (room) => {
        socketService.leaveRoom(room);
    };

    const sendMessage = (data) => {
        socketService.sendMessage(data);
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
