import api from './api.js';

export const noteService = {
    // Upload note
    uploadNote: async (formData) => {
        console.log('Uploading note via noteService...');
        const response = await api.post('/notes/upload', formData, {
            timeout: 60000, // 60 seconds for file uploads
        });
        return response.data;
    },

    // Get notes with filters
    getNotes: async (filters = {}) => {
        const params = new URLSearchParams();

        Object.keys(filters).forEach(key => {
            if (filters[key]) {
                params.append(key, filters[key]);
            }
        });

        const response = await api.get(`/notes?${params.toString()}`);
        return response.data;
    },

    // Get single note
    getNote: async (id) => {
        const response = await api.get(`/notes/${id}`);
        return response.data;
    },

    // Toggle like on note
    toggleLike: async (id) => {
        const response = await api.post(`/notes/${id}/like`);
        return response.data;
    },

    // Download note
    downloadNote: async (id) => {
        const response = await api.get(`/notes/${id}/download`);
        return response.data;
    },

    // Generate share link
    generateShareLink: async (id) => {
        const response = await api.post(`/notes/${id}/share`);
        return response.data;
    },

    // Toggle bookmark on note
    toggleBookmark: async (id) => {
        try {
            console.log('Calling toggle bookmark API for note:', id);
            const response = await api.post(`/notes/${id}/bookmark`);
            console.log('Toggle bookmark API response:', response.data);
            return response.data;
        } catch (error) {
            console.error('Toggle bookmark API error:', error);
            throw error;
        }
    },

    // Get bookmarked notes
    getBookmarkedNotes: async (page = 1) => {
        const response = await api.get(`/notes/bookmarked?page=${page}`);
        return response.data;
    },

    // Get my uploaded notes
    getMyNotes: async (page = 1) => {
        const response = await api.get(`/notes/my-notes?page=${page}`);
        return response.data;
    },
};
