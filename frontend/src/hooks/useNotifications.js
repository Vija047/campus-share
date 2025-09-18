import { useState, useEffect, useCallback, useRef } from 'react';
import { useSocket } from './useSocket';
import { useSmartPolling } from './useSmartPolling';
import notificationService from '../services/notificationService';

export const useNotifications = () => {
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [consecutiveErrors, setConsecutiveErrors] = useState(0);
    const { socketService } = useSocket();
    const retryTimeoutRef = useRef(null);

    // Clear any existing retry timeout
    const clearRetryTimeout = useCallback(() => {
        if (retryTimeoutRef.current) {
            clearTimeout(retryTimeoutRef.current);
            retryTimeoutRef.current = null;
        }
    }, []);

    // Fetch initial notifications with error handling
    const fetchNotifications = useCallback(async (params = {}) => {
        if (isLoading) return; // Prevent concurrent requests

        // Circuit breaker: if too many consecutive errors, backoff longer
        if (consecutiveErrors >= 3) {
            console.warn('Too many consecutive notification errors, backing off');
            setError('Service temporarily unavailable, please try again later');
            return { data: { notifications: [], unreadCount: 0 } };
        }

        setIsLoading(true);
        setError(null);
        clearRetryTimeout();

        try {
            const response = await notificationService.getUserNotifications(params);
            setNotifications(response.data.notifications || []);
            setUnreadCount(response.data.unreadCount || 0);
            setConsecutiveErrors(0); // Reset on success
            return response;
        } catch (error) {
            console.error('Failed to fetch notifications:', error);
            setError(error.response?.data?.message || 'Failed to fetch notifications');
            setConsecutiveErrors(prev => prev + 1);

            // Only throw error if it's not a rate limit or network error
            if (error.response?.status !== 429 && !error.message?.includes('Network Error')) {
                throw error;
            }

            // For rate limit errors, retry after longer delay
            if (error.response?.status === 429) {
                console.warn('Notification rate limit hit, retrying in 5 minutes');
                retryTimeoutRef.current = setTimeout(() => {
                    fetchNotifications(params);
                }, 300000); // Retry after 5 minutes for rate limits
            }

            return { data: { notifications: [], unreadCount: 0 } };
        } finally {
            setIsLoading(false);
        }
    }, [isLoading, clearRetryTimeout, consecutiveErrors]);

    // Fetch notification count only
    const fetchNotificationCount = useCallback(async () => {
        try {
            const response = await notificationService.getNotificationCount();
            setUnreadCount(response.data.unread || 0);
            setError(null);
            return response;
        } catch (error) {
            console.error('Failed to fetch notification count:', error);
            // Don't set error for count fetching as it's less critical
            return { data: { unread: 0, total: 0 } };
        }
    }, []);

    // Mark notification as read
    const markAsRead = useCallback(async (notificationId) => {
        try {
            await notificationService.markAsRead(notificationId);

            // Update local state
            setNotifications(prev => prev.map(n =>
                n._id === notificationId ? { ...n, isRead: true } : n
            ));
            setUnreadCount(prev => Math.max(0, prev - 1));
            setError(null);

            return true;
        } catch (error) {
            console.error('Failed to mark notification as read:', error);
            setError(error.response?.data?.message || 'Failed to mark notification as read');
            throw error;
        }
    }, []);

    // Mark all notifications as read
    const markAllAsRead = useCallback(async () => {
        try {
            await notificationService.markAllAsRead();

            // Update local state
            setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
            setUnreadCount(0);
            setError(null);

            return true;
        } catch (error) {
            console.error('Failed to mark all notifications as read:', error);
            setError(error.response?.data?.message || 'Failed to mark all notifications as read');
            throw error;
        }
    }, []);

    // Delete notification
    const deleteNotification = useCallback(async (notificationId) => {
        try {
            await notificationService.deleteNotification(notificationId);

            // Update local state
            setNotifications(prev => prev.filter(n => n._id !== notificationId));
            fetchNotificationCount(); // Refresh count
            setError(null);

            return true;
        } catch (error) {
            console.error('Failed to delete notification:', error);
            setError(error.response?.data?.message || 'Failed to delete notification');
            throw error;
        }
    }, [fetchNotificationCount]);

    // Handle incoming real-time notifications
    useEffect(() => {
        const handleNewNotification = (data) => {
            console.log('New notification received:', data);

            if (data.type === 'new_notification' && data.data) {
                // Add new notification to the beginning of the list
                setNotifications(prev => [data.data, ...prev]);
                setUnreadCount(prev => prev + 1);

                // You can add a toast notification here
                if (window.showNotificationToast) {
                    window.showNotificationToast(data.data);
                }
            }
        };

        // Only set up socket listeners if socket is available
        if (socketService?.socket) {
            socketService.socket.on('notification', handleNewNotification);

            return () => {
                socketService.socket.off('notification', handleNewNotification);
            };
        }
    }, [socketService?.socket]); // Only depend on socket object

    // Handle click on notification
    const handleNotificationClick = useCallback(async (notification, navigate) => {
        try {
            // Mark as read if unread
            if (!notification.isRead) {
                await markAsRead(notification._id);
            }

            // Navigate to relevant page
            if (navigate) {
                const url = notificationService.getNotificationUrl(notification);
                navigate(url);
            }

            return true;
        } catch (error) {
            console.error('Error handling notification click:', error);
            // Don't throw here as navigation might still work
            return false;
        }
    }, [markAsRead]);

    // Smart polling for notification count
    const pollNotificationCount = useCallback(async () => {
        if (!isLoading) {
            await fetchNotificationCount();
        }
    }, [fetchNotificationCount, isLoading]);

    const { forceRefresh } = useSmartPolling(pollNotificationCount, {
        interval: 120000, // Poll every 2 minutes for count (reduced from 1 minute)
        enabled: true,
        dependencies: []
    });

    // Cleanup function
    useEffect(() => {
        return () => {
            clearRetryTimeout();
        };
    }, [clearRetryTimeout]);

    return {
        notifications,
        unreadCount,
        isLoading,
        error,
        fetchNotifications,
        fetchNotificationCount,
        markAsRead,
        markAllAsRead,
        deleteNotification,
        handleNotificationClick,
        clearError: () => setError(null),
        forceRefresh, // Allow manual refresh
        // Helper functions from service
        formatMessage: notificationService.formatNotificationMessage,
        getIcon: notificationService.getNotificationIcon,
        getRelativeTime: notificationService.getRelativeTime,
        getUrl: notificationService.getNotificationUrl
    };
};