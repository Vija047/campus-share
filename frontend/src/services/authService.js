import api from './api.js';

export const authService = {
    // Register new user
    register: async (userData) => {
        const response = await api.post('/api/auth/register', userData);
        if (response.data.success && response.data.data?.token) {
            localStorage.setItem('token', response.data.data.token);
            localStorage.setItem('user', JSON.stringify(response.data.data.user));
        }
        return response.data;
    },

    // Login user
    login: async (credentials) => {
        const response = await api.post('/api/auth/login', credentials);
        if (response.data.success) {
            localStorage.setItem('token', response.data.data.token);
            localStorage.setItem('user', JSON.stringify(response.data.data.user));
        }
        return response.data;
    },

    // Logout user
    logout: () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
    },

    // Get current user
    getCurrentUser: async () => {
        const response = await api.get('/api/auth/me');
        return response.data;
    },

    // Update profile
    updateProfile: async (profileData) => {
        const response = await api.put('/api/auth/profile', profileData);
        if (response.data.success) {
            localStorage.setItem('user', JSON.stringify(response.data.data.user));
        }
        return response.data;
    },

    // Check if user is authenticated
    isAuthenticated: () => {
        return !!localStorage.getItem('token');
    },

    // Get stored user data
    getStoredUser: () => {
        const user = localStorage.getItem('user');
        return user ? JSON.parse(user) : null;
    },

    // Forgot password - send OTP
    forgotPassword: async (email) => {
        const response = await api.post('/api/auth/forgot-password', { email });
        return response.data;
    },

    // Verify OTP
    verifyOTP: async (email, otp) => {
        const response = await api.post('/api/auth/verify-otp', { email, otp });
        return response.data;
    },

    // Reset password
    resetPassword: async (email, otp, newPassword) => {
        const response = await api.post('/api/auth/reset-password', { email, otp, newPassword });
        return response.data;
    },


};
