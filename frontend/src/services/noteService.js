import api from './api.js';

export const noteService = {
    // Upload note
    uploadNote: async (formData) => {
        console.log('Uploading note via noteService...');
        const response = await api.post('/notes/upload', formData, {
            timeout: 60000, // 60 seconds for file uploads
        });
        return response.data;
    },

    // Get notes with filters
    getNotes: async (filters = {}) => {
        const params = new URLSearchParams();

        Object.keys(filters).forEach(key => {
            if (filters[key]) {
                params.append(key, filters[key]);
            }
        });

        const response = await api.get(`/notes?${params.toString()}`);
        return response.data;
    },

    // Get single note
    getNote: async (id) => {
        const response = await api.get(`/notes/${id}`);
        return response.data;
    },

    // Toggle like on note
    toggleLike: async (id) => {
        const response = await api.post(`/notes/${id}/like`);
        return response.data;
    },

    // Download note
    downloadNote: async (id) => {
        try {
            // Validate the note ID format
            if (!id || typeof id !== 'string' || id.trim().length === 0) {
                throw new Error('Invalid note ID provided');
            }

            // Clean the ID to remove any unwanted characters (like :1 from source maps)
            const cleanId = id.replace(/:[0-9]+$/, '').trim();

            console.log(`Attempting to download note with ID: ${cleanId}`);

            const response = await api.get(`/notes/${cleanId}/download`, {
                timeout: 30000, // 30 seconds for download requests
            });

            // Validate response data
            if (!response.data || !response.data.data) {
                throw new Error('Invalid response format');
            }

            const { downloadUrl, fileName } = response.data.data;

            if (!downloadUrl) {
                throw new Error('Download URL not provided');
            }

            if (!fileName) {
                throw new Error('File name not provided');
            }

            return response.data;
        } catch (error) {
            console.error('Download note service error:', error);

            if (error.response) {
                // Server responded with error status
                const status = error.response.status;
                const errorMessage = error.response.data?.message || 'Failed to download note';

                if (status === 404) {
                    throw new Error('Note not found. The note may have been deleted or moved.');
                } else if (status === 403) {
                    throw new Error('Access denied. You may not have permission to download this note.');
                } else if (status === 500) {
                    throw new Error('Server error. Please try again later.');
                } else {
                    throw new Error(`${errorMessage} (Status: ${status})`);
                }
            } else if (error.request) {
                // Network error
                throw new Error('Network error. Please check your connection and try again.');
            } else {
                // Other error
                throw new Error(error.message || 'An unexpected error occurred');
            }
        }
    },

    // View note in browser
    viewNote: async (id) => {
        try {
            const response = await api.get(`/notes/${id}/view`, {
                timeout: 30000, // 30 seconds for view requests
            });

            // Validate response data
            if (!response.data || !response.data.data) {
                throw new Error('Invalid response format');
            }

            const { viewUrl, fileName } = response.data.data;

            if (!viewUrl) {
                throw new Error('View URL not provided');
            }

            if (!fileName) {
                throw new Error('File name not provided');
            }

            return response.data;
        } catch (error) {
            console.error('View note service error:', error);

            if (error.response) {
                // Server responded with error status
                const errorMessage = error.response.data?.message || 'Failed to get view URL';
                throw new Error(errorMessage);
            } else if (error.request) {
                // Network error
                throw new Error('Network error. Please check your connection and try again.');
            } else {
                // Other error
                throw new Error(error.message || 'An unexpected error occurred');
            }
        }
    },

    // Generate share link
    generateShareLink: async (id) => {
        const response = await api.post(`/notes/${id}/share`);
        return response.data;
    },

    // Toggle bookmark on note
    toggleBookmark: async (id) => {
        try {
            console.log('Calling toggle bookmark API for note:', id);
            const response = await api.post(`/notes/${id}/bookmark`, {}, {
                timeout: 10000 // 10 second timeout
            });
            console.log('Toggle bookmark API response:', response.data);
            return response.data;
        } catch (error) {
            console.error('Toggle bookmark API error:', error);
            if (error.code === 'ECONNABORTED') {
                throw new Error('Request timeout. Please try again.');
            }
            throw error;
        }
    },

    // Get bookmarked notes
    getBookmarkedNotes: async (page = 1) => {
        const response = await api.get(`/notes/bookmarked?page=${page}`);
        return response.data;
    },

    // Get my uploaded notes
    getMyNotes: async (page = 1) => {
        const response = await api.get(`/notes/my-notes?page=${page}`);
        return response.data;
    },

    // Check if file exists for a note
    checkFileExists: async (id) => {
        try {
            const response = await api.get(`/notes/${id}/check-file`, {
                timeout: 10000, // 10 seconds
            });
            return response.data;
        } catch (error) {
            console.error('Check file exists error:', error);
            if (error.response) {
                const errorMessage = error.response.data?.message || 'Failed to check file existence';
                throw new Error(errorMessage);
            } else if (error.request) {
                throw new Error('Network error. Please check your connection and try again.');
            } else {
                throw new Error(error.message || 'An unexpected error occurred');
            }
        }
    },

    // Generate AI summary for a note
    generateAISummary: async (id) => {
        try {
            const response = await api.post(`/notes/${id}/generate-ai-summary`, {}, {
                timeout: 60000, // 60 seconds for AI processing
            });
            return response.data;
        } catch (error) {
            console.error('Generate AI summary error:', error);
            if (error.response) {
                const errorMessage = error.response.data?.message || 'Failed to generate AI summary';
                throw new Error(errorMessage);
            } else if (error.request) {
                throw new Error('Network error. Please check your connection and try again.');
            } else {
                throw new Error(error.message || 'An unexpected error occurred');
            }
        }
    },
};
