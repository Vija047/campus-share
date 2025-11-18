import api from './api.js';

export const communityService = {
    // Get all community posts with enhanced filtering
    getCommunityPosts: async (filters = {}) => {
        const params = new URLSearchParams();

        // Support multiple filter types
        const allowedFilters = ['page', 'limit', 'sort', 'sortOrder', 'semester', 'category', 'search'];

        Object.keys(filters).forEach(key => {
            if (filters[key] && allowedFilters.includes(key)) {
                params.append(key, filters[key]);
            }
        });

        const response = await api.get(`/posts?${params.toString()}`);
        return response.data;
    },

    // Create new community post
    createCommunityPost: async (postData) => {
        const response = await api.post('/api/posts', {
            content: postData.content,
            semester: postData.semester || 'general',
            category: postData.category || 'general',
            tags: postData.tags || []
        });
        return response.data;
    },

    // Get single post with full details
    getPostDetails: async (postId) => {
        const response = await api.get(`/api/posts/${postId}`);
        return response.data;
    },

    // Vote on a post
    voteOnPost: async (postId, voteType) => {
        const response = await api.post(`/api/posts/${postId}/vote`, { voteType });
        return response.data;
    },

    // Add reply to post
    replyToPost: async (postId, content) => {
        const response = await api.post(`/api/posts/${postId}/reply`, { content });
        return response.data;
    },

    // Delete post (if user owns it)
    deletePost: async (postId) => {
        const response = await api.delete(`/api/posts/${postId}`);
        return response.data;
    },

    // Get trending posts
    getTrendingPosts: async (limit = 10) => {
        const response = await api.get(`/api/posts?sort=votes&sortOrder=desc&limit=${limit}`);
        return response.data;
    },

    // Get recent posts
    getRecentPosts: async (limit = 10) => {
        const response = await api.get(`/api/posts?sort=createdAt&sortOrder=desc&limit=${limit}`);
        return response.data;
    },

    // Get posts by semester
    getPostsBySemester: async (semester, limit = 20) => {
        const response = await api.get(`/api/posts?semester=${semester}&limit=${limit}&sort=createdAt&sortOrder=desc`);
        return response.data;
    },

    // Search posts
    searchPosts: async (query, filters = {}) => {
        const params = new URLSearchParams({
            search: query,
            ...filters
        });

        const response = await api.get(`/api/posts?${params.toString()}`);
        return response.data;
    },

    // Get community statistics
    getCommunityStats: async () => {
        try {
            const response = await api.get('/api/posts/stats');
            return response.data;
        } catch (error) {
            // Fallback stats if endpoint doesn't exist
            return {
                success: true,
                data: {
                    totalPosts: 0,
                    totalUsers: 0,
                    postsToday: 0,
                    activeDiscussions: 0
                }
            };
        }
    },

    // Get user's posts
    getUserPosts: async (userId, page = 1, limit = 10) => {
        const response = await api.get(`/api/posts?author=${userId}&page=${page}&limit=${limit}`);
        return response.data;
    },

    // Report a post
    reportPost: async (postId, reason) => {
        try {
            const response = await api.post(`/api/posts/${postId}/report`, { reason });
            return response.data;
        } catch (error) {
            console.error('Report functionality not implemented:', error);
            return { success: false, message: 'Report functionality coming soon' };
        }
    }
};