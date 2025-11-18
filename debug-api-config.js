// Debug script to check API configuration
console.log('Environment check:');
console.log('VITE_API_URL:', import.meta.env.VITE_API_URL);
console.log('PROD mode:', import.meta.env.PROD);
console.log('Window location hostname:', window.location.hostname);

// Test the API base URL logic
const getApiBaseUrl = () => {
    if (import.meta.env.VITE_API_URL) {
        return import.meta.env.VITE_API_URL;
    }

    const hostname = window.location.hostname;
    
    if (hostname.includes('onrender.com') || hostname.includes('campus-share')) {
        return 'https://campus-share.onrender.com';
    }
    
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
        return 'http://localhost:5000';
    }
    
    return 'http://localhost:5000';
};

console.log('Computed API base URL:', getApiBaseUrl());