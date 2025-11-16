import api from './api.js';

export const statsService = {
    // Get dashboard stats
    getDashboardStats: async () => {
        const response = await api.get('/api/stats/dashboard');
        return response.data;
    },

    // Get leaderboard
    getLeaderboard: async () => {
        const response = await api.get('/api/stats/leaderboard');
        return response.data;
    },

    // Get general stats
    getGeneralStats: async () => {
        const response = await api.get('/api/stats/general');
        return response.data;
    },
};
