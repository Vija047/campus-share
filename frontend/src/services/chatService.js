import api from './api.js';

export const chatService = {
    // Get chat messages
    getChatMessages: async (semesterId, page = 1) => {
        const response = await api.get(`/api/chat/${semesterId}?page=${page}`);
        return response.data;
    },

    // Send message
    sendMessage: async (semesterId, messageData) => {
        const response = await api.post(`/api/chat/${semesterId}`, messageData);
        return response.data;
    },

    // Edit message
    editMessage: async (messageId, message) => {
        const response = await api.put(`/api/chat/${messageId}`, { message });
        return response.data;
    },

    // Delete message
    deleteMessage: async (messageId) => {
        const response = await api.delete(`/api/chat/${messageId}`);
        return response.data;
    },

    // Add reaction
    addReaction: async (messageId, emoji) => {
        const response = await api.post(`/api/chat/${messageId}/reaction`, { emoji });
        return response.data;
    },
};
