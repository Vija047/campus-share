import api from './api.js';

/**
 * Process uploaded file (PDF/PPT)
 */
export const processFile = async (file) => {
    const formData = new FormData();
    formData.append('file', file);

    const response = await api.post('/api/chatbot/process-file', formData, {
        headers: {
            'Content-Type': 'multipart/form-data'
        }
    });

    return response.data;
};

/**
 * Send message to chatbot
 */
export const sendMessage = async (message, sessionId, topic = null) => {
    const response = await api.post('/api/chatbot/chat', {
        message,
        sessionId,
        topic
    });

    return response.data;
};

/**
 * Get learning resources for a topic
 */
export const getResources = async (topic, resourceTypes = ['youtube', 'geeksforgeeks', 'mdn', 'w3schools']) => {
    const response = await api.post('/api/chatbot/resources', {
        topic,
        resourceTypes
    });

    return response.data;
};

/**
 * Clear conversation session
 */
export const clearSession = async (sessionId) => {
    const response = await api.delete(`/chatbot/session/${sessionId}`);
    return response.data;
};

export const chatbotService = {
    processFile,
    sendMessage,
    getResources,
    clearSession
};

export default chatbotService;
