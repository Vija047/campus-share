import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
    BookOpen,
    Bookmark,
    Clock,
    MessageSquare,
    TrendingUp,
    FileText,
    Eye,
    RefreshCw,
    Upload,
    Search,
    Users,
    Download,
    Heart,
    Star,
    Activity,
    ArrowUpRight,
    Bot
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import LoadingSpinner from '../components/common/LoadingSpinner';
import AIChatbot from '../components/common/AIChatbot';
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

    // Helper function to get greeting icon
    const getGreetingIcon = () => {
        const hour = new Date().getHours();
        if (hour < 12) return '🌅';
        if (hour < 17) return '☀️';
        return '🌙';
    };

    // Helper function to calculate time ago
    const getTimeAgo = (date) => {
        const now = new Date();
        const diff = now - new Date(date);
        const minutes = Math.floor(diff / 60000);
        const hours = Math.floor(diff / 3600000);
        const days = Math.floor(diff / 86400000);

        if (days > 0) return `${days}d ago`;
        if (hours > 0) return `${hours}h ago`;
        if (minutes > 0) return `${minutes}m ago`;
        return 'Just now';
    };

    const [stats, setStats] = useState({
        totalNotes: 0,
        totalPosts: 0,
        bookmarkedNotes: 0,
        recentViews: 0,
        totalDownloads: 0,
        communityRank: 0
    });
    const [recentNotes, setRecentNotes] = useState([]);
    const [recentPosts, setRecentPosts] = useState([]);
    const [bookmarkedNotes, setBookmarkedNotes] = useState([]);
    const [trendingNotes, setTrendingNotes] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [lastUpdated, setLastUpdated] = useState(null);
    const [activeTab, setActiveTab] = useState('recent');
    const [showChatbot, setShowChatbot] = useState(false);

    const fetchDashboardData = useCallback(async () => {
        try {
            setIsLoading(true);
            setError(null);

            // Check if user is authenticated before making requests
            if (!user) {
                setIsLoading(false);
                setStats({
                    totalNotes: 0,
                    totalPosts: 0,
                    bookmarkedNotes: 0,
                    recentViews: 0,
                    totalDownloads: 0,
                    communityRank: 0
                });
                return;
            }

            let userRecentNotes = [];

            // Fetch dashboard stats with enhanced error handling
            try {
                const statsResponse = await statsService.getDashboardStats();

                if (statsResponse.success) {
                    const { stats, recentActivity } = statsResponse.data;
                    setStats({
                        totalNotes: stats.notesUploaded || 0,
                        totalPosts: recentActivity.posts?.length || 0,
                        bookmarkedNotes: 0,
                        recentViews: userRecentNotes.length || 0,
                        totalDownloads: stats.totalDownloads || 0,
                        communityRank: stats.rank || 0
                    });

                    // Set recent notes from user's uploaded notes
                    if (recentActivity.notes) {
                        userRecentNotes = recentActivity.notes.map(note => ({
                            id: note._id,
                            title: note.title,
                            subject: note.subject || 'General',
                            viewedAt: new Date(note.createdAt).toLocaleDateString(),
                            type: note.fileType?.includes('pdf') ? 'question_paper' : 'notes',
                            downloads: note.downloads || 0,
                            author: note.author?.name || user.name
                        }));
                    }

                    // Set recent posts
                    if (recentActivity.posts) {
                        const formattedRecentPosts = recentActivity.posts.map(post => ({
                            id: post._id,
                            title: post.content.substring(0, 80) + (post.content.length > 80 ? '...' : ''),
                            author: 'You',
                            replies: post.replies?.length || 0,
                            votes: post.upvotes?.length || 0,
                            time: new Date(post.createdAt).toLocaleDateString(),
                            timeAgo: getTimeAgo(post.createdAt)
                        }));
                        setRecentPosts(formattedRecentPosts);
                    }
                }
            } catch (statsError) {
                console.error('Error fetching dashboard stats:', statsError);
                // Set fallback data if stats fail
                setStats(prevStats => ({
                    ...prevStats,
                    totalNotes: 0,
                    totalPosts: 0,
                    bookmarkedNotes: 0,
                    recentViews: 0
                }));
                // Continue with other API calls even if stats fail
            }

            // Fetch additional notes for recent viewing if we need more
            if (userRecentNotes.length < 5) {
                try {
                    const notesResponse = await noteService.getNotes({ limit: 8, sort: 'createdAt' });
                    if (notesResponse.success && notesResponse.data.notes) {
                        const additionalNotes = notesResponse.data.notes
                            .filter(note => !userRecentNotes.find(rn => rn.id === note._id))
                            .slice(0, 5 - userRecentNotes.length)
                            .map(note => ({
                                id: note._id,
                                title: note.title,
                                subject: note.subject || 'General',
                                viewedAt: new Date(note.createdAt).toLocaleDateString(),
                                type: note.fileType?.includes('pdf') ? 'question_paper' : 'notes',
                                downloads: note.downloads || 0,
                                author: note.author?.name || 'Anonymous'
                            }));

                        userRecentNotes = [...userRecentNotes, ...additionalNotes];
                    }
                } catch (error) {
                    console.error('Error fetching additional notes:', error);
                }
            }

            setRecentNotes(userRecentNotes);

            // Fetch trending notes
            try {
                const trendingResponse = await noteService.getNotes({
                    limit: 6,
                    sort: 'downloads',
                    sortOrder: 'desc'
                });
                if (trendingResponse.success && trendingResponse.data.notes) {
                    const trending = trendingResponse.data.notes.map(note => ({
                        id: note._id,
                        title: note.title,
                        subject: note.subject || 'General',
                        downloads: note.downloads || 0,
                        author: note.author?.name || 'Anonymous',
                        createdAt: new Date(note.createdAt).toLocaleDateString(),
                        type: note.fileType?.includes('pdf') ? 'question_paper' : 'notes'
                    }));
                    setTrendingNotes(trending);
                }
            } catch (error) {
                console.error('Error fetching trending notes:', error);
            }

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

    // Loading skeleton component
    const SkeletonCard = () => (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 animate-pulse">
            <div className="flex items-center justify-between">
                <div>
                    <div className="h-4 bg-gray-200 rounded w-20 mb-2"></div>
                    <div className="h-8 bg-gray-200 rounded w-16"></div>
                </div>
                <div className="w-14 h-14 bg-gray-200 rounded-xl"></div>
            </div>
        </div>
    );

    const SkeletonList = () => (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
            <div className="p-6 border-b border-gray-100">
                <div className="h-6 bg-gray-200 rounded w-40 animate-pulse"></div>
            </div>
            <div className="p-6 space-y-4">
                {[1, 2, 3].map((i) => (
                    <div key={i} className="flex items-center p-4 bg-gray-50 rounded-xl animate-pulse">
                        <div className="w-12 h-12 bg-gray-200 rounded-xl mr-4"></div>
                        <div className="flex-1">
                            <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                            <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-6">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Loading Header */}
                    <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100 mb-8 animate-pulse">
                        <div className="flex items-center justify-between">
                            <div>
                                <div className="h-8 bg-gray-200 rounded w-64 mb-2"></div>
                                <div className="h-4 bg-gray-200 rounded w-96"></div>
                            </div>
                            <div className="flex space-x-3">
                                <div className="h-10 w-20 bg-gray-200 rounded-xl"></div>
                                <div className="h-10 w-32 bg-gray-200 rounded-xl"></div>
                            </div>
                        </div>
                    </div>

                    {/* Loading Stats Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                        <SkeletonCard />
                        <SkeletonCard />
                        <SkeletonCard />
                        <SkeletonCard />
                    </div>

                    {/* Loading Tabs */}
                    <div className="mb-6">
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-1 animate-pulse">
                            <div className="flex space-x-1">
                                <div className="flex-1 h-12 bg-gray-200 rounded-xl"></div>
                                <div className="flex-1 h-12 bg-gray-200 rounded-xl"></div>
                            </div>
                        </div>
                    </div>

                    {/* Loading Content */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        <div className="lg:col-span-2">
                            <SkeletonList />
                        </div>
                        <div className="space-y-6">
                            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 animate-pulse">
                                <div className="h-6 bg-gray-200 rounded w-32 mb-4"></div>
                                <div className="space-y-4">
                                    <div className="h-4 bg-gray-200 rounded"></div>
                                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                                    <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-orange-50 py-6">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="bg-white rounded-2xl shadow-lg border border-red-100 p-8 text-center">
                        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <RefreshCw className="w-8 h-8 text-red-600" />
                        </div>
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">
                            Oops! Something went wrong
                        </h2>
                        <div className="text-red-600 text-lg mb-6 max-w-md mx-auto">
                            {error}
                        </div>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <button
                                onClick={fetchDashboardData}
                                disabled={isLoading}
                                className="flex items-center justify-center px-6 py-3 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm hover:shadow-md font-medium"
                            >
                                <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                                Try Again
                            </button>
                            <Link
                                to="/notes"
                                className="flex items-center justify-center px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all duration-200 shadow-sm hover:shadow-md font-medium"
                            >
                                <BookOpen className="w-4 h-4 mr-2" />
                                Browse Notes
                            </Link>
                        </div>
                        <p className="text-gray-500 text-sm mt-4">
                            If the problem persists, please contact support or try refreshing the page.
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-6">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Welcome Header */}
                <div className="mb-8">
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
                        <div className="mb-4 lg:mb-0">
                            <h1 className="text-3xl font-bold text-gray-900 flex items-center">
                                <span className="mr-3 text-2xl">{getGreetingIcon()}</span>
                                {getGreeting()}, {user?.name || 'Student'}!
                            </h1>
                            <p className="text-gray-600 mt-2">
                                Welcome back to your academic dashboard. Here's your learning progress
                                {lastUpdated && (
                                    <span className="text-sm text-gray-500 block mt-1 flex items-center">
                                        <Activity className="w-3 h-3 mr-1" />
                                        Last updated: {lastUpdated.toLocaleTimeString()}
                                    </span>
                                )}
                            </p>
                        </div>
                        <div className="flex space-x-3">
                            <button
                                onClick={fetchDashboardData}
                                disabled={isLoading}
                                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm hover:shadow-md transform hover:scale-105"
                            >
                                <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                                Refresh
                            </button>
                            <button
                                onClick={() => setShowChatbot(true)}
                                className="flex items-center px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl hover:from-purple-700 hover:to-blue-700 transition-all duration-200 shadow-sm hover:shadow-md transform hover:scale-105"
                            >
                                <Bot className="w-4 h-4 mr-2" />
                                AI Assistant
                            </button>
                            <Link
                                to="/upload"
                                className="flex items-center px-4 py-2 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-all duration-200 shadow-sm hover:shadow-md transform hover:scale-105"
                            >
                                <Upload className="w-4 h-4 mr-2" />
                                Upload Note
                            </Link>
                        </div>
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    {/* Notes Stats Card */}
                    <Link
                        to="/notes"
                        className="bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-all duration-300 cursor-pointer group transform hover:scale-105"
                    >
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-blue-100 text-sm font-medium">Your Notes</p>
                                <p className="text-3xl font-bold mb-1">{stats.totalNotes}</p>
                                <div className="flex items-center text-blue-100 text-xs">
                                    <TrendingUp className="w-3 h-3 mr-1" />
                                    <span>Available to community</span>
                                </div>
                            </div>
                            <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center group-hover:bg-white/30 transition-colors">
                                <BookOpen className="w-7 h-7" />
                            </div>
                        </div>
                    </Link>

                    {/* Downloads Stats Card */}
                    <div className="bg-gradient-to-br from-green-500 to-green-600 text-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-all duration-300 cursor-pointer group transform hover:scale-105">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-green-100 text-sm font-medium">Total Downloads</p>
                                <p className="text-3xl font-bold mb-1">{stats.totalDownloads}</p>
                                <div className="flex items-center text-green-100 text-xs">
                                    <Download className="w-3 h-3 mr-1" />
                                    <span>Community impact</span>
                                </div>
                            </div>
                            <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center group-hover:bg-white/30 transition-colors">
                                <Download className="w-7 h-7" />
                            </div>
                        </div>
                    </div>

                    {/* Bookmarks Stats Card */}
                    <Link
                        to="/bookmarks"
                        className="bg-gradient-to-br from-purple-500 to-purple-600 text-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-all duration-300 cursor-pointer group transform hover:scale-105"
                    >
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-purple-100 text-sm font-medium">Bookmarked</p>
                                <p className="text-3xl font-bold mb-1">{stats.bookmarkedNotes}</p>
                                <div className="flex items-center text-purple-100 text-xs">
                                    <Heart className="w-3 h-3 mr-1" />
                                    <span>Saved for later</span>
                                </div>
                            </div>
                            <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center group-hover:bg-white/30 transition-colors">
                                <Bookmark className="w-7 h-7" />
                            </div>
                        </div>
                    </Link>

                    {/* Community Rank Stats Card */}
                    <div className="bg-gradient-to-br from-orange-500 to-orange-600 text-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-all duration-300 cursor-pointer group transform hover:scale-105">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-orange-100 text-sm font-medium">Community Rank</p>
                                <p className="text-3xl font-bold mb-1">#{stats.communityRank || 'N/A'}</p>
                                <div className="flex items-center text-orange-100 text-xs">
                                    <Star className="w-3 h-3 mr-1" />
                                    <span>Keep contributing!</span>
                                </div>
                            </div>
                            <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center group-hover:bg-white/30 transition-colors">
                                <Users className="w-7 h-7" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Activity Tabs */}
                <div className="mb-6">
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-1">
                        <div className="flex space-x-1">
                            <button
                                onClick={() => setActiveTab('recent')}
                                className={`flex-1 py-3 px-4 rounded-xl text-sm font-medium transition-all duration-200 ${activeTab === 'recent'
                                    ? 'bg-blue-600 text-white shadow-md'
                                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                                    }`}
                            >
                                <Clock className="w-4 h-4 mr-2 inline" />
                                Recent Activity
                            </button>
                            <button
                                onClick={() => setActiveTab('trending')}
                                className={`flex-1 py-3 px-4 rounded-xl text-sm font-medium transition-all duration-200 ${activeTab === 'trending'
                                    ? 'bg-blue-600 text-white shadow-md'
                                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                                    }`}
                            >
                                <TrendingUp className="w-4 h-4 mr-2 inline" />
                                Trending Notes
                            </button>
                        </div>
                    </div>
                </div>

                {/* Main Content Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Recent Activity / Trending Notes */}
                    <div className="col-span-1 lg:col-span-2">
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
                            <div className="p-6 border-b border-gray-100">
                                <div className="flex items-center justify-between">
                                    <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                                        {activeTab === 'recent' ? (
                                            <>
                                                <Clock className="w-5 h-5 mr-2 text-blue-600" />
                                                Recent Notes
                                            </>
                                        ) : (
                                            <>
                                                <TrendingUp className="w-5 h-5 mr-2 text-green-600" />
                                                Trending in Community
                                            </>
                                        )}
                                    </h2>
                                    <Link
                                        to="/notes"
                                        className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center"
                                    >
                                        View All <ArrowUpRight className="w-4 h-4 ml-1" />
                                    </Link>
                                </div>
                            </div>
                            <div className="p-6">
                                <div className="space-y-4">
                                    {activeTab === 'recent' ? (
                                        recentNotes.length > 0 ? (
                                            recentNotes.map((note) => (
                                                <Link
                                                    key={note.id}
                                                    to={`/notes/${note.id}`}
                                                    className="flex items-center p-4 bg-gradient-to-r from-gray-50 to-blue-50/30 rounded-xl hover:from-blue-50 hover:to-blue-100/50 transition-all duration-200 cursor-pointer group border border-gray-100"
                                                >
                                                    <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mr-4 group-hover:bg-blue-200 transition-colors">
                                                        {note.type === 'question_paper' ? (
                                                            <FileText className="w-6 h-6 text-blue-600" />
                                                        ) : (
                                                            <BookOpen className="w-6 h-6 text-blue-600" />
                                                        )}
                                                    </div>
                                                    <div className="flex-1">
                                                        <h3 className="font-semibold text-gray-900 group-hover:text-blue-900 transition-colors">
                                                            {note.title}
                                                        </h3>
                                                        <div className="flex items-center text-sm text-gray-500 mt-1">
                                                            <span>{note.subject}</span>
                                                            <span className="mx-2">•</span>
                                                            <span>{note.viewedAt}</span>
                                                            <span className="mx-2">•</span>
                                                            <span className="flex items-center">
                                                                <Download className="w-3 h-3 mr-1" />
                                                                {note.downloads}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </Link>
                                            ))
                                        ) : (
                                            <div className="text-center py-12">
                                                <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                                                <p className="text-gray-500 text-lg mb-2">No recent notes available</p>
                                                <p className="text-gray-400 text-sm mb-4">Start exploring our community notes</p>
                                                <Link
                                                    to="/notes"
                                                    className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors"
                                                >
                                                    <Search className="w-4 h-4 mr-2" />
                                                    Browse Notes
                                                </Link>
                                            </div>
                                        )
                                    ) : (
                                        trendingNotes.length > 0 ? (
                                            trendingNotes.map((note) => (
                                                <Link
                                                    key={note.id}
                                                    to={`/notes/${note.id}`}
                                                    className="flex items-center p-4 bg-gradient-to-r from-green-50 to-yellow-50/30 rounded-xl hover:from-green-100 hover:to-yellow-100/50 transition-all duration-200 cursor-pointer group border border-green-100"
                                                >
                                                    <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mr-4 group-hover:bg-green-200 transition-colors">
                                                        {note.type === 'question_paper' ? (
                                                            <FileText className="w-6 h-6 text-green-600" />
                                                        ) : (
                                                            <BookOpen className="w-6 h-6 text-green-600" />
                                                        )}
                                                    </div>
                                                    <div className="flex-1">
                                                        <h3 className="font-semibold text-gray-900 group-hover:text-green-900 transition-colors">
                                                            {note.title}
                                                        </h3>
                                                        <div className="flex items-center text-sm text-gray-500 mt-1">
                                                            <span>{note.subject}</span>
                                                            <span className="mx-2">•</span>
                                                            <span>by {note.author}</span>
                                                            <span className="mx-2">•</span>
                                                            <span className="flex items-center text-green-600 font-medium">
                                                                <Download className="w-3 h-3 mr-1" />
                                                                {note.downloads} downloads
                                                            </span>
                                                        </div>
                                                    </div>
                                                </Link>
                                            ))
                                        ) : (
                                            <div className="text-center py-12">
                                                <TrendingUp className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                                                <p className="text-gray-500 text-lg mb-2">No trending notes yet</p>
                                                <p className="text-gray-400 text-sm mb-4">Be the first to upload popular content</p>
                                                <Link
                                                    to="/upload"
                                                    className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors"
                                                >
                                                    <Upload className="w-4 h-4 mr-2" />
                                                    Upload Note
                                                </Link>
                                            </div>
                                        )
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Sidebar - Profile & Actions - Hidden on Mobile */}
                    <div className="hidden lg:block space-y-6">
                        {/* Profile Summary */}
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                            <div className="flex items-center mb-4">
                                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center text-white text-xl font-bold mr-4">
                                    {user?.name?.charAt(0).toUpperCase() || 'S'}
                                </div>
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-900">{user?.name || 'Student'}</h3>
                                    <p className="text-sm text-gray-500">{user?.email || 'email@example.com'}</p>
                                </div>
                            </div>

                            <div className="space-y-3 mb-4">
                                <div className="flex justify-between items-center py-2 border-b border-gray-50">
                                    <span className="text-gray-600 text-sm">Department</span>
                                    <span className="font-medium text-gray-900">{user?.department || 'Not specified'}</span>
                                </div>
                                <div className="flex justify-between items-center py-2 border-b border-gray-50">
                                    <span className="text-gray-600 text-sm">Semester</span>
                                    <span className="font-medium text-gray-900">{user?.semester || 'Not specified'}</span>
                                </div>
                                <div className="flex justify-between items-center py-2 border-b border-gray-50">
                                    <span className="text-gray-600 text-sm">Contributions</span>
                                    <span className="font-medium text-blue-600">{stats.totalNotes} notes</span>
                                </div>
                                <div className="flex justify-between items-center py-2">
                                    <span className="text-gray-600 text-sm">Community Rank</span>
                                    <span className="font-medium text-orange-600">#{stats.communityRank || 'N/A'}</span>
                                </div>
                            </div>

                            <Link
                                to="/profile"
                                className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-3 px-4 rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-200 text-center block font-medium"
                            >
                                Edit Profile
                            </Link>
                        </div>

                        {/* Quick Actions */}
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
                            <div className="space-y-3">
                                <Link
                                    to="/upload"
                                    className="w-full bg-gradient-to-r from-green-600 to-green-700 text-white py-3 px-4 rounded-xl hover:from-green-700 hover:to-green-800 transition-all duration-200 text-center flex items-center justify-center font-medium group"
                                >
                                    <Upload className="w-4 h-4 mr-2 group-hover:scale-110 transition-transform" />
                                    Upload Notes
                                </Link>
                                <Link
                                    to="/notes"
                                    className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-3 px-4 rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-200 text-center flex items-center justify-center font-medium group"
                                >
                                    <Search className="w-4 h-4 mr-2 group-hover:scale-110 transition-transform" />
                                    Browse Notes
                                </Link>
                                <Link
                                    to="/bookmarks"
                                    className="w-full bg-gradient-to-r from-purple-600 to-purple-700 text-white py-3 px-4 rounded-xl hover:from-purple-700 hover:to-purple-800 transition-all duration-200 text-center flex items-center justify-center font-medium group"
                                >
                                    <Bookmark className="w-4 h-4 mr-2 group-hover:scale-110 transition-transform" />
                                    My Bookmarks
                                </Link>
                                <Link
                                    to="/community"
                                    className="w-full bg-gradient-to-r from-orange-600 to-orange-700 text-white py-3 px-4 rounded-xl hover:from-orange-700 hover:to-orange-800 transition-all duration-200 text-center flex items-center justify-center font-medium group"
                                >
                                    <MessageSquare className="w-4 h-4 mr-2 group-hover:scale-110 transition-transform" />
                                    Join Chat
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Community & Bookmarks Section */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
                    {/* Community Posts */}
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
                        <div className="p-6 border-b border-gray-100">
                            <div className="flex items-center justify-between">
                                <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                                    <MessageSquare className="w-5 h-5 mr-2 text-blue-600" />
                                    Recent Discussions
                                </h2>
                                <Link
                                    to="/community"
                                    className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center"
                                >
                                    Join Discussion <ArrowUpRight className="w-4 h-4 ml-1" />
                                </Link>
                            </div>
                        </div>
                        <div className="p-6">
                            <div className="space-y-4">
                                {recentPosts.length > 0 ? (
                                    recentPosts.slice(0, 4).map((post) => (
                                        <div
                                            key={post.id}
                                            className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50/30 rounded-xl border border-blue-100 hover:from-blue-100 hover:to-indigo-100/50 transition-all duration-200 cursor-pointer"
                                        >
                                            <h4 className="font-medium text-gray-900 mb-2 line-clamp-2">{post.title}</h4>
                                            <div className="flex items-center justify-between text-sm text-gray-500">
                                                <span className="flex items-center">
                                                    <Users className="w-3 h-3 mr-1" />
                                                    {post.author}
                                                </span>
                                                <div className="flex items-center space-x-3">
                                                    <span className="flex items-center">
                                                        <MessageSquare className="w-3 h-3 mr-1" />
                                                        {post.replies} replies
                                                    </span>
                                                    <span className="text-xs text-blue-600">{post.timeAgo || post.time}</span>
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="text-center py-8">
                                        <MessageSquare className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                                        <p className="text-gray-500 mb-2">No recent discussions</p>
                                        <p className="text-gray-400 text-sm mb-4">Start a conversation with your peers</p>
                                        <Link
                                            to="/community"
                                            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors"
                                        >
                                            <MessageSquare className="w-4 h-4 mr-2" />
                                            Join Community
                                        </Link>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Bookmarked Notes */}
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
                        <div className="p-6 border-b border-gray-100">
                            <div className="flex items-center justify-between">
                                <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                                    <Bookmark className="w-5 h-5 mr-2 text-purple-600" />
                                    Saved Notes
                                </h2>
                                <Link
                                    to="/bookmarks"
                                    className="text-purple-600 hover:text-purple-700 text-sm font-medium flex items-center"
                                >
                                    View All <ArrowUpRight className="w-4 h-4 ml-1" />
                                </Link>
                            </div>
                        </div>
                        <div className="p-6">
                            <div className="space-y-4">
                                {bookmarkedNotes.length > 0 ? (
                                    bookmarkedNotes.slice(0, 4).map((note) => (
                                        <Link
                                            key={note.id}
                                            to={`/notes/${note.id}`}
                                            className="block p-4 bg-gradient-to-r from-purple-50 to-pink-50/30 rounded-xl border border-purple-100 hover:from-purple-100 hover:to-pink-100/50 transition-all duration-200"
                                        >
                                            <h4 className="font-medium text-gray-900 mb-2 line-clamp-2">{note.title}</h4>
                                            <div className="flex items-center justify-between text-sm text-gray-500">
                                                <span className="flex items-center">
                                                    <FileText className="w-3 h-3 mr-1" />
                                                    {note.subject}
                                                </span>
                                                <span className="flex items-center text-purple-600">
                                                    <Download className="w-3 h-3 mr-1" />
                                                    {note.downloads}
                                                </span>
                                            </div>
                                        </Link>
                                    ))
                                ) : (
                                    <div className="text-center py-8">
                                        <Bookmark className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                                        <p className="text-gray-500 mb-2">No bookmarked notes yet</p>
                                        <p className="text-gray-400 text-sm mb-4">Save notes you find useful</p>
                                        <Link
                                            to="/notes"
                                            className="inline-flex items-center px-4 py-2 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition-colors"
                                        >
                                            <Search className="w-4 h-4 mr-2" />
                                            Find Notes
                                        </Link>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* AI Chatbot Modal */}
            {showChatbot && <AIChatbot onClose={() => setShowChatbot(false)} />}
        </div>
    );
};

export default Dashboard;
