import api from './api.js';

export const statsService = {
    // Get dashboard stats
    getDashboardStats: async () => {
        const response = await api.get('/stats/dashboard');
        return response.data;
    },

    // Get leaderboard
    getLeaderboard: async () => {
        const response = await api.get('/stats/leaderboard');
        return response.data;
    },

    // Get general stats
    getGeneralStats: async () => {
        const response = await api.get('/stats/general');
        return response.data;
    },
};
