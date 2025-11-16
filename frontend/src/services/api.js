import axios from 'axios';
import toast from 'react-hot-toast';

// Determine API base URL based on environment
const getApiBaseUrl = () => {
    // Check if we have environment variables set
    if (import.meta.env.VITE_API_URL) {
        return import.meta.env.VITE_API_URL;
    }

    // Fallback logic based on hostname
    const hostname = window.location.hostname;

    // Production deployment on Render
    if (hostname.includes('onrender.com') || hostname.includes('campus-share')) {
        return 'https://campus-share-backend.onrender.com';
    }

    // Local development
    return 'http://localhost:5000';
};

// Create axios instance with base configuration
const api = axios.create({
    baseURL: getApiBaseUrl(),
    timeout: import.meta.env.PROD ? 120000 : 30000, // Longer timeout for production
    headers: {
        'Content-Type': 'application/json',
    },
    withCredentials: false,
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
        // Only log errors in development
        if (import.meta.env.DEV) {
            console.error('API Error:', error);
        }

        // Handle network errors
        if (!error.response) {
            if (error.code === 'ECONNABORTED') {
                toast.error('Request timeout. Server may be busy, please try again.');
            } else if (error.code === 'ERR_NETWORK' || error.message?.includes('Network Error')) {
                // Check if we're in production and suggest alternative
                const isProduction = window.location.hostname.includes('onrender.com');
                if (isProduction) {
                    toast.error('Server connection issue. Please wait a moment and try again.');
                } else {
                    toast.error('Unable to connect to server. Please check your connection and try again.');
                }
            } else {
                toast.error('Connection error. Please try again later.');
            }
            return Promise.reject(error);
        }
        const message = error.response?.data?.message || 'Something went wrong';

        // Handle specific error cases
        if (error.response?.status === 401) {
            // Unauthorized - remove token and redirect to login
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            if (!window.location.pathname.includes('/login')) {
                window.location.href = '/login';
                toast.error('Session expired. Please login again.');
            }
        } else if (error.response?.status === 403) {
            toast.error('Access denied.');
        } else if (error.response?.status === 404) {
            toast.error('Resource not found.');
        } else if (error.response?.status >= 500) {
            if (import.meta.env.DEV) {
                console.error('Server error:', error.response.data);
            }
            toast.error('Server error. Please try again later.');
        } else {
            toast.error(message);
        }

        return Promise.reject(error);
    }
);

export default api;
