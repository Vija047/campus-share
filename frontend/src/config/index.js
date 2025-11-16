// Environment configuration for the frontend
export const config = {
    // API Configuration
    api: {
        baseUrl: import.meta.env.VITE_API_URL ||
            (window.location.hostname.includes('onrender.com')
                ? 'https://campus-share-backend.onrender.com'
                : 'http://localhost:5000'),
        timeout: import.meta.env.PROD ? 120000 : 30000,
        retryAttempts: import.meta.env.PROD ? 3 : 1,
        retryDelay: 2000,
    },

    // Socket Configuration
    socket: {
        url: import.meta.env.VITE_SOCKET_URL ||
            (window.location.hostname.includes('onrender.com')
                ? 'https://campus-share-backend.onrender.com'
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
    }
};

export default config;