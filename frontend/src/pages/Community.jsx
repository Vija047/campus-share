import { useState, useEffect, useCallback } from 'react';
import {
    MessageSquare,
    Plus,
    TrendingUp,
    Users,
    Clock,
    AlertCircle,
    RefreshCw,
    Pin,
    Star
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../hooks/useAuth';
import { communityService } from '../services/communityService';
import PostCard from '../components/community/PostCard';
import CreatePost from '../components/community/CreatePost';
import CommunityFilters from '../components/community/CommunityFilters';
import LoadingSpinner from '../components/common/LoadingSpinner';

const Community = () => {
    const { user } = useAuth();
    const [posts, setPosts] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showCreatePost, setShowCreatePost] = useState(false);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [filters, setFilters] = useState({
        sort: 'createdAt',
        sortOrder: 'desc',
        category: '',
        semester: '',
        search: '',
        page: 1,
        limit: 10
    });
    const [communityStats, setCommunityStats] = useState({
        totalPosts: 0,
        totalUsers: 0,
        postsToday: 0,
        activeDiscussions: 0
    });
    const [hasMorePosts, setHasMorePosts] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);

    // Fetch community posts
    const fetchPosts = useCallback(async (isRefresh = false, loadMore = false) => {
        try {
            if (isRefresh) {
                setIsRefreshing(true);
            } else if (loadMore) {
                setLoadingMore(true);
            } else {
                setIsLoading(true);
            }

            setError(null);

            const currentFilters = loadMore
                ? { ...filters, page: filters.page + 1 }
                : { ...filters, page: 1 };

            const response = await communityService.getCommunityPosts(currentFilters);

            if (response.success) {
                const newPosts = response.data.posts || [];

                if (loadMore) {
                    setPosts(prev => [...prev, ...newPosts]);
                    setFilters(prev => ({ ...prev, page: prev.page + 1 }));
                } else {
                    setPosts(newPosts);
                    setFilters(prev => ({ ...prev, page: 1 }));
                }

                setHasMorePosts(newPosts.length === filters.limit);
            } else {
                setError('Failed to load community posts');
            }
        } catch (err) {
            console.error('Error fetching posts:', err);
            setError('Failed to load community posts. Please try again.');
        } finally {
            setIsLoading(false);
            setIsRefreshing(false);
            setLoadingMore(false);
        }
    }, [filters]);

    // Fetch community statistics
    const fetchCommunityStats = useCallback(async () => {
        try {
            const response = await communityService.getCommunityStats();
            if (response.success) {
                setCommunityStats(response.data);
            }
        } catch (error) {
            console.error('Error fetching community stats:', error);
        }
    }, []);

    // Initial load
    useEffect(() => {
        fetchPosts();
        fetchCommunityStats();
    }, []);

    // Refresh when filters change
    useEffect(() => {
        if (filters.sort || filters.category || filters.semester || filters.search) {
            fetchPosts();
        }
    }, [filters.sort, filters.category, filters.semester, filters.search]);

    // Handle creating a new post
    const handleCreatePost = async (postData) => {
        try {
            const response = await communityService.createCommunityPost(postData);
            if (response.success) {
                // Add the new post to the beginning of the list
                setPosts(prev => [response.data.post, ...prev]);
                setShowCreatePost(false);

                // Update stats
                setCommunityStats(prev => ({
                    ...prev,
                    totalPosts: prev.totalPosts + 1,
                    postsToday: prev.postsToday + 1
                }));
            }
        } catch (err) {
            console.error('Error creating post:', err);
            throw err;
        }
    };

    // Handle voting on posts
    const handleVote = async (postId, voteType) => {
        try {
            const response = await communityService.voteOnPost(postId, voteType);
            if (response.success) {
                setPosts(prev => prev.map(post =>
                    post._id === postId
                        ? { ...post, ...response.data.post }
                        : post
                ));
            }
        } catch (err) {
            console.error('Error voting on post:', err);
            toast.error('Failed to vote on post. Please try again.');
        }
    };

    // Handle replying to posts
    const handleReply = async (postId, content) => {
        try {
            const response = await communityService.replyToPost(postId, content);
            if (response.success) {
                // The backend returns the entire updated post, so we replace the post
                setPosts(prev => prev.map(post =>
                    post._id === postId
                        ? { ...response.data.post }
                        : post
                ));
            }
        } catch (err) {
            console.error('Error replying to post:', err);
            // Show user-friendly error message
            toast.error('Failed to add reply. Please try again.');
        }
    };

    // Handle deleting posts
    const handleDeletePost = async (postId) => {
        try {
            const response = await communityService.deletePost(postId);
            if (response.success) {
                setPosts(prev => prev.filter(post => post._id !== postId));
                setCommunityStats(prev => ({
                    ...prev,
                    totalPosts: Math.max(0, prev.totalPosts - 1)
                }));
                toast.success('Post deleted successfully');
            }
        } catch (err) {
            console.error('Error deleting post:', err);
            toast.error('Failed to delete post. Please try again.');
        }
    };

    // Handle filter changes
    const handleFilterChange = (newFilters) => {
        setFilters(prev => ({ ...prev, ...newFilters, page: 1 }));
    };

    // Handle search
    const handleSearch = (searchQuery) => {
        setFilters(prev => ({ ...prev, search: searchQuery, page: 1 }));
    };

    // Load more posts
    const handleLoadMore = () => {
        if (!loadingMore && hasMorePosts) {
            fetchPosts(false, true);
        }
    };

    if (isLoading && posts.length === 0) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-3 sm:py-6">
                <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8">
                    <div className="flex items-center justify-center min-h-[60vh]">
                        <LoadingSpinner />
                    </div>
                </div>
            </div>
        );
    }

    if (error && posts.length === 0) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-orange-50 py-3 sm:py-6">
                <div className="max-w-4xl mx-auto px-3 sm:px-4 lg:px-8">
                    <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg border border-red-100 p-6 sm:p-8 text-center">
                        <AlertCircle className="w-12 h-12 sm:w-16 sm:h-16 text-red-500 mx-auto mb-3 sm:mb-4" />
                        <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">
                            Unable to Load Community
                        </h2>
                        <p className="text-red-600 mb-4 sm:mb-6 text-sm sm:text-base px-2">{error}</p>
                        <button
                            onClick={() => fetchPosts(true)}
                            className="w-full sm:w-auto px-4 sm:px-6 py-2 sm:py-3 bg-red-600 text-white rounded-lg sm:rounded-xl hover:bg-red-700 transition-colors text-sm sm:text-base"
                        >
                            Try Again
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-3 sm:py-6">
            <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8">
                {/* Header */}
                <div className="mb-6 sm:mb-8">
                    <div className="bg-white rounded-xl sm:rounded-2xl shadow-sm p-4 sm:p-6 border border-gray-100">
                        <div className="flex flex-col space-y-4 sm:space-y-0 sm:flex-row sm:items-center justify-between">
                            <div>
                                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 flex items-center">
                                    <MessageSquare className="w-6 h-6 sm:w-8 sm:h-8 mr-2 sm:mr-3 text-blue-600" />
                                    Community
                                </h1>
                                <p className="text-gray-600 mt-1 sm:mt-2 text-sm sm:text-base">
                                    Connect, discuss, and learn together with your fellow students
                                </p>
                            </div>
                            <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3">
                                <button
                                    onClick={() => fetchPosts(true)}
                                    disabled={isRefreshing}
                                    className="flex items-center justify-center px-3 sm:px-4 py-2 bg-blue-600 text-white rounded-lg sm:rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-50 text-sm sm:text-base"
                                >
                                    <RefreshCw className={`w-4 h-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
                                    Refresh
                                </button>
                                {user && (
                                    <button
                                        onClick={() => setShowCreatePost(true)}
                                        className="flex items-center justify-center px-3 sm:px-4 py-2 bg-green-600 text-white rounded-lg sm:rounded-xl hover:bg-green-700 transition-colors text-sm sm:text-base"
                                    >
                                        <Plus className="w-4 h-4 mr-2" />
                                        New Post
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Community Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-6 mb-6 sm:mb-8">
                    <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-lg sm:rounded-xl p-3 sm:p-6">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                            <div className="mb-2 sm:mb-0">
                                <p className="text-blue-100 text-xs sm:text-sm">Total Posts</p>
                                <p className="text-lg sm:text-2xl font-bold">{communityStats.totalPosts}</p>
                            </div>
                            <MessageSquare className="w-5 h-5 sm:w-8 sm:h-8 text-blue-200 self-end sm:self-auto" />
                        </div>
                    </div>

                    <div className="bg-gradient-to-br from-green-500 to-green-600 text-white rounded-lg sm:rounded-xl p-3 sm:p-6">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                            <div className="mb-2 sm:mb-0">
                                <p className="text-green-100 text-xs sm:text-sm">Active Members</p>
                                <p className="text-lg sm:text-2xl font-bold">{communityStats.totalUsers}</p>
                            </div>
                            <Users className="w-5 h-5 sm:w-8 sm:h-8 text-green-200 self-end sm:self-auto" />
                        </div>
                    </div>

                    <div className="bg-gradient-to-br from-purple-500 to-purple-600 text-white rounded-lg sm:rounded-xl p-3 sm:p-6">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                            <div className="mb-2 sm:mb-0">
                                <p className="text-purple-100 text-xs sm:text-sm">Posts Today</p>
                                <p className="text-lg sm:text-2xl font-bold">{communityStats.postsToday}</p>
                            </div>
                            <Clock className="w-5 h-5 sm:w-8 sm:h-8 text-purple-200 self-end sm:self-auto" />
                        </div>
                    </div>

                    <div className="bg-gradient-to-br from-orange-500 to-orange-600 text-white rounded-lg sm:rounded-xl p-3 sm:p-6">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                            <div className="mb-2 sm:mb-0">
                                <p className="text-orange-100 text-xs sm:text-sm">Hot Discussions</p>
                                <p className="text-lg sm:text-2xl font-bold">{communityStats.activeDiscussions}</p>
                            </div>
                            <TrendingUp className="w-5 h-5 sm:w-8 sm:h-8 text-orange-200 self-end sm:self-auto" />
                        </div>
                    </div>
                </div>

                {/* Main Content */}
                <div className="flex flex-col lg:grid lg:grid-cols-4 gap-4 sm:gap-8">
                    {/* Filters Sidebar */}
                    <div className="lg:col-span-1 order-2 lg:order-1">
                        <CommunityFilters
                            filters={filters}
                            onFilterChange={handleFilterChange}
                            onSearch={handleSearch}
                            totalPosts={posts.length}
                        />
                    </div>

                    {/* Posts Feed */}
                    <div className="lg:col-span-3 order-1 lg:order-2">
                        <div className="space-y-4 sm:space-y-6">
                            {/* Quick Create Post (if user is logged in) */}
                            {user && !showCreatePost && (
                                <div
                                    onClick={() => setShowCreatePost(true)}
                                    className="bg-white rounded-lg sm:rounded-xl border border-gray-200 p-3 sm:p-4 cursor-pointer hover:bg-gray-50 transition-colors"
                                >
                                    <div className="flex items-center space-x-2 sm:space-x-3">
                                        <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold text-sm sm:text-base">
                                            {user.name?.charAt(0).toUpperCase() || 'U'}
                                        </div>
                                        <div className="flex-1 text-gray-500 text-sm sm:text-base">
                                            What's on your mind? Share with the community...
                                        </div>
                                        <Plus className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
                                    </div>
                                </div>
                            )}

                            {/* Posts List */}
                            {posts.length > 0 ? (
                                <>
                                    {posts.map((post) => (
                                        <PostCard
                                            key={post._id}
                                            post={post}
                                            onVote={handleVote}
                                            onReply={handleReply}
                                            onDelete={handleDeletePost}
                                        />
                                    ))}

                                    {/* Load More Button */}
                                    {hasMorePosts && (
                                        <div className="text-center pt-2">
                                            <button
                                                onClick={handleLoadMore}
                                                disabled={loadingMore}
                                                className="w-full sm:w-auto px-4 sm:px-6 py-2 sm:py-3 bg-blue-600 text-white rounded-lg sm:rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-50 text-sm sm:text-base"
                                            >
                                                {loadingMore ? (
                                                    <>
                                                        <RefreshCw className="w-4 h-4 mr-2 animate-spin inline" />
                                                        Loading...
                                                    </>
                                                ) : (
                                                    'Load More Posts'
                                                )}
                                            </button>
                                        </div>
                                    )}
                                </>
                            ) : (
                                <div className="bg-white rounded-lg sm:rounded-xl shadow-sm border border-gray-100 p-6 sm:p-12 text-center">
                                    <MessageSquare className="w-12 h-12 sm:w-16 sm:h-16 text-gray-300 mx-auto mb-3 sm:mb-4" />
                                    <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">
                                        No posts found
                                    </h3>
                                    <p className="text-gray-500 mb-4 sm:mb-6 text-sm sm:text-base px-2">
                                        {filters.search || filters.category || filters.semester
                                            ? 'Try adjusting your filters to see more posts.'
                                            : 'Be the first to start a discussion in the community!'
                                        }
                                    </p>
                                    {user && (
                                        <button
                                            onClick={() => setShowCreatePost(true)}
                                            className="w-full sm:w-auto px-4 sm:px-6 py-2 sm:py-3 bg-blue-600 text-white rounded-lg sm:rounded-xl hover:bg-blue-700 transition-colors text-sm sm:text-base"
                                        >
                                            Create First Post
                                        </button>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Create Post Modal */}
            {showCreatePost && (
                <CreatePost
                    onCreatePost={handleCreatePost}
                    onClose={() => setShowCreatePost(false)}
                    isModal={true}
                />
            )}
        </div>
    );
};

export default Community;