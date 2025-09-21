import React, { useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useNotifications } from '../../hooks/useNotifications';
import { useSocket } from '../../hooks/useSocket';

const NotificationWrapper = ({ children }) => {
    const { user } = useAuth();
    const { addNotification } = useNotifications();
    const socket = useSocket();

    useEffect(() => {
        if (!socket || !user) return;

        // Listen for real-time notifications
        socket.on('notification', (notification) => {
            addNotification(notification);
        });

        // Listen for new messages
        socket.on('newMessage', (data) => {
            addNotification({
                type: 'message',
                title: 'New Message',
                message: `New message from ${data.sender?.name || 'Unknown'}`,
                data: data
            });
        });

        // Listen for new posts
        socket.on('newPost', (data) => {
            addNotification({
                type: 'post',
                title: 'New Post',
                message: `${data.author?.name || 'Someone'} shared a new post`,
                data: data
            });
        });

        // Cleanup listeners on unmount
        return () => {
            socket.off('notification');
            socket.off('newMessage');
            socket.off('newPost');
        };
    }, [socket, user, addNotification]);

    return <>{children}</>;
};

export default NotificationWrapper;