import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
    BookOpen,
    Users,
    Bookmark,
    Clock,
    MessageSquare,
    TrendingUp,
    FileText,
    Calendar,
    Award,
    Eye,
    RefreshCw
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { statsService } from '../services/statsService';
import { noteService } from '../services/noteService';
import { postService } from '../services/postService';

const Dashboard = () => {
    const { user } = useAuth();

    // Helper function to get time-based greeting
    const getGreeting = () => {
        const hour = new Date().getHours();
        if (hour < 12) return 'Good morning';
        if (hour < 17) return 'Good afternoon';
        return 'Good evening';
    };
    const [stats, setStats] = useState({
        totalNotes: 0,
        totalPosts: 0,
        bookmarkedNotes: 0,
        recentViews: 0
    });
    const [recentNotes, setRecentNotes] = useState([]);
    const [recentPosts, setRecentPosts] = useState([]);
    const [bookmarkedNotes, setBookmarkedNotes] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [lastUpdated, setLastUpdated] = useState(null);

    const fetchDashboardData = useCallback(async () => {
        try {
            setIsLoading(true);
            setError(null);

            // Check if user is authenticated before making requests
            if (!user) {
                setIsLoading(false);
                return;
            }

            let userRecentNotes = [];

            // Fetch dashboard stats
            try {
                const statsResponse = await statsService.getDashboardStats();

                if (statsResponse.success) {
                    const { stats, recentActivity } = statsResponse.data;
                    setStats({
                        totalNotes: stats.notesUploaded || 0,
                        totalPosts: recentActivity.posts?.length || 0,
                        bookmarkedNotes: 0, // Will be updated when bookmark endpoint is available
                        recentViews: userRecentNotes.length || 0 // Use recent notes as proxy for recent views
                    });

                    // Set recent notes from user's uploaded notes
                    if (recentActivity.notes) {
                        userRecentNotes = recentActivity.notes.map(note => ({
                            id: note._id,
                            title: note.title,
                            subject: 'General', // Note model might need subject field
                            viewedAt: new Date(note.createdAt).toLocaleDateString(),
                            type: 'notes'
                        }));
                    }

                    // Set recent posts
                    if (recentActivity.posts) {
                        const formattedRecentPosts = recentActivity.posts.map(post => ({
                            id: post._id,
                            title: post.content.substring(0, 50) + '...',
                            author: 'You',
                            replies: post.replies?.length || 0,
                            time: new Date(post.createdAt).toLocaleDateString()
                        }));
                        setRecentPosts(formattedRecentPosts);
                    }
                }
            } catch (statsError) {
                console.error('Error fetching dashboard stats:', statsError);
                // Continue with other API calls even if stats fail
            }

            // Fetch additional notes for recent viewing if we need more
            if (userRecentNotes.length < 3) {
                try {
                    const notesResponse = await noteService.getNotes({ limit: 5, sort: 'createdAt' });
                    if (notesResponse.success && notesResponse.data.notes) {
                        const additionalNotes = notesResponse.data.notes
                            .filter(note => !userRecentNotes.find(rn => rn.id === note._id))
                            .slice(0, 3 - userRecentNotes.length)
                            .map(note => ({
                                id: note._id,
                                title: note.title,
                                subject: note.subject || 'General',
                                viewedAt: new Date(note.createdAt).toLocaleDateString(),
                                type: note.fileType === 'application/pdf' ? 'question_paper' : 'notes'
                            }));

                        userRecentNotes = [...userRecentNotes, ...additionalNotes];
                    }
                } catch (error) {
                    console.error('Error fetching additional notes:', error);
                }
            }

            setRecentNotes(userRecentNotes);

            // Fetch community posts
            try {
                const postsResponse = await postService.getPosts({ limit: 5, sort: 'createdAt' });
                if (postsResponse.success && postsResponse.data.posts) {
                    const communityPosts = postsResponse.data.posts.map(post => ({
                        id: post._id,
                        title: post.content.substring(0, 60) + (post.content.length > 60 ? '...' : ''),
                        author: post.author?.name || 'Anonymous',
                        replies: post.replies?.length || 0,
                        time: new Date(post.createdAt).toLocaleDateString()
                    }));

                    // Use community posts if we don't have enough user posts
                    setRecentPosts(prev => {
                        if (prev.length === 0) {
                            return communityPosts.slice(0, 5);
                        }
                        return prev;
                    });

                    // Update stats with actual data
                    setStats(prev => ({
                        ...prev,
                        totalPosts: Math.max(prev.totalPosts, communityPosts.length),
                        recentViews: userRecentNotes.length
                    }));
                }
            } catch (error) {
                console.error('Error fetching community posts:', error);
            }

            // Fetch bookmarked notes
            try {
                const bookmarksResponse = await noteService.getBookmarkedNotes(1);
                if (bookmarksResponse.success && bookmarksResponse.data.notes) {
                    const formattedBookmarks = bookmarksResponse.data.notes.map(note => ({
                        id: note._id,
                        title: note.title,
                        subject: note.subject || 'General',
                        downloads: note.downloads || 0
                    }));
                    setBookmarkedNotes(formattedBookmarks);

                    // Update bookmarked count in stats
                    setStats(prev => ({
                        ...prev,
                        bookmarkedNotes: bookmarksResponse.data.notes.length
                    }));
                }
            } catch (error) {
                console.error('Error fetching bookmarks:', error);
                // Fallback to placeholder data if bookmarks API is not available
                setBookmarkedNotes([
                    { id: 1, title: 'Bookmark functionality available', subject: 'Various', downloads: 0 },
                    { id: 2, title: 'Click on notes to bookmark them', subject: 'Tutorial', downloads: 0 }
                ]);
            }

            // For now, set some placeholder bookmarked notes
            // TODO: Implement bookmark endpoint
            setBookmarkedNotes([
                { id: 1, title: 'Bookmarked notes will appear here', subject: 'Various', downloads: 0 },
                { id: 2, title: 'Add bookmark functionality', subject: 'Development', downloads: 0 }
            ]);

        } catch (error) {
            console.error('Error fetching dashboard data:', error);
            setError('Failed to load dashboard data. Please try refreshing the page.');

            // Handle authentication errors
            if (error.response?.status === 401) {
                console.log('User not authenticated, redirecting...');
                // The API service should handle this automatically, but just in case
            }

            // Fallback to minimal data on error
            setStats({
                totalNotes: 0,
                totalPosts: 0,
                bookmarkedNotes: 0,
                recentViews: 0
            });
            setRecentNotes([]);
            setRecentPosts([]);
            setBookmarkedNotes([]);
        } finally {
            setIsLoading(false);
            setLastUpdated(new Date());
        }
    }, [user]);

    useEffect(() => {
        fetchDashboardData();
    }, [fetchDashboardData]);

    if (isLoading) {
        return <LoadingSpinner />;
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gray-50 py-6">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
                        <div className="text-red-600 text-lg font-medium mb-2">
                            {error}
                        </div>
                        <button
                            onClick={fetchDashboardData}
                            className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
                        >
                            Try Again
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-6 animate-fadeIn">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Welcome Header */}
                <div className="mb-8">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">
                                {getGreeting()}, {user?.name}!
                            </h1>
                            <p className="text-gray-600 mt-2">
                                Here's what's happening in your academic journey
                                {lastUpdated && (
                                    <span className="text-sm text-gray-500 block mt-1">
                                        Last updated: {lastUpdated.toLocaleTimeString()}
                                    </span>
                                )}
                            </p>
                        </div>
                        <button
                            onClick={fetchDashboardData}
                            disabled={isLoading}
                            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                            Refresh
                        </button>
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <Link to="/notes" className="bg-white rounded-xl shadow-sm p-6 border border-gray-200 hover:shadow-md transition-shadow duration-200 cursor-pointer group block">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Total Notes</p>
                                <p className="text-3xl font-bold text-blue-600 group-hover:text-blue-700 transition-colors">{stats.totalNotes}</p>
                            </div>
                            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center group-hover:bg-blue-200 transition-colors">
                                <BookOpen className="w-6 h-6 text-blue-600" />
                            </div>
                        </div>
                    </Link>

                   
                    <Link to="/bookmarks" className="bg-white rounded-xl shadow-sm p-6 border border-gray-200 hover:shadow-md transition-shadow duration-200 cursor-pointer group block">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Bookmarked</p>
                                <p className="text-3xl font-bold text-purple-600 group-hover:text-purple-700 transition-colors">{stats.bookmarkedNotes}</p>
                            </div>
                            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center group-hover:bg-purple-200 transition-colors">
                                <Bookmark className="w-6 h-6 text-purple-600" />
                            </div>
                        </div>
                    </Link>

                    <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200 hover:shadow-md transition-shadow duration-200 cursor-pointer group">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Recent Views</p>
                                <p className="text-3xl font-bold text-orange-600 group-hover:text-orange-700 transition-colors">{stats.recentViews}</p>
                            </div>
                            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center group-hover:bg-orange-200 transition-colors">
                                <Eye className="w-6 h-6 text-orange-600" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Main Content Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Recently Viewed Notes */}
                    <div className="lg:col-span-2">
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
                            <div className="p-6 border-b border-gray-200">
                                <div className="flex items-center justify-between">
                                    <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                                        <Clock className="w-5 h-5 mr-2 text-blue-600" />
                                        Recently Viewed
                                    </h2>
                                    <Link
                                        to="/notes"
                                        className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                                    >
                                        View All
                                    </Link>
                                </div>
                            </div>
                            <div className="p-6">
                                <div className="space-y-4">
                                    {recentNotes.length > 0 ? (
                                        recentNotes.map((note) => (
                                            <Link
                                                key={note.id}
                                                to={`/notes/${note.id}`}
                                                className="flex items-center p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
                                            >
                                                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mr-4">
                                                    {note.type === 'question_paper' ? (
                                                        <FileText className="w-5 h-5 text-blue-600" />
                                                    ) : (
                                                        <BookOpen className="w-5 h-5 text-blue-600" />
                                                    )}
                                                </div>
                                                <div className="flex-1">
                                                    <h3 className="font-medium text-gray-900">{note.title}</h3>
                                                    <p className="text-sm text-gray-500">{note.subject} • {note.viewedAt}</p>
                                                </div>
                                            </Link>
                                        ))
                                    ) : (
                                        <div className="text-center py-8">
                                            <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                                            <p className="text-gray-500">No recent notes available</p>
                                            <Link
                                                to="/notes"
                                                className="text-blue-600 hover:text-blue-700 text-sm font-medium mt-2 inline-block"
                                            >
                                                Browse notes
                                            </Link>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Quick Actions & Profile Summary */}
                    <div className="space-y-6">
                        {/* Profile Summary */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">Profile Summary</h3>
                            <div className="space-y-3">
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Department:</span>
                                    <span className="font-medium">{user?.department || 'Not specified'}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Semester:</span>
                                    <span className="font-medium">{user?.semester || 'Not specified'}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Notes Uploaded:</span>
                                    <span className="font-medium">{stats.totalNotes}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Email:</span>
                                    <span className="font-medium text-sm">{user?.email || 'Not available'}</span>
                                </div>
                            </div>
                            <Link
                                to="/profile"
                                className="w-full mt-4 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors text-center block"
                            >
                                Edit Profile
                            </Link>
                        </div>

                        {/* Quick Actions */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
                            <div className="space-y-3">
                                <Link
                                    to="/upload"
                                    className="w-full bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors text-center block"
                                >
                                    📚 Upload Notes
                                </Link>
                                <Link
                                    to="/notes"
                                    className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors text-center block"
                                >
                                    🔍 Browse Notes
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Community & Bookmarks Section */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">

                    {/* Bookmarked Notes */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200">
                        <div className="p-6 border-b border-gray-200">
                            <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                                <Bookmark className="w-5 h-5 mr-2 text-purple-600" />
                                Saved Notes
                            </h2>
                        </div>
                        <div className="p-6">
                            <div className="space-y-4">
                                {bookmarkedNotes.length > 0 ? (
                                    bookmarkedNotes.map((note) => (
                                        <Link
                                            key={note.id}
                                            to={`/notes/${note.id}`}
                                            className="block p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                                        >
                                            <h4 className="font-medium text-gray-900 mb-2">{note.title}</h4>
                                            <div className="flex items-center justify-between text-sm text-gray-500">
                                                <span>{note.subject}</span>
                                                <span>{note.downloads} downloads</span>
                                            </div>
                                        </Link>
                                    ))
                                ) : (
                                    <div className="text-center py-8">
                                        <Bookmark className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                                        <p className="text-gray-500">No bookmarked notes yet</p>
                                        <Link
                                            to="/notes"
                                            className="text-purple-600 hover:text-purple-700 text-sm font-medium mt-2 inline-block"
                                        >
                                            Find notes to bookmark
                                        </Link>
                                    </div>
                                )}
                            </div>
                            <button
                                onClick={() => window.location.href = '/bookmarks'}
                                className="w-full mt-4 bg-purple-600 text-white py-2 px-4 rounded-lg hover:bg-purple-700 transition-colors"
                            >
                                View All Bookmarks
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
