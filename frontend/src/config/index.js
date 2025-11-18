// Environment configuration for the frontend
export const config = {
    // API Configuration
    api: {
        baseUrl: import.meta.env.VITE_API_URL ||
            (window.location.hostname.includes('onrender.com') || 
             window.location.hostname.includes('campus-share') ||
             window.location.hostname.includes('vercel.app')
                ? 'https://campus-share.onrender.com'
                : 'http://localhost:5000'),
        timeout: import.meta.env.PROD ? 180000 : 60000, // Extended for file uploads
        retryAttempts: import.meta.env.PROD ? 3 : 1,
        retryDelay: 2000,
    },

    // Socket Configuration
    socket: {
        url: import.meta.env.VITE_SOCKET_URL ||
            (window.location.hostname.includes('onrender.com') || 
             window.location.hostname.includes('campus-share') ||
             window.location.hostname.includes('vercel.app')
                ? 'https://campus-share.onrender.com'
                : 'http://localhost:5000'),
        options: {
            transports: ['websocket', 'polling'],
            timeout: 20000,
            reconnection: true,
            reconnectionDelay: 1000,
            reconnectionDelayMax: 5000,
            maxReconnectionAttempts: import.meta.env.PROD ? 5 : 3,
        }
    },

    // App Configuration
    app: {
        name: 'Campus Share',
        version: '1.0.0',
        isProd: import.meta.env.PROD,
        isDev: import.meta.env.DEV,
    },

    // Feature flags
    features: {
        enableAI: true,
        enableChat: true,
        enableNotifications: true,
        enableOfflineMode: import.meta.env.PROD,
    },

    // Upload configuration
    upload: {
        maxFileSize: parseInt(import.meta.env.VITE_MAX_FILE_SIZE) || 52428800, // 50MB default
        allowedFileTypes: import.meta.env.VITE_ALLOWED_FILE_TYPES?.split(',') || [
            'application/pdf',
            'application/msword',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'application/vnd.ms-powerpoint',
            'application/vnd.openxmlformats-officedocument.presentationml.presentation',
            'text/plain',
            'image/jpeg',
            'image/png',
            'image/jpg',
            'image/gif'
        ]
    }
};

export default config;