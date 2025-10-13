import axios from 'axios';
import toast from 'react-hot-toast';

// Create axios instance with base configuration
const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
    timeout: 60000, // Increased timeout for file uploads
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor to add auth token
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }

        // Don't set Content-Type for FormData - let browser set it with boundary
        if (config.data instanceof FormData) {
            delete config.headers['Content-Type'];
        }

        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor to handle errors
api.interceptors.response.use(
    (response) => {
        return response;
    },
    (error) => {
        console.error('API Error:', error);

        // Handle network errors
        if (!error.response) {
            console.error('Network error or server not responding');
            toast.error('Network error. Please check your connection and try again.');
            return Promise.reject(error);
        }

        const message = error.response?.data?.message || 'Something went wrong';

        // Handle specific error cases
        if (error.response?.status === 401) {
            // Unauthorized - remove token and redirect to login
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            window.location.href = '/login';
            toast.error('Session expired. Please login again.');
        } else if (error.response?.status === 403) {
            toast.error('Access denied.');
        } else if (error.response?.status === 404) {
            toast.error('Resource not found.');
        } else if (error.response?.status >= 500) {
            console.error('Server error:', error.response.data);
            toast.error('Server error. Please try again later.');
        } else {
            toast.error(message);
        }

        return Promise.reject(error);
    }
);

export default api;
