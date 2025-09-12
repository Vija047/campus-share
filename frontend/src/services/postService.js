import api from './api.js';

export const postService = {
    // Create post
    createPost: async (postData) => {
        const response = await api.post('/posts', postData);
        return response.data;
    },

    // Get posts with filters
    getPosts: async (filters = {}) => {
        const params = new URLSearchParams();

        Object.keys(filters).forEach(key => {
            if (filters[key]) {
                params.append(key, filters[key]);
            }
        });

        const response = await api.get(`/posts?${params.toString()}`);
        return response.data;
    },

    // Get single post
    getPost: async (id) => {
        const response = await api.get(`/posts/${id}`);
        return response.data;
    },

    // Toggle vote on post
    toggleVote: async (id, voteType) => {
        const response = await api.post(`/posts/${id}/vote`, { voteType });
        return response.data;
    },

    // Add reply to post
    addReply: async (id, content) => {
        const response = await api.post(`/posts/${id}/reply`, { content });
        return response.data;
    },

    // Delete post
    deletePost: async (id) => {
        const response = await api.delete(`/posts/${id}`);
        return response.data;
    },
};
