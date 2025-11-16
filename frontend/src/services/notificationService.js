import api from './api';

class NotificationService {
    constructor() {
        this.retryAttempts = 3;
        this.retryDelay = 1000; // Start with 1 second
    }

    // Retry mechanism for failed requests
    async retryRequest(fn, attempts = this.retryAttempts) {
        try {
            return await fn();
        } catch (error) {
            if (attempts <= 1) {
                throw error;
            }

            // Don't retry on certain error types
            if (error.response?.status === 401 || error.response?.status === 403) {
                throw error;
            }

            // For rate limit errors, don't retry and throw immediately
            if (error.response?.status === 429) {
                console.warn('Rate limit hit, skipping retries to prevent further rate limiting');
                throw error;
            }

            // Wait before retrying with exponential backoff
            const delay = this.retryDelay * Math.pow(2, this.retryAttempts - attempts);
            await new Promise(resolve => setTimeout(resolve, delay));
            return this.retryRequest(fn, attempts - 1);
        }
    }

    // Get all notifications for the authenticated user
    async getUserNotifications(params = {}) {
        return this.retryRequest(async () => {
            const { page = 1, limit = 20, filter = 'all' } = params;

            const response = await api.get('/api/notifications', {
                params: { page, limit, filter }
            });

            return response.data;
        });
    }

    // Get notification count summary
    async getNotificationCount() {
        return this.retryRequest(async () => {
            const response = await api.get('/api/notifications/count');
            return response.data;
        });
    }

    // Mark a specific notification as read
    async markAsRead(notificationId) {
        return this.retryRequest(async () => {
            const response = await api.put(`/notifications/${notificationId}/read`);
            return response.data;
        });
    }

    // Mark all notifications as read
    async markAllAsRead() {
        return this.retryRequest(async () => {
            const response = await api.put('/api/notifications/mark-all-read');
            return response.data;
        });
    }

    // Delete a specific notification
    async deleteNotification(notificationId) {
        return this.retryRequest(async () => {
            const response = await api.delete(`/notifications/${notificationId}`);
            return response.data;
        });
    }

    // Clear all read notifications
    async clearReadNotifications() {
        return this.retryRequest(async () => {
            const response = await api.delete('/api/notifications/clear-read');
            return response.data;
        });
    }

    // Helper method to get notification icon based on type
    getNotificationIcon(type) {
        const iconMap = {
            'new_note': '📝',
            'note_liked': '👍',
            'post_reply': '💬',
            'post_upvote': '⬆️',
            'semester_chat': '👥',
            'note_downloaded': '⬇️',
            'admin_message': '📢'
        };

        return iconMap[type] || '📬';
    }

    // Helper method to format notification message
    formatNotificationMessage(notification) {
        const { type, title, message, sender, data } = notification;

        // Customize message based on type
        switch (type) {
            case 'new_note':
                return `New note "${data?.noteId?.title || 'Unknown'}" was uploaded in ${data?.noteId?.subject || 'your subject'}`;
            case 'note_liked':
                return `${sender?.name || 'Someone'} liked your note "${data?.noteId?.title || 'Unknown'}"`;
            case 'post_reply':
                return `${sender?.name || 'Someone'} replied to your post "${data?.postId?.title || 'Unknown'}"`;
            case 'post_upvote':
                return `${sender?.name || 'Someone'} upvoted your post "${data?.postId?.title || 'Unknown'}"`;
            case 'semester_chat':
                return `New message in your semester chat group`;
            case 'note_downloaded':
                return `Your note "${data?.noteId?.title || 'Unknown'}" was downloaded`;
            case 'admin_message':
                return message || title;
            default:
                return message || title || 'You have a new notification';
        }
    }

    // Helper method to get relative time string
    getRelativeTime(timestamp) {
        const now = new Date();
        const time = new Date(timestamp);
        const diffInSeconds = Math.floor((now - time) / 1000);

        if (diffInSeconds < 60) {
            return 'Just now';
        }

        const diffInMinutes = Math.floor(diffInSeconds / 60);
        if (diffInMinutes < 60) {
            return `${diffInMinutes} minute${diffInMinutes > 1 ? 's' : ''} ago`;
        }

        const diffInHours = Math.floor(diffInMinutes / 60);
        if (diffInHours < 24) {
            return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
        }

        const diffInDays = Math.floor(diffInHours / 24);
        if (diffInDays < 7) {
            return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`;
        }

        const diffInWeeks = Math.floor(diffInDays / 7);
        if (diffInWeeks < 4) {
            return `${diffInWeeks} week${diffInWeeks > 1 ? 's' : ''} ago`;
        }

        // For older notifications, show the actual date
        return time.toLocaleDateString();
    }

    // Helper method to get notification action URL
    getNotificationUrl(notification) {
        const { type, data } = notification;

        switch (type) {
            case 'new_note':
            case 'note_liked':
            case 'note_downloaded':
                return data?.noteId ? `/notes?noteId=${data.noteId._id || data.noteId}` : '/notes';
            case 'post_reply':
            case 'post_upvote':
                return data?.postId ? `/community?postId=${data.postId._id || data.postId}` : '/community';
            case 'semester_chat':
                return '/chat';
            case 'admin_message':
                return '/dashboard';
            default:
                return '/dashboard';
        }
    }
}

const notificationService = new NotificationService();
export default notificationService;