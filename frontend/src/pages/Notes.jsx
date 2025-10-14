import React, { useState, useEffect, useCallback } from 'react';
import { noteService } from '../services/noteService.js';
import { useAuth } from '../hooks/useAuth.js';
import {
    Search,
    Filter,
    Download,
    Heart,
    Eye,
    Share2,
    BookOpen,
    Calendar,
    User,
    FileText,
    ChevronDown,
    Bookmark,
    ExternalLink
} from 'lucide-react';
import LoadingSpinner from '../components/common/LoadingSpinner.jsx';
import Button from '../components/common/Button.jsx';
import toast from 'react-hot-toast';
import { downloadManager } from '../utils/downloadUtils.js';
import { canViewFile, getViewerUrl, getViewDescription } from '../utils/downloadUtils.js';

const Notes = () => {
    const { user } = useAuth();
    const [notes, setNotes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [downloadingNotes, setDownloadingNotes] = useState(new Set());
    const [viewingNotes, setViewingNotes] = useState(new Set());
    const [searchTerm, setSearchTerm] = useState('');
    const [filters, setFilters] = useState({
        semester: '',
        subject: '',
        examType: '',
        sortBy: 'createdAt'
    });
    const [pagination, setPagination] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [showFilters, setShowFilters] = useState(false);

    const fetchNotes = useCallback(async (page = 1) => {
        try {
            setLoading(true);
            const queryParams = {
                page,
                limit: 10,
                ...filters
            };

            if (searchTerm) {
                queryParams.search = searchTerm;
            }

            const response = await noteService.getNotes(queryParams);
            setNotes(response.data.notes);
            setPagination(response.data.pagination);
        } catch (error) {
            console.error('Error fetching notes:', error);
            toast.error('Failed to fetch notes');
        } finally {
            setLoading(false);
        }
    }, [filters, searchTerm]);

    useEffect(() => {
        fetchNotes(currentPage);
    }, [currentPage, fetchNotes]);

    const handleSearch = (e) => {
        e.preventDefault();
        setCurrentPage(1);
        fetchNotes(1);
    };

    const handleLike = async (noteId) => {
        if (!user || !user.id) {
            toast.error('Please log in to like notes');
            return;
        }

        try {
            const response = await noteService.toggleLike(noteId);
            toast.success(response.message);
            setNotes(notes.map(note =>
                note._id === noteId
                    ? {
                        ...note,
                        likes: response.data.isLiked
                            ? [...note.likes, { user: user.id }]
                            : note.likes.filter(like => like.user !== user.id)
                    }
                    : note
            ));
        } catch (error) {
            console.error('Error liking note:', error);
            toast.error('Failed to like note');
        }
    };

    const handleDownload = async (noteId) => {
        // Prevent multiple simultaneous downloads of the same note
        if (downloadingNotes.has(noteId)) {
            toast.error('Download already in progress for this file');
            return;
        }

        try {
            // Add note to downloading set
            setDownloadingNotes(prev => new Set([...prev, noteId]));

            // Show loading toast
            const loadingToast = toast.loading('Preparing download...');

            // Get the note details and download URL
            const response = await noteService.downloadNote(noteId);

            if (!response || !response.data) {
                throw new Error('Invalid server response');
            }

            const { downloadUrl, fileName } = response.data;

            if (!downloadUrl) {
                throw new Error('Download URL not available');
            }

            if (!fileName) {
                throw new Error('File name not available');
            }

            // Validate and clean the download URL
            let cleanDownloadUrl = downloadUrl;
            try {
                // Parse URL to check if it's valid
                const urlObj = new URL(downloadUrl);
                cleanDownloadUrl = urlObj.toString();
            } catch {
                // If URL parsing fails, try to construct a proper URL
                if (downloadUrl.startsWith('/uploads/')) {
                    cleanDownloadUrl = `${window.location.protocol}//${window.location.host}:5000${downloadUrl}`;
                } else if (!downloadUrl.startsWith('http')) {
                    cleanDownloadUrl = `https://campus-share.onrender.com${downloadUrl.startsWith('/') ? '' : '/'}${downloadUrl}`;
                }
            }

            // Update toast
            toast.dismiss(loadingToast);

            let downloadToast = toast.loading(`Downloading "${fileName}"...`);

            // Try to download using the download manager for better user experience
            try {
                const result = await downloadManager(cleanDownloadUrl, fileName, {
                    onProgress: (progress) => {
                        // Update toast with progress if needed
                        if (progress % 25 === 0) { // Update every 25%
                            toast.dismiss(downloadToast);
                            downloadToast = toast.loading(`Downloading "${fileName}" - ${Math.round(progress)}%`);
                        }
                    },
                    onComplete: (result) => {
                        toast.dismiss();
                        if (result.verified) {
                            toast.success(`"${fileName}" successfully saved to your device`);
                        } else {
                            toast.success(`"${fileName}" download started`);
                        }

                        // Show download location info
                        setTimeout(() => {
                            toast(`File saved to: ${result.location}`, {
                                icon: '📁',
                                duration: 4000
                            });
                        }, 1000);
                    },
                    onError: (error) => {
                        console.error('Download manager error:', error);
                        toast.dismiss();

                        // Provide specific error guidance
                        if (error.message.includes('404') || error.message.includes('not found')) {
                            toast.error('File not found. It may have been removed or is temporarily unavailable.');
                        } else if (error.message.includes('500') || error.message.includes('server error')) {
                            toast.error('Server error. Please try again in a few moments.');
                        } else if (error.message.includes('Access denied') || error.message.includes('403')) {
                            toast.error('Access denied. You may not have permission to download this file.');
                        } else if (error.message.includes('URL') || error.message.includes('malformed')) {
                            toast.error('Invalid file URL. Please contact support if this continues.');
                        } else {
                            toast.error(`Download failed: ${error.message}`);
                        }

                        // Log detailed error for debugging
                        console.error('Download error details:', {
                            noteId,
                            originalUrl: downloadUrl,
                            cleanUrl: cleanDownloadUrl,
                            fileName,
                            error: error.message
                        });
                    }
                });

                console.log('Download completed:', result);

            } catch (downloadError) {
                console.warn('Download manager failed:', downloadError);
                toast.dismiss();

                // Provide fallback download suggestion
                toast.error(
                    'Download failed. You can try right-clicking the download button and selecting "Save link as..."',
                    { duration: 6000 }
                );
            }
        } catch (error) {
            console.error('Error downloading note:', error);
            toast.dismiss();

            // Show specific error message based on error type
            let errorMessage = 'Failed to download note. Please try again.';

            if (error.response) {
                // Server responded with error status
                const status = error.response.status;
                const serverMessage = error.response.data?.message || error.response.data?.error;

                if (status === 404) {
                    errorMessage = 'File not found. It may have been removed or is no longer available.';
                } else if (status === 403) {
                    errorMessage = 'Access denied. You may not have permission to download this file.';
                } else if (status === 500) {
                    errorMessage = 'Server error. Please try again later.';
                } else if (serverMessage) {
                    errorMessage = serverMessage;
                }
            } else if (error.message.includes('Network')) {
                errorMessage = 'Network error. Please check your internet connection.';
            } else if (error.message.includes('timeout')) {
                errorMessage = 'Download timeout. Please try again.';
            } else if (error.message.includes('not found')) {
                errorMessage = 'File not found. It may have been removed.';
            } else if (error.message.includes('Invalid server response')) {
                errorMessage = 'Server communication error. Please try again.';
            } else if (error.message.includes('not available')) {
                errorMessage = 'Download information not available. The file may be corrupted.';
            } else if (error.message) {
                errorMessage = error.message;
            }

            toast.error(errorMessage);
        } finally {
            // Remove note from downloading set
            setDownloadingNotes(prev => {
                const newSet = new Set(prev);
                newSet.delete(noteId);
                return newSet;
            });
        }
    };

    const handleView = async (noteId) => {
        // Prevent multiple simultaneous views of the same note
        if (viewingNotes.has(noteId)) {
            toast.error('View already in progress for this file');
            return;
        }

        try {
            // Add note to viewing set
            setViewingNotes(prev => new Set([...prev, noteId]));

            // Show loading toast
            const loadingToast = toast.loading('Preparing to view file...');

            // First try to get the view URL from the API
            try {
                const response = await noteService.viewNote(noteId);

                if (!response || !response.data) {
                    throw new Error('Invalid server response');
                }

                const { viewUrl, fileName } = response.data;

                if (!viewUrl) {
                    throw new Error('View URL not available');
                }

                if (!fileName) {
                    throw new Error('File name not available');
                }

                // Validate and clean the view URL
                let cleanViewUrl = viewUrl;
                try {
                    // Parse URL to check if it's valid
                    const urlObj = new URL(viewUrl);
                    cleanViewUrl = urlObj.toString();
                } catch {
                    // If URL parsing fails, try to construct a proper URL
                    if (viewUrl.startsWith('/uploads/')) {
                        cleanViewUrl = `${window.location.protocol}//${window.location.host}:5000${viewUrl}`;
                    } else if (!viewUrl.startsWith('http')) {
                        cleanViewUrl = `https://campus-share.onrender.com${viewUrl.startsWith('/') ? '' : '/'}${viewUrl}`;
                    }
                }

                // Dismiss loading toast
                toast.dismiss(loadingToast);

                // Check if file can be viewed
                if (!canViewFile(fileName)) {
                    toast.error(`File type not supported for viewing. You can download the file instead.`);
                    return;
                }

                // Get the appropriate viewer URL
                const finalViewUrl = getViewerUrl(cleanViewUrl, fileName);

                // Open in new tab/window
                const newWindow = window.open(finalViewUrl, '_blank', 'noopener,noreferrer');

                if (!newWindow) {
                    // Popup blocked
                    toast.error('Popup blocked. Please allow popups for this site and try again.');
                } else {
                    toast.success(`Opening "${fileName}" in new tab`);

                    // Show viewing description
                    setTimeout(() => {
                        const description = getViewDescription(fileName);
                        toast(description, {
                            icon: '👁️',
                            duration: 3000
                        });
                    }, 500);
                }

            } catch (apiError) {
                console.warn('API view failed, trying fallback:', apiError);
                toast.dismiss(loadingToast);

                // Fallback: try to get download URL and convert to view URL
                try {
                    const downloadResponse = await noteService.downloadNote(noteId);
                    const { downloadUrl, fileName } = downloadResponse.data;

                    if (!canViewFile(fileName)) {
                        toast.error(`File type not supported for viewing. You can download the file instead.`);
                        return;
                    }

                    // Validate and clean the fallback URL
                    let cleanFallbackUrl = downloadUrl;
                    try {
                        const urlObj = new URL(downloadUrl);
                        cleanFallbackUrl = urlObj.toString();
                    } catch {
                        if (downloadUrl.startsWith('/uploads/')) {
                            cleanFallbackUrl = `${window.location.protocol}//${window.location.host}:5000${downloadUrl}`;
                        } else if (!downloadUrl.startsWith('http')) {
                            cleanFallbackUrl = `https://campus-share.onrender.com${downloadUrl.startsWith('/') ? '' : '/'}${downloadUrl}`;
                        }
                    }

                    const fallbackViewUrl = getViewerUrl(cleanFallbackUrl, fileName);
                    const newWindow = window.open(fallbackViewUrl, '_blank', 'noopener,noreferrer');

                    if (!newWindow) {
                        toast.error('Popup blocked. Please allow popups for this site and try again.');
                    } else {
                        toast.success(`Opening "${fileName}" in new tab (fallback)`);
                    }

                } catch (fallbackError) {
                    console.error('Fallback view also failed:', fallbackError);
                    toast.error('Failed to open file for viewing. You can try downloading it instead.');
                }
            }

        } catch (error) {
            console.error('Error viewing note:', error);
            toast.dismiss();

            // Show specific error message
            let errorMessage = 'Failed to view note. Please try again.';

            if (error.message.includes('Network')) {
                errorMessage = 'Network error. Please check your internet connection.';
            } else if (error.message.includes('timeout')) {
                errorMessage = 'Request timeout. Please try again.';
            } else if (error.message.includes('not found')) {
                errorMessage = 'File not found. It may have been removed.';
            } else if (error.message.includes('Invalid server response')) {
                errorMessage = 'Server communication error. Please try again.';
            } else if (error.message.includes('not available')) {
                errorMessage = 'View information not available. The file may be corrupted.';
            } else if (error.message) {
                errorMessage = error.message;
            }

            toast.error(errorMessage);
        } finally {
            // Remove note from viewing set
            setViewingNotes(prev => {
                const newSet = new Set(prev);
                newSet.delete(noteId);
                return newSet;
            });
        }
    };

    const handleShare = async (noteId) => {
        try {
            const response = await noteService.generateShareLink(noteId);
            const shareUrl = `${window.location.origin}/notes/shared/${response.data.shareLink}`;

            // Copy to clipboard
            await navigator.clipboard.writeText(shareUrl);
            toast.success('Share link copied to clipboard');
        } catch (error) {
            console.error('Error generating share link:', error);
            toast.error('Failed to generate share link');
        }
    };

    const handleBookmark = async (noteId) => {
        if (!user || !user.id) {
            toast.error('Please log in to bookmark notes');
            return;
        }

        try {
            console.log('Attempting to bookmark note:', noteId);
            console.log('Current user:', user);

            if (!noteId) {
                toast.error('Invalid note ID');
                return;
            }

            // Show loading state
            setNotes(notes.map(note =>
                note._id === noteId
                    ? { ...note, bookmarkLoading: true }
                    : note
            ));

            const response = await noteService.toggleBookmark(noteId);
            console.log('Bookmark response:', response);

            toast.success(response.message);

            // Update the notes list to reflect bookmark status
            setNotes(notes.map(note =>
                note._id === noteId
                    ? {
                        ...note,
                        isBookmarked: response.data.isBookmarked,
                        bookmarkLoading: false
                    }
                    : note
            ));
        } catch (error) {
            console.error('Error bookmarking note:', error);

            // Remove loading state
            setNotes(notes.map(note =>
                note._id === noteId
                    ? { ...note, bookmarkLoading: false }
                    : note
            ));

            // More detailed error messaging
            let errorMessage = 'Failed to bookmark note';
            if (error.response?.data?.message) {
                errorMessage = error.response.data.message;
            } else if (error.message) {
                errorMessage = error.message;
            } else if (error.code === 'ERR_BAD_RESPONSE') {
                errorMessage = 'Server error. Please try again.';
            } else if (error.code === 'ERR_NETWORK') {
                errorMessage = 'Network error. Please check your connection.';
            }

            toast.error(errorMessage);
        }
    };

    const formatFileSize = (bytes) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    if (loading && !notes.length) {
        return <LoadingSpinner text="Loading notes..." />;
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">Study Notes</h1>
                    <p className="text-gray-600">Browse and download notes shared by your peers</p>
                </div>

                {/* Search and Filters */}
                <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
                    <form onSubmit={handleSearch} className="mb-4">
                        <div className="flex gap-4">
                            <div className="flex-1">
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                                    <input
                                        type="text"
                                        placeholder="Search notes by title, description, or tags..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    />
                                </div>
                            </div>
                            <Button type="submit" variant="primary">
                                Search
                            </Button>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setShowFilters(!showFilters)}
                                icon={Filter}
                            >
                                Filters
                                <ChevronDown className={`ml-2 w-4 h-4 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
                            </Button>
                        </div>
                    </form>

                    {/* Filters Panel */}
                    {showFilters && (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 p-4 bg-gray-50 rounded-lg">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Semester
                                </label>
                                <select
                                    value={filters.semester}
                                    onChange={(e) => setFilters({ ...filters, semester: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value="">All Semesters</option>
                                    <option value="1">Semester 1</option>
                                    <option value="2">Semester 2</option>
                                    <option value="3">Semester 3</option>
                                    <option value="4">Semester 4</option>
                                    <option value="5">Semester 5</option>
                                    <option value="6">Semester 6</option>
                                    <option value="7">Semester 7</option>
                                    <option value="8">Semester 8</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Exam Type
                                </label>
                                <select
                                    value={filters.examType}
                                    onChange={(e) => setFilters({ ...filters, examType: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value="">All Types</option>
                                    <option value="Mid-term">Mid-term Exam</option>
                                    <option value="Final">Final Exam</option>
                                    <option value="Quiz">Quiz</option>
                                    <option value="Assignment">Assignment</option>
                                    <option value="Lab Report">Lab Report</option>
                                    <option value="Project">Project</option>
                                    <option value="Study Material">Study Material</option>
                                    <option value="Other">Other</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Subject
                                </label>
                                <input
                                    type="text"
                                    placeholder="Enter subject name"
                                    value={filters.subject}
                                    onChange={(e) => setFilters({ ...filters, subject: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Sort By
                                </label>
                                <select
                                    value={filters.sortBy}
                                    onChange={(e) => setFilters({ ...filters, sortBy: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value="createdAt">Latest</option>
                                    <option value="likes">Most Liked</option>
                                    <option value="downloads">Most Downloaded</option>
                                    <option value="title">Title A-Z</option>
                                </select>
                            </div>
                        </div>
                    )}
                </div>

                {/* Notes Grid */}
                {loading ? (
                    <LoadingSpinner text="Loading notes..." />
                ) : notes.length === 0 ? (
                    <div className="text-center py-12">
                        <BookOpen className="mx-auto w-12 h-12 text-gray-400 mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">No notes found</h3>
                        <p className="text-gray-600">Try adjusting your search or filters</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                        {notes.map((note) => (
                            <div key={note._id} className="group bg-white rounded-2xl shadow-lg border border-gray-100 hover:shadow-2xl hover:border-indigo-200 transition-all duration-500 transform hover:-translate-y-2 overflow-hidden backdrop-blur-sm">
                                {/* Card Header with Professional Gradient */}
                                <div className="relative">
                                    <div className="h-40 bg-gradient-to-br from-indigo-600 via-blue-600 to-purple-700 p-6 relative overflow-hidden">
                                        {/* Geometric Background Pattern */}
                                        <div className="absolute inset-0">
                                            <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-white/10 to-transparent"></div>
                                            <div className="absolute top-4 right-4 w-16 h-16 border-2 border-white/20 rounded-full"></div>
                                            <div className="absolute bottom-4 left-4 w-12 h-12 border-2 border-white/20 rounded-lg rotate-45"></div>
                                            <div className="absolute top-1/2 left-1/2 w-8 h-8 bg-white/10 rounded-full transform -translate-x-1/2 -translate-y-1/2"></div>
                                        </div>

                                        {/* File Type Badge */}
                                        <div className="absolute top-4 right-4 z-20">
                                            <span className="inline-flex items-center px-3 py-1.5 rounded-xl text-xs font-semibold bg-white/95 text-gray-800 shadow-lg backdrop-blur-sm border border-white/20">
                                                <FileText className="w-3.5 h-3.5 mr-1.5 text-indigo-600" />
                                                {note.fileType?.toUpperCase() || 'PDF'}
                                            </span>
                                        </div>

                                        {/* Document Icon and Info */}
                                        <div className="relative z-10">
                                            <div className="w-14 h-14 bg-white/15 backdrop-blur-sm rounded-2xl flex items-center justify-center mb-3 border border-white/20 shadow-lg">
                                                <FileText className="w-7 h-7 text-white" />
                                            </div>
                                            <div className="text-white">
                                                <div className="flex items-center text-sm font-semibold mb-1">
                                                    <BookOpen className="w-4 h-4 mr-2 opacity-90" />
                                                    <span className="truncate">{note.subject}</span>
                                                </div>
                                                <div className="flex items-center text-xs opacity-85 mb-1">
                                                    <Calendar className="w-3.5 h-3.5 mr-1.5" />
                                                    Semester {note.semester}
                                                </div>
                                                {note.examType && (
                                                    <div className="flex items-center text-xs opacity-85">
                                                        <FileText className="w-3.5 h-3.5 mr-1.5" />
                                                        {note.examType}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="p-7">
                                    {/* Title */}
                                    <h3 className="text-xl font-bold text-gray-900 mb-4 line-clamp-2 leading-tight tracking-tight">
                                        {note.title}
                                    </h3>

                                    {/* Description */}
                                    {note.description && (
                                        <p className="text-gray-600 text-sm mb-5 line-clamp-3 leading-relaxed">
                                            {note.description}
                                        </p>
                                    )}

                                    {/* Tags */}
                                    {note.tags && note.tags.length > 0 && (
                                        <div className="flex flex-wrap gap-2 mb-5">
                                            {note.tags.slice(0, 2).map((tag, index) => (
                                                <span key={index} className="px-3 py-1.5 text-xs font-medium bg-indigo-50 text-indigo-700 rounded-lg border border-indigo-100 hover:bg-indigo-100 transition-colors">
                                                    #{tag}
                                                </span>
                                            ))}
                                            {note.tags.length > 2 && (
                                                <span className="px-3 py-1.5 text-xs font-medium bg-gray-100 text-gray-600 rounded-lg border border-gray-200">
                                                    +{note.tags.length - 2} more
                                                </span>
                                            )}
                                        </div>
                                    )}

                                    {/* Stats Row */}
                                    <div className="flex items-center justify-between text-sm text-gray-500 mb-6 py-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl px-4 border border-gray-100">
                                        <div className="flex items-center space-x-5">
                                            <span className="flex items-center hover:text-red-500 transition-colors cursor-pointer">
                                                <Heart className="w-4 h-4 mr-1.5" />
                                                <span className="font-medium">{note.likes?.length || 0}</span>
                                            </span>
                                            <span className="flex items-center hover:text-green-500 transition-colors cursor-pointer">
                                                <Download className="w-4 h-4 mr-1.5" />
                                                <span className="font-medium">{note.downloads || 0}</span>
                                            </span>
                                            <span className="flex items-center hover:text-blue-500 transition-colors cursor-pointer">
                                                <Eye className="w-4 h-4 mr-1.5" />
                                                <span className="font-medium">{note.views || 0}</span>
                                            </span>
                                        </div>
                                        <span className="font-semibold text-gray-700 bg-white px-3 py-1 rounded-lg border border-gray-200">
                                            {formatFileSize(note.fileSize)}
                                        </span>
                                    </div>


                                    {/* Action Buttons */}
                                    <div className="space-y-4">
                                        {/* Primary Download Button */}
                                        <Button
                                            variant="primary"
                                            onClick={() => handleDownload(note._id)}

                                            className="w-full py-4 font-semibold text-sm bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 shadow-lg hover:shadow-xl transition-all duration-300 rounded-xl border-0 focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                                            disabled={downloadingNotes.has(note._id)}
                                        >
                                            {downloadingNotes.has(note._id) ? (
                                                <span className="flex items-center justify-center">
                                                    <div className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full mr-3"></div>
                                                    Downloading...
                                                </span>
                                            ) : (
                                                <span className="flex items-center justify-center">
                                                    <Download className="w-5 h-5 mr-2" />
                                                    Download PDF
                                                </span>
                                            )}
                                        </Button>

                                        {/* View in Browser Button - Only show for supported file types */}
                                        {canViewFile(note.fileName || note.originalName || `file.${note.fileType}`) && (
                                            <Button
                                                variant="outline"
                                                onClick={() => handleView(note._id)}

                                                className="w-full py-4 font-semibold text-sm border-2 border-emerald-500 text-emerald-600 hover:bg-emerald-500 hover:text-white shadow-md hover:shadow-lg transition-all duration-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2"
                                                disabled={viewingNotes.has(note._id)}
                                                title={getViewDescription(note.fileName || note.originalName || `file.${note.fileType}`)}
                                            >
                                                {viewingNotes.has(note._id) ? (
                                                    <span className="flex items-center justify-center">
                                                        <div className="animate-spin w-5 h-5 border-2 border-current border-t-transparent rounded-full mr-3"></div>
                                                        Opening...
                                                    </span>
                                                ) : (
                                                    <span className="flex items-center justify-center">
                                                        <ExternalLink className="w-5 h-5 mr-2" />
                                                        Open in Browser
                                                    </span>
                                                )}
                                            </Button>
                                        )}

                                        {/* Secondary Actions */}
                                        <div className="flex items-center space-x-3">
                                            <Button
                                                size="sm"
                                                variant={note.likes?.some(like => like.user === user?.id) ? "danger" : "outline"}
                                                onClick={() => handleLike(note._id)}

                                                className="flex-1 py-3 hover:scale-105 transition-all duration-200 rounded-xl font-medium shadow-sm hover:shadow-md"
                                                title="Like this note"
                                            >
                                                <Heart className="w-4 h-4 mr-2" />
                                                {note.likes?.length || 0}
                                            </Button>
                                            <Button
                                                size="sm"
                                                variant={note.isBookmarked ? "primary" : "outline"}
                                                onClick={() => handleBookmark(note._id)}

                                                disabled={note.bookmarkLoading}
                                                className="py-3 px-4 hover:scale-105 transition-all duration-200 rounded-xl font-medium shadow-sm hover:shadow-md"
                                                title={note.isBookmarked ? "Remove from bookmarks" : "Add to bookmarks"}
                                            >
                                                <Bookmark className="w-4 h-4" />
                                            </Button>
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                onClick={() => handleShare(note._id)}

                                                className="py-3 px-4 hover:scale-105 transition-all duration-200 rounded-xl font-medium shadow-sm hover:shadow-md"
                                                title="Share this note"
                                            >
                                                <Share2 className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Pagination */}
                {pagination && pagination.totalPages > 1 && (
                    <div className="flex items-center justify-center space-x-2 mt-8">
                        <Button
                            variant="outline"
                            disabled={!pagination.hasPrevPage}
                            onClick={() => setCurrentPage(currentPage - 1)}
                        >
                            Previous
                        </Button>

                        <div className="flex items-center space-x-1">
                            {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                                const page = i + 1;
                                return (
                                    <Button
                                        key={page}
                                        variant={currentPage === page ? "primary" : "outline"}
                                        size="sm"
                                        onClick={() => setCurrentPage(page)}
                                    >
                                        {page}
                                    </Button>
                                );
                            })}
                        </div>

                        <Button
                            variant="outline"
                            disabled={!pagination.hasNextPage}
                            onClick={() => setCurrentPage(currentPage + 1)}
                        >
                            Next
                        </Button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Notes;
