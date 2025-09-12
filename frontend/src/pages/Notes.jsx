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
    Bookmark
} from 'lucide-react';
import LoadingSpinner from '../components/common/LoadingSpinner.jsx';
import Button from '../components/common/Button.jsx';
import toast from 'react-hot-toast';
import { downloadFile, downloadFileSimple } from '../utils/downloadUtils.js';

const Notes = () => {
    const { user } = useAuth();
    const [notes, setNotes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [downloadingNotes, setDownloadingNotes] = useState(new Set());
    const [searchTerm, setSearchTerm] = useState('');
    const [filters, setFilters] = useState({
        semester: '',
        subject: '',
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
        try {
            const response = await noteService.toggleLike(noteId);
            toast.success(response.message);

            // Update the notes list
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
            return;
        }

        try {
            // Add note to downloading set
            setDownloadingNotes(prev => new Set([...prev, noteId]));

            // Show loading toast
            const loadingToast = toast.loading('Preparing download...');

            const response = await noteService.downloadNote(noteId);
            const { downloadUrl, fileName } = response.data;

            // Update toast
            toast.dismiss(loadingToast);
            toast.loading('Downloading file...');

            // Try to download using the blob approach first for better compatibility
            try {
                await downloadFile(downloadUrl, fileName);
                toast.dismiss();
                toast.success(`"${fileName}" downloaded successfully`);
            } catch (blobError) {
                console.warn('Blob download failed, trying simple download:', blobError);
                // Fallback to simple download
                downloadFileSimple(downloadUrl, fileName);
                toast.dismiss();
                toast.success(`Download started for "${fileName}"`);
            }
        } catch (error) {
            console.error('Error downloading note:', error);
            toast.dismiss();

            // Show specific error message
            const errorMessage = error.message || 'Failed to download note. Please try again.';
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

    const formatDate = (date) => {
        return new Date(date).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
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
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg">
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
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {notes.map((note) => (
                            <div key={note._id} className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
                                <div className="p-6">
                                    {/* Note Header */}
                                    <div className="flex items-start justify-between mb-4">
                                        <div className="flex-1">
                                            <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
                                                {note.title}
                                            </h3>
                                            <div className="flex items-center text-sm text-gray-600 space-x-4">
                                                <span className="flex items-center">
                                                    <BookOpen className="w-4 h-4 mr-1" />
                                                    {note.subject}
                                                </span>
                                                <span className="flex items-center">
                                                    <Calendar className="w-4 h-4 mr-1" />
                                                    Sem {note.semester}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="flex items-center space-x-1">
                                            <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded">
                                                {note.fileType?.toUpperCase()}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Description */}
                                    {note.description && (
                                        <p className="text-gray-700 text-sm mb-4 line-clamp-3">
                                            {note.description}
                                        </p>
                                    )}

                                    {/* Tags */}
                                    {note.tags && note.tags.length > 0 && (
                                        <div className="flex flex-wrap gap-1 mb-4">
                                            {note.tags.slice(0, 3).map((tag, index) => (
                                                <span key={index} className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded">
                                                    {tag}
                                                </span>
                                            ))}
                                            {note.tags.length > 3 && (
                                                <span className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded">
                                                    +{note.tags.length - 3} more
                                                </span>
                                            )}
                                        </div>
                                    )}

                                    {/* Stats */}
                                    <div className="flex items-center justify-between text-sm text-gray-600 mb-4">
                                        <div className="flex items-center space-x-3">
                                            <span className="flex items-center">
                                                <Heart className="w-4 h-4 mr-1" />
                                                {note.likes?.length || 0}
                                            </span>
                                            <span className="flex items-center">
                                                <Download className="w-4 h-4 mr-1" />
                                                {note.downloads || 0}
                                            </span>
                                            <span className="flex items-center">
                                                <Eye className="w-4 h-4 mr-1" />
                                                {note.views || 0}
                                            </span>
                                        </div>
                                        <span>{formatFileSize(note.fileSize)}</span>
                                    </div>

                                    {/* Uploader Info */}
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="flex items-center">
                                            <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-medium mr-3">
                                                {note.uploader?.name?.charAt(0).toUpperCase()}
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium text-gray-900">
                                                    {note.uploader?.name}
                                                </p>
                                                <p className="text-xs text-gray-600">
                                                    {formatDate(note.createdAt)}
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Actions */}
                                    <div className="flex items-center space-x-2">
                                        <Button
                                            size="sm"
                                            variant="primary"
                                            onClick={() => handleDownload(note._id)}
                                            icon={Download}
                                            className="flex-1"
                                            disabled={downloadingNotes.has(note._id)}
                                        >
                                            {downloadingNotes.has(note._id) ? 'Downloading...' : 'Download'}
                                        </Button>
                                        <Button
                                            size="sm"
                                            variant={note.likes?.some(like => like.user === user?.id) ? "danger" : "outline"}
                                            onClick={() => handleLike(note._id)}
                                            icon={Heart}
                                        >
                                            {note.likes?.length || 0}
                                        </Button>
                                        <Button
                                            size="sm"
                                            variant={note.isBookmarked ? "primary" : "outline"}
                                            onClick={() => handleBookmark(note._id)}
                                            icon={Bookmark}
                                            disabled={note.bookmarkLoading}
                                            title={note.isBookmarked ? "Remove from bookmarks" : "Add to bookmarks"}
                                        >
                                        </Button>
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            onClick={() => handleShare(note._id)}
                                            icon={Share2}
                                        >
                                        </Button>
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
