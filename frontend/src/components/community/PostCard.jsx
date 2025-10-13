import { useState } from 'react';
import {
    MessageSquare,
    ThumbsUp,
    ThumbsDown,
    Reply,
    Clock,
    User,
    ChevronUp,
    ChevronDown,
    MoreVertical,
    Flag,
    Trash2
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { communityService } from '../../services/communityService';

const PostCard = ({
    post,
    onVote,
    onReply,
    onDelete,
    showReplies = true,
    compact = false
}) => {
    const { user } = useAuth();
    const [isExpanded, setIsExpanded] = useState(false);
    const [showReplyForm, setShowReplyForm] = useState(false);
    const [replyContent, setReplyContent] = useState('');
    const [isVoting, setIsVoting] = useState(false);
    const [isReplying, setIsReplying] = useState(false);
    const [showDropdown, setShowDropdown] = useState(false);

    // Helper functions
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

    const handleVote = async (voteType) => {
        if (!user || isVoting) return;

        setIsVoting(true);
        try {
            await onVote(post._id, voteType);
        } catch (error) {
            console.error('Error voting:', error);
            // Error handling is done in the parent component (Community.jsx)
        } finally {
            setIsVoting(false);
        }
    };

    const handleReply = async (e) => {
        e.preventDefault();
        if (!replyContent.trim() || isReplying) return;

        setIsReplying(true);
        try {
            await onReply(post._id, replyContent);
            setReplyContent('');
            setShowReplyForm(false);
        } catch (error) {
            console.error('Error replying:', error);
            // Error handling is done in the parent component (Community.jsx)
        } finally {
            setIsReplying(false);
        }
    };

    const handleDelete = async () => {
        if (window.confirm('Are you sure you want to delete this post?')) {
            await onDelete(post._id);
        }
        setShowDropdown(false);
    };

    const handleReport = async () => {
        const reason = prompt('Please specify the reason for reporting this post:');
        if (reason) {
            try {
                await communityService.reportPost(post._id, reason);
                alert('Post reported successfully. Thank you for helping keep our community safe.');
            } catch (error) {
                console.error('Error reporting post:', error);
            }
        }
        setShowDropdown(false);
    };

    const userVote = post.userVote; // Assuming backend provides this
    const netVotes = (post.upvotes?.length || 0) - (post.downvotes?.length || 0);
    const isOwner = user && post.author?._id === user.id;

    return (
        <div className={`bg-white rounded-lg sm:rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-all duration-200 ${compact ? 'p-3 sm:p-4' : 'p-4 sm:p-6'}`}>
            {/* Post Header */}
            <div className="flex items-start justify-between mb-3 sm:mb-4">
                <div className="flex items-center space-x-2 sm:space-x-3 flex-1 min-w-0">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold text-sm sm:text-base flex-shrink-0">
                        {post.author?.name?.charAt(0).toUpperCase() || 'A'}
                    </div>
                    <div className="min-w-0 flex-1">
                        <h4 className="font-semibold text-gray-900 text-sm sm:text-base truncate">
                            {post.author?.name || 'Anonymous'}
                        </h4>
                        <div className="flex items-center text-xs sm:text-sm text-gray-500 space-x-2">
                            <Clock className="w-3 h-3 flex-shrink-0" />
                            <span className="truncate">{getTimeAgo(post.createdAt)}</span>
                            {post.semester && post.semester !== 'general' && (
                                <>
                                    <span className="hidden sm:inline">•</span>
                                    <span className="bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full text-xs flex-shrink-0">
                                        Sem {post.semester}
                                    </span>
                                </>
                            )}
                        </div>
                    </div>
                </div>

                {/* More Options */}
                <div className="relative flex-shrink-0">
                    <button
                        onClick={() => setShowDropdown(!showDropdown)}
                        className="p-1 sm:p-1.5 rounded-full hover:bg-gray-100 transition-colors"
                    >
                        <MoreVertical className="w-3 h-3 sm:w-4 sm:h-4 text-gray-500" />
                    </button>

                    {showDropdown && (
                        <div className="absolute right-0 top-8 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-10 min-w-[120px]">
                            {isOwner ? (
                                <button
                                    onClick={handleDelete}
                                    className="w-full text-left px-3 sm:px-4 py-2 text-xs sm:text-sm text-red-600 hover:bg-red-50 flex items-center"
                                >
                                    <Trash2 className="w-3 h-3 mr-2" />
                                    Delete
                                </button>
                            ) : (
                                <button
                                    onClick={handleReport}
                                    className="w-full text-left px-3 sm:px-4 py-2 text-xs sm:text-sm text-gray-700 hover:bg-gray-50 flex items-center"
                                >
                                    <Flag className="w-3 h-3 mr-2" />
                                    Report
                                </button>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* Post Content */}
            <div className="mb-3 sm:mb-4">
                <p className={`text-gray-800 ${compact ? 'text-xs sm:text-sm' : 'text-sm sm:text-base'} ${!isExpanded && post.content.length > 300 ? 'line-clamp-3' : ''}`}>
                    {post.content}
                </p>
                {post.content.length > 300 && (
                    <button
                        onClick={() => setIsExpanded(!isExpanded)}
                        className="text-blue-600 hover:text-blue-700 text-xs sm:text-sm mt-2"
                    >
                        {isExpanded ? 'Show less' : 'Show more'}
                    </button>
                )}
            </div>

            {/* Post Tags */}
            {post.tags && post.tags.length > 0 && (
                <div className="flex flex-wrap gap-1 sm:gap-2 mb-3 sm:mb-4">
                    {post.tags.map((tag, index) => (
                        <span
                            key={index}
                            className="bg-gray-100 text-gray-700 px-2 py-0.5 sm:py-1 rounded-full text-xs"
                        >
                            #{tag}
                        </span>
                    ))}
                </div>
            )}

            {/* Post Actions */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pt-3 sm:pt-4 border-t border-gray-100 space-y-2 sm:space-y-0">
                <div className="flex items-center space-x-2 sm:space-x-4">
                    {/* Voting */}
                    <div className="flex items-center space-x-1">
                        <button
                            onClick={() => handleVote('upvote')}
                            disabled={!user || isVoting}
                            className={`p-1.5 sm:p-2 rounded-full transition-colors ${userVote === 'upvote'
                                ? 'bg-green-100 text-green-600'
                                : 'hover:bg-gray-100 text-gray-600'
                                } ${!user ? 'cursor-not-allowed opacity-50' : ''}`}
                        >
                            <ChevronUp className="w-3 h-3 sm:w-4 sm:h-4" />
                        </button>
                        <span className={`font-medium text-xs sm:text-sm ${netVotes > 0 ? 'text-green-600' :
                            netVotes < 0 ? 'text-red-600' : 'text-gray-600'
                            }`}>
                            {netVotes}
                        </span>
                        <button
                            onClick={() => handleVote('downvote')}
                            disabled={!user || isVoting}
                            className={`p-1.5 sm:p-2 rounded-full transition-colors ${userVote === 'downvote'
                                ? 'bg-red-100 text-red-600'
                                : 'hover:bg-gray-100 text-gray-600'
                                } ${!user ? 'cursor-not-allowed opacity-50' : ''}`}
                        >
                            <ChevronDown className="w-3 h-3 sm:w-4 sm:h-4" />
                        </button>
                    </div>

                    {/* Reply */}
                    <button
                        onClick={() => setShowReplyForm(!showReplyForm)}
                        disabled={!user}
                        className={`flex items-center space-x-1 px-2 sm:px-3 py-1.5 sm:py-2 rounded-full transition-colors ${!user
                            ? 'cursor-not-allowed opacity-50 text-gray-400'
                            : 'hover:bg-gray-100 text-gray-600'
                            }`}
                    >
                        <Reply className="w-3 h-3 sm:w-4 sm:h-4" />
                        <span className="text-xs sm:text-sm">Reply</span>
                    </button>
                </div>

                {/* Reply Count */}
                <div className="flex items-center space-x-1 text-gray-500">
                    <MessageSquare className="w-3 h-3 sm:w-4 sm:h-4" />
                    <span className="text-xs sm:text-sm">{post.replies?.length || 0} replies</span>
                </div>
            </div>

            {/* Reply Form */}
            {showReplyForm && user && (
                <form onSubmit={handleReply} className="mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-gray-100">
                    <div className="flex space-x-2 sm:space-x-3">
                        <div className="w-6 h-6 sm:w-8 sm:h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-xs sm:text-sm font-semibold flex-shrink-0">
                            {user.name?.charAt(0).toUpperCase() || 'U'}
                        </div>
                        <div className="flex-1">
                            <textarea
                                value={replyContent}
                                onChange={(e) => setReplyContent(e.target.value)}
                                placeholder="Write your reply..."
                                className="w-full p-2 sm:p-3 text-sm sm:text-base border border-gray-200 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                rows="3"
                                required
                            />
                            <div className="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-2 mt-2">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowReplyForm(false);
                                        setReplyContent('');
                                    }}
                                    className="px-3 sm:px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors text-sm sm:text-base order-2 sm:order-1"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={isReplying || !replyContent.trim()}
                                    className="px-3 sm:px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 text-sm sm:text-base order-1 sm:order-2"
                                >
                                    {isReplying ? 'Posting...' : 'Reply'}
                                </button>
                            </div>
                        </div>
                    </div>
                </form>
            )}

            {/* Replies */}
            {showReplies && post.replies && post.replies.length > 0 && (
                <div className="mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-gray-100 space-y-3 sm:space-y-4">
                    {post.replies.slice(0, 3).map((reply) => (
                        <div key={reply._id} className="flex space-x-2 sm:space-x-3">
                            <div className="w-6 h-6 sm:w-8 sm:h-8 bg-gray-200 rounded-full flex items-center justify-center text-gray-600 text-xs sm:text-sm font-semibold flex-shrink-0">
                                {reply.author?.name?.charAt(0).toUpperCase() || 'A'}
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="bg-gray-50 rounded-lg p-2 sm:p-3">
                                    <div className="flex items-center justify-between mb-1">
                                        <span className="font-semibold text-xs sm:text-sm text-gray-900 truncate">
                                            {reply.author?.name || 'Anonymous'}
                                        </span>
                                        <span className="text-xs text-gray-500 flex-shrink-0 ml-2">
                                            {getTimeAgo(reply.createdAt)}
                                        </span>
                                    </div>
                                    <p className="text-xs sm:text-sm text-gray-800">{reply.content}</p>
                                </div>
                            </div>
                        </div>
                    ))}

                    {post.replies.length > 3 && (
                        <button className="text-blue-600 hover:text-blue-700 text-xs sm:text-sm font-medium">
                            View all {post.replies.length} replies
                        </button>
                    )}
                </div>
            )}
        </div>
    );
};

export default PostCard;