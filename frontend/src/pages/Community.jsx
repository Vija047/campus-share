import React, { useState, useEffect, useCallback } from 'react';
import { postService } from '../services/postService.js';
import { useAuth } from '../hooks/useAuth.js';
import {
    MessageSquare,
    ThumbsUp,
    ThumbsDown,
    Reply,
    Send,
    Filter,
    Calendar,
    User,
    Hash,
    ChevronDown,
    Plus,
    Edit3,
    MoreHorizontal,
    RefreshCw
} from 'lucide-react';
import LoadingSpinner from '../components/common/LoadingSpinner.jsx';
import Button from '../components/common/Button.jsx';
import Textarea from '../components/common/Textarea.jsx';
import Modal from '../components/common/Modal.jsx';
import toast from 'react-hot-toast';

const Community = () => {
    const { user } = useAuth();
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState({
        semester: 'all',
        sortBy: 'createdAt'
    });
    const [pagination, setPagination] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [showCreatePost, setShowCreatePost] = useState(false);
    const [replyingTo, setReplyingTo] = useState(null);
    const [newPost, setNewPost] = useState({
        content: '',
        semester: '',
        tags: ''
    });
    const [replyContent, setReplyContent] = useState('');
    const [showReplies, setShowReplies] = useState({});
    const [votingPost, setVotingPost] = useState(null);
    const [replyingInProgress, setReplyingInProgress] = useState(false);

    const fetchPosts = useCallback(async (page = 1) => {
        try {
            setLoading(true);
            const queryParams = {
                page,
                limit: 10,
                ...filters
            };

            const response = await postService.getPosts(queryParams);
            console.log('Posts response:', response); // Debug log
            if (response.success) {
                setPosts(response.data.posts);
                setPagination(response.data.pagination);
            } else {
                throw new Error(response.message || 'Failed to fetch posts');
            }
        } catch (error) {
            console.error('Error fetching posts:', error);
            toast.error('Failed to fetch posts');
        } finally {
            setLoading(false);
        }
    }, [filters]);

    useEffect(() => {
        fetchPosts(currentPage);
    }, [currentPage, fetchPosts]);

    // Set default semester when user data is available
    useEffect(() => {
        if (user && user.semester && !newPost.semester) {
            setNewPost(prev => ({ ...prev, semester: user.semester }));
        }
    }, [user, newPost.semester]);

    // Auto-refresh posts every 30 seconds
    useEffect(() => {
        const interval = setInterval(() => {
            if (!loading && !replyingInProgress && !votingPost) {
                fetchPosts(currentPage);
            }
        }, 30000);

        return () => clearInterval(interval);
    }, [currentPage, fetchPosts, loading, replyingInProgress, votingPost]);

    const handleCreatePost = async (e) => {
        e.preventDefault();

        if (!newPost.content.trim()) {
            toast.error('Please enter post content');
            return;
        }

        try {
            const postData = {
                content: newPost.content.trim(),
                semester: newPost.semester,
                tags: newPost.tags.trim()
            };

            const response = await postService.createPost(postData);
            console.log('Create post response:', response); // Debug log

            if (response.success) {
                toast.success('Post created successfully!');
                setShowCreatePost(false);
                setNewPost({ content: '', semester: '', tags: '' });
                fetchPosts(1);
                setCurrentPage(1);
            } else {
                throw new Error(response.message || 'Failed to create post');
            }
        } catch (error) {
            console.error('Create post error:', error);
            toast.error(error.response?.data?.message || 'Failed to create post');
        }
    };

    const handleVote = async (postId, voteType) => {
        if (votingPost === postId) return; // Prevent double voting

        try {
            setVotingPost(postId);
            const response = await postService.toggleVote(postId, voteType);
            console.log('Vote response:', response); // Debug log

            if (response.success) {
                // Update the posts list with new vote data
                setPosts(posts.map(post =>
                    post._id === postId
                        ? {
                            ...post,
                            upvotes: response.data.upvotes || [],
                            downvotes: response.data.downvotes || []
                        }
                        : post
                ));
            } else {
                throw new Error(response.message || 'Failed to vote');
            }
        } catch (error) {
            console.error('Error voting:', error);
            toast.error('Failed to vote');
        } finally {
            setVotingPost(null);
        }
    };

    const handleReply = async (postId) => {
        if (!replyContent.trim()) {
            toast.error('Please enter reply content');
            return;
        }

        try {
            setReplyingInProgress(true);
            const response = await postService.addReply(postId, replyContent.trim());
            console.log('Reply response:', response); // Debug log

            if (response.success) {
                toast.success('Reply added successfully!');
                setReplyingTo(null);
                setReplyContent('');
                fetchPosts(currentPage);
            } else {
                throw new Error(response.message || 'Failed to add reply');
            }
        } catch (error) {
            console.error('Reply error:', error);
            toast.error(error.response?.data?.message || 'Failed to add reply');
        } finally {
            setReplyingInProgress(false);
        }
    };

    const formatDate = (date) => {
        const now = new Date();
        const postDate = new Date(date);
        const diffTime = Math.abs(now - postDate);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays === 1) return 'Yesterday';
        if (diffDays < 7) return `${diffDays} days ago`;
        return postDate.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    const getUserVote = (post) => {
        if (post.upvotes?.some(vote => vote.user === user?.id || vote.user?._id === user?.id)) return 'upvote';
        if (post.downvotes?.some(vote => vote.user === user?.id || vote.user?._id === user?.id)) return 'downvote';
        return null;
    };

    if (loading && !posts.length) {
        return <LoadingSpinner text="Loading community posts..." />;
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 mb-2">Community</h1>
                        <p className="text-gray-600">Connect and discuss with your fellow students</p>
                    </div>
                    <div className="flex items-center space-x-3">
                        <Button
                            variant="outline"
                            onClick={() => fetchPosts(currentPage)}
                            icon={RefreshCw}
                            size="sm"
                        >
                            Refresh
                        </Button>
                        <Button
                            variant="primary"
                            onClick={() => setShowCreatePost(true)}
                            icon={Plus}
                        >
                            New Post
                        </Button>
                    </div>
                </div>

                {/* Filters */}
                <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                            <select
                                value={filters.semester}
                                onChange={(e) => setFilters({ ...filters, semester: e.target.value })}
                                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="all">All Semesters</option>
                                <option value="1">Semester 1</option>
                                <option value="2">Semester 2</option>
                                <option value="3">Semester 3</option>
                                <option value="4">Semester 4</option>
                                <option value="5">Semester 5</option>
                                <option value="6">Semester 6</option>
                                <option value="7">Semester 7</option>
                                <option value="8">Semester 8</option>
                            </select>

                            <select
                                value={filters.sortBy}
                                onChange={(e) => setFilters({ ...filters, sortBy: e.target.value })}
                                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="createdAt">Latest</option>
                                <option value="upvotes">Most Upvoted</option>
                                <option value="replies">Most Replies</option>
                            </select>
                        </div>

                        <span className="text-sm text-gray-600">
                            {pagination?.totalPosts || 0} posts
                            {loading && <span className="ml-2 text-blue-500">• Refreshing...</span>}
                        </span>
                    </div>
                </div>

                {/* Posts List */}
                {loading ? (
                    <LoadingSpinner text="Loading posts..." />
                ) : posts.length === 0 ? (
                    <div className="text-center py-12">
                        <MessageSquare className="mx-auto w-12 h-12 text-gray-400 mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">No posts yet</h3>
                        <p className="text-gray-600 mb-4">Be the first to start a discussion!</p>
                        <Button
                            variant="primary"
                            onClick={() => setShowCreatePost(true)}
                            icon={Plus}
                        >
                            Create First Post
                        </Button>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {posts.map((post) => (
                            <div key={post._id} className="bg-white rounded-lg shadow-sm border border-gray-200">
                                <div className="p-6">
                                    {/* Post Header */}
                                    <div className="flex items-start justify-between mb-4">
                                        <div className="flex items-center space-x-3">
                                            <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-medium">
                                                {post.author?.name?.charAt(0).toUpperCase()}
                                            </div>
                                            <div>
                                                <p className="font-medium text-gray-900">
                                                    {post.author?.name}
                                                </p>
                                                <div className="flex items-center text-sm text-gray-600 space-x-2">
                                                    <span className="flex items-center">
                                                        <Calendar className="w-4 h-4 mr-1" />
                                                        Sem {post.semester}
                                                    </span>
                                                    <span>•</span>
                                                    <span>{formatDate(post.createdAt)}</span>
                                                </div>
                                            </div>
                                        </div>
                                        <Button variant="ghost" size="sm" icon={MoreHorizontal}>
                                        </Button>
                                    </div>

                                    {/* Post Content */}
                                    <div className="mb-4">
                                        <p className="text-gray-800 whitespace-pre-wrap">
                                            {post.content}
                                        </p>
                                    </div>

                                    {/* Tags */}
                                    {post.tags && post.tags.length > 0 && (
                                        <div className="flex flex-wrap gap-2 mb-4">
                                            {post.tags.map((tag, index) => (
                                                <span key={index} className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded flex items-center">
                                                    <Hash className="w-3 h-3 mr-1" />
                                                    {tag}
                                                </span>
                                            ))}
                                        </div>
                                    )}

                                    {/* Post Actions */}
                                    <div className="flex items-center justify-between border-t border-gray-100 pt-4">
                                        <div className="flex items-center space-x-4">
                                            <Button
                                                variant={getUserVote(post) === 'upvote' ? "primary" : "ghost"}
                                                size="sm"
                                                onClick={() => handleVote(post._id, 'upvote')}
                                                icon={ThumbsUp}
                                                disabled={votingPost === post._id}
                                            >
                                                {post.upvotes?.length || 0}
                                            </Button>
                                            <Button
                                                variant={getUserVote(post) === 'downvote' ? "danger" : "ghost"}
                                                size="sm"
                                                onClick={() => handleVote(post._id, 'downvote')}
                                                icon={ThumbsDown}
                                                disabled={votingPost === post._id}
                                            >
                                                {post.downvotes?.length || 0}
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => setReplyingTo(replyingTo === post._id ? null : post._id)}
                                                icon={Reply}
                                            >
                                                Reply
                                            </Button>
                                        </div>
                                        <span className="text-sm text-gray-600">
                                            {post.replies?.length || 0} replies
                                        </span>
                                    </div>

                                    {/* Reply Form */}
                                    {replyingTo === post._id && (
                                        <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                                            <Textarea
                                                value={replyContent}
                                                onChange={(e) => setReplyContent(e.target.value)}
                                                placeholder="Write your reply..."
                                                rows={3}
                                                className="mb-3"
                                                onKeyDown={(e) => {
                                                    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
                                                        e.preventDefault();
                                                        handleReply(post._id);
                                                    }
                                                }}
                                            />
                                            <p className="text-xs text-gray-500 mb-3">
                                                Press Ctrl+Enter to reply quickly
                                            </p>
                                            <div className="flex items-center space-x-2">
                                                <Button
                                                    size="sm"
                                                    variant="primary"
                                                    onClick={() => handleReply(post._id)}
                                                    icon={Send}
                                                    disabled={replyingInProgress}
                                                >
                                                    {replyingInProgress ? 'Posting...' : 'Post Reply'}
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    onClick={() => {
                                                        setReplyingTo(null);
                                                        setReplyContent('');
                                                    }}
                                                >
                                                    Cancel
                                                </Button>
                                            </div>
                                        </div>
                                    )}

                                    {/* Replies */}
                                    {post.replies && post.replies.length > 0 && (
                                        <div className="mt-4 space-y-3">
                                            {(showReplies[post._id] ? post.replies : post.replies.slice(0, 3)).map((reply, index) => (
                                                <div key={index} className="pl-4 border-l-2 border-gray-200">
                                                    <div className="flex items-center space-x-2 mb-1">
                                                        <div className="w-6 h-6 bg-gray-400 rounded-full flex items-center justify-center text-white text-xs">
                                                            {reply.author?.name?.charAt(0).toUpperCase()}
                                                        </div>
                                                        <span className="text-sm font-medium text-gray-900">
                                                            {reply.author?.name}
                                                        </span>
                                                        <span className="text-xs text-gray-600">
                                                            {formatDate(reply.createdAt)}
                                                        </span>
                                                    </div>
                                                    <p className="text-sm text-gray-700 pl-8">
                                                        {reply.content}
                                                    </p>
                                                </div>
                                            ))}
                                            {post.replies.length > 3 && (
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className="ml-4"
                                                    onClick={() => setShowReplies(prev => ({
                                                        ...prev,
                                                        [post._id]: !prev[post._id]
                                                    }))}
                                                >
                                                    {showReplies[post._id]
                                                        ? 'Show less replies'
                                                        : `View ${post.replies.length - 3} more replies`
                                                    }
                                                </Button>
                                            )}
                                        </div>
                                    )}
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
                            disabled={currentPage <= 1}
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
                            disabled={currentPage >= pagination.totalPages}
                            onClick={() => setCurrentPage(currentPage + 1)}
                        >
                            Next
                        </Button>
                    </div>
                )}
            </div>

            {/* Create Post Modal */}
            <Modal
                isOpen={showCreatePost}
                onClose={() => {
                    setShowCreatePost(false);
                    setNewPost({ content: '', semester: user?.semester || '', tags: '' });
                }}
                title="Create New Post"
            >
                <form onSubmit={handleCreatePost} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Semester
                        </label>
                        <select
                            value={newPost.semester}
                            onChange={(e) => setNewPost({ ...newPost, semester: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="">Select Semester</option>
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
                            Content *
                        </label>
                        <Textarea
                            value={newPost.content}
                            onChange={(e) => setNewPost({ ...newPost, content: e.target.value })}
                            placeholder="What's on your mind? Ask questions, share insights, or start a discussion..."
                            rows={4}
                            required
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
                                    e.preventDefault();
                                    handleCreatePost(e);
                                }
                            }}
                        />
                        <p className="text-xs text-gray-500 mt-1">
                            Press Ctrl+Enter to post quickly
                        </p>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Tags
                        </label>
                        <input
                            type="text"
                            value={newPost.tags}
                            onChange={(e) => setNewPost({ ...newPost, tags: e.target.value })}
                            placeholder="e.g., study-tips, exam-prep, algorithms"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        />
                        <p className="text-xs text-gray-500 mt-1">
                            Separate multiple tags with commas
                        </p>
                    </div>

                    <div className="flex items-center justify-end space-x-3 pt-4">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => {
                                setShowCreatePost(false);
                                setNewPost({ content: '', semester: user?.semester || '', tags: '' });
                            }}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            variant="primary"
                            icon={Send}
                        >
                            Post
                        </Button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};

export default Community;
