import { useState, useEffect } from 'react';
import {
    Bookmark,
    Search,
    Filter,
    Download,
    Eye,
    Calendar,
    User,
    BookOpen,
    Heart,
    Share2,
    ChevronDown
} from 'lucide-react';
import { noteService } from '../services/noteService.js';
import { useAuth } from '../hooks/useAuth.js';
import Input from '../components/common/Input';
import Select from '../components/common/Select';
import Button from '../components/common/Button';
import LoadingSpinner from '../components/common/LoadingSpinner';
import toast from 'react-hot-toast';

const Bookmarks = () => {
    const { user } = useAuth();
    const [bookmarkedNotes, setBookmarkedNotes] = useState([]);
    const [filteredNotes, setFilteredNotes] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedSubject, setSelectedSubject] = useState('');
    const [pagination, setPagination] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);

    useEffect(() => {
        fetchBookmarkedNotes();
    }, [currentPage]);

    useEffect(() => {
        const filtered = bookmarkedNotes.filter(note => {
            const matchesSearch = !searchTerm ||
                note.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                note.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                note.uploader?.name?.toLowerCase().includes(searchTerm.toLowerCase());

            const matchesSubject = !selectedSubject || note.subject === selectedSubject;

            return matchesSearch && matchesSubject;
        });
        setFilteredNotes(filtered);
    }, [searchTerm, selectedSubject, bookmarkedNotes]);

    const fetchBookmarkedNotes = async () => {
        try {
            setIsLoading(true);
            const response = await noteService.getBookmarkedNotes(currentPage);
            setBookmarkedNotes(response.data.notes);
            setPagination(response.data.pagination);
            setFilteredNotes(response.data.notes);
        } catch (error) {
            console.error('Error fetching bookmarked notes:', error);
            toast.error('Failed to fetch bookmarked notes');
        } finally {
            setIsLoading(false);
        }
    };

    const handleDownload = async (noteId) => {
        try {
            const response = await noteService.downloadNote(noteId);
            const link = document.createElement('a');
            link.href = response.data.downloadUrl;
            link.download = response.data.fileName;
            link.click();
            toast.success('Note downloaded successfully');
        } catch (error) {
            console.error('Error downloading note:', error);
            toast.error('Failed to download note');
        }
    };

    const handleUnbookmark = async (noteId) => {
        try {
            const response = await noteService.toggleBookmark(noteId);
            toast.success(response.message);
            // Remove from local state
            setBookmarkedNotes(bookmarkedNotes.filter(note => note._id !== noteId));
        } catch (error) {
            console.error('Error removing bookmark:', error);
            toast.error('Failed to remove bookmark');
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

    const getUniqueSubjects = () => {
        const subjects = bookmarkedNotes.map(note => note.subject);
        return [...new Set(subjects)];
    };

    const subjectOptions = [
        { value: '', label: 'All Subjects' },
        ...getUniqueSubjects().map(subject => ({ value: subject, label: subject }))
    ];

    if (isLoading) {
        return <LoadingSpinner text="Loading bookmarked notes..." />;
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 flex items-center">
                        <Bookmark className="w-8 h-8 mr-3 text-purple-600" />
                        Bookmarked Notes
                    </h1>
                    <p className="text-gray-600 mt-2">
                        Your saved notes and study materials ({filteredNotes.length} items)
                    </p>
                </div>

                {/* Search and Filter */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
                    <div className="flex flex-col md:flex-row gap-4">
                        <div className="flex-1">
                            <Input
                                type="text"
                                placeholder="Search bookmarked notes..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                icon={Search}
                            />
                        </div>
                        <div className="w-full md:w-64">
                            <Select
                                value={selectedSubject}
                                onChange={(e) => setSelectedSubject(e.target.value)}
                                options={subjectOptions}
                                icon={Filter}
                            />
                        </div>
                    </div>
                </div>

                {/* Bookmarked Notes Grid */}
                {filteredNotes.length === 0 ? (
                    <div className="text-center py-12">
                        <Bookmark className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-xl font-medium text-gray-900 mb-2">
                            {searchTerm || selectedSubject ? 'No matching bookmarks found' : 'No bookmarked notes yet'}
                        </h3>
                        <p className="text-gray-500">
                            {searchTerm || selectedSubject
                                ? 'Try adjusting your search criteria'
                                : 'Start bookmarking notes to build your personal study library'
                            }
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredNotes.map((note) => (
                            <div key={note._id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
                                {/* Card Header */}
                                <div className="p-6">
                                    <div className="flex items-start justify-between mb-4">
                                        <div className="flex-1">
                                            <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
                                                {note.title}
                                            </h3>
                                            <div className="flex items-center gap-2 mb-3">
                                                <span className="inline-block px-3 py-1 bg-blue-100 text-blue-800 text-sm font-medium rounded-full">
                                                    {note.subject}
                                                </span>
                                                <span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-700 rounded">
                                                    Sem {note.semester}
                                                </span>
                                                <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-700 rounded">
                                                    {note.fileType?.toUpperCase()}
                                                </span>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => handleUnbookmark(note._id)}
                                            className="text-purple-600 hover:text-purple-800 transition-colors"
                                            title="Remove bookmark"
                                        >
                                            <Bookmark className="w-5 h-5 fill-current" />
                                        </button>
                                    </div>

                                    {/* Description */}
                                    <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                                        {note.description}
                                    </p>

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

                                    {/* Metadata */}
                                    <div className="space-y-2 text-sm text-gray-500">
                                        <div className="flex items-center">
                                            <User className="w-4 h-4 mr-2" />
                                            <span>by {note.uploader?.name}</span>
                                        </div>
                                        <div className="flex items-center">
                                            <Calendar className="w-4 h-4 mr-2" />
                                            <span>Uploaded {formatDate(note.createdAt)}</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Card Footer */}
                                <div className="px-6 py-4 bg-gray-50 border-t border-gray-100">
                                    <div className="flex items-center justify-between">
                                        <span className="text-xs text-gray-500">
                                            Bookmarked recently
                                        </span>
                                        <div className="flex space-x-2">
                                            <Button
                                                size="sm"
                                                variant="primary"
                                                icon={Download}
                                                onClick={() => handleDownload(note._id)}
                                            >
                                                Download
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

export default Bookmarks;
