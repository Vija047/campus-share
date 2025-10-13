import Post from '../models/Post.js';
import Notification from '../models/Notification.js';

// @desc    Create post
// @route   POST /api/posts
// @access  Private
export const createPost = async (req, res) => {
    try {
        const { content, semester, category, tags } = req.body;

        const post = await Post.create({
            content,
            author: req.user.id,
            semester: semester || req.user.semester || 'general',
            category: category || 'general',
            tags: Array.isArray(tags) ? tags : (tags ? tags.split(',').map(tag => tag.trim()) : [])
        });

        const populatedPost = await Post.findById(post._id)
            .populate('author', 'name profilePicture semester');

        res.status(201).json({
            success: true,
            message: 'Post created successfully',
            data: { post: populatedPost }
        });
    } catch (error) {
        console.error('Create post error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to create post',
            error: error.message
        });
    }
};

// @desc    Get posts
// @route   GET /api/posts
// @access  Public
export const getPosts = async (req, res) => {
    try {
        const {
            semester,
            category,
            search,
            page = 1,
            limit = 10,
            sort = 'createdAt',
            sortOrder = 'desc'
        } = req.query;

        // Build query
        const query = {};
        if (semester && semester !== 'all' && semester !== '') {
            query.semester = semester;
        }
        if (category && category !== '') {
            query.category = category;
        }
        if (search && search.trim()) {
            query.$or = [
                { content: { $regex: search.trim(), $options: 'i' } },
                { tags: { $in: [new RegExp(search.trim(), 'i')] } }
            ];
        }

        // Build sort object
        const sortOptions = {};
        const sortDirection = sortOrder === 'asc' ? 1 : -1;

        switch (sort) {
            case 'votes':
                // Sort by net votes (upvotes - downvotes)
                sortOptions.upvotesCount = sortDirection;
                break;
            case 'replies':
                sortOptions.repliesCount = sortDirection;
                break;
            case 'upvotes':
                sortOptions.upvotesCount = sortDirection;
                break;
            default:
                sortOptions.createdAt = sortDirection;
        }

        const posts = await Post.find(query)
            .populate('author', 'name profilePicture semester')
            .populate('replies.author', 'name profilePicture')
            .sort(sortOptions)
            .limit(limit * 1)
            .skip((page - 1) * limit)
            .exec();

        // Add user vote information if user is authenticated
        let postsWithUserVotes = posts;
        if (req.user) {
            postsWithUserVotes = posts.map(post => {
                const postObj = post.toObject();
                const userUpvoted = post.upvotes.some(vote => vote.user.toString() === req.user.id);
                const userDownvoted = post.downvotes.some(vote => vote.user.toString() === req.user.id);

                postObj.userVote = userUpvoted ? 'upvote' : userDownvoted ? 'downvote' : null;
                return postObj;
            });
        }

        const total = await Post.countDocuments(query);

        res.json({
            success: true,
            data: {
                posts: postsWithUserVotes,
                pagination: {
                    currentPage: parseInt(page),
                    totalPages: Math.ceil(total / limit),
                    totalPosts: total
                }
            }
        });
    } catch (error) {
        console.error('Get posts error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get posts',
            error: error.message
        });
    }
};

// @desc    Get single post
// @route   GET /api/posts/:id
// @access  Public
export const getPost = async (req, res) => {
    try {
        const post = await Post.findById(req.params.id)
            .populate('author', 'name profilePicture semester')
            .populate('replies.author', 'name profilePicture')
            .populate('upvotes.user', 'name')
            .populate('downvotes.user', 'name');

        if (!post) {
            return res.status(404).json({
                success: false,
                message: 'Post not found'
            });
        }

        res.json({
            success: true,
            data: { post }
        });
    } catch (error) {
        console.error('Get post error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get post',
            error: error.message
        });
    }
};

// @desc    Toggle upvote/downvote
// @route   POST /api/posts/:id/vote
// @access  Private
export const toggleVote = async (req, res) => {
    try {
        const { voteType } = req.body; // 'upvote' or 'downvote'
        const post = await Post.findById(req.params.id);

        if (!post) {
            return res.status(404).json({
                success: false,
                message: 'Post not found'
            });
        }

        const upvoteIndex = post.upvotes.findIndex(
            vote => vote.user.toString() === req.user.id
        );
        const downvoteIndex = post.downvotes.findIndex(
            vote => vote.user.toString() === req.user.id
        );

        // Remove existing votes
        if (upvoteIndex > -1) post.upvotes.splice(upvoteIndex, 1);
        if (downvoteIndex > -1) post.downvotes.splice(downvoteIndex, 1);

        // Add new vote if different from existing
        if (voteType === 'upvote' && upvoteIndex === -1) {
            post.upvotes.push({ user: req.user.id });

            // Create notification for post author
            if (post.author.toString() !== req.user.id) {
                await Notification.create({
                    recipient: post.author,
                    sender: req.user.id,
                    type: 'post_upvote',
                    title: 'Post Upvoted',
                    message: `${req.user.name} upvoted your post`,
                    data: {
                        postId: post._id
                    }
                });
            }
        } else if (voteType === 'downvote' && downvoteIndex === -1) {
            post.downvotes.push({ user: req.user.id });
        }

        await post.save();

        // Get updated post with populated data
        const updatedPost = await Post.findById(post._id)
            .populate('author', 'name profilePicture semester')
            .populate('upvotes.user', 'name')
            .populate('downvotes.user', 'name');

        res.json({
            success: true,
            message: 'Vote updated',
            data: {
                upvotes: updatedPost.upvotes,
                downvotes: updatedPost.downvotes,
                upvotesCount: updatedPost.upvotes.length,
                downvotesCount: updatedPost.downvotes.length,
                userVote: updatedPost.upvotes.some(vote => vote.user._id.toString() === req.user.id) ? 'upvote' :
                    updatedPost.downvotes.some(vote => vote.user._id.toString() === req.user.id) ? 'downvote' : null
            }
        });
    } catch (error) {
        console.error('Toggle vote error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update vote',
            error: error.message
        });
    }
};

// @desc    Add reply to post
// @route   POST /api/posts/:id/reply
// @access  Private
export const addReply = async (req, res) => {
    try {
        const { content } = req.body;
        const post = await Post.findById(req.params.id);

        if (!post) {
            return res.status(404).json({
                success: false,
                message: 'Post not found'
            });
        }

        const reply = {
            content,
            author: req.user.id,
            createdAt: new Date()
        };

        post.replies.push(reply);
        await post.save();

        // Create notification for post author
        if (post.author.toString() !== req.user.id) {
            await Notification.create({
                recipient: post.author,
                sender: req.user.id,
                type: 'post_reply',
                title: 'New Reply',
                message: `${req.user.name} replied to your post`,
                data: {
                    postId: post._id
                }
            });
        }

        const updatedPost = await Post.findById(req.params.id)
            .populate('author', 'name profilePicture')
            .populate('replies.author', 'name profilePicture');

        res.status(201).json({
            success: true,
            message: 'Reply added successfully',
            data: { post: updatedPost }
        });
    } catch (error) {
        console.error('Add reply error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to add reply',
            error: error.message
        });
    }
};

// @desc    Delete post
// @route   DELETE /api/posts/:id
// @access  Private
export const deletePost = async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);

        if (!post) {
            return res.status(404).json({
                success: false,
                message: 'Post not found'
            });
        }

        // Check if user is the author or admin
        if (post.author.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to delete this post'
            });
        }

        await Post.findByIdAndDelete(req.params.id);

        res.json({
            success: true,
            message: 'Post deleted successfully'
        });
    } catch (error) {
        console.error('Delete post error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to delete post',
            error: error.message
        });
    }
};

// @desc    Get community statistics
// @route   GET /api/posts/stats
// @access  Public
export const getCommunityStats = async (req, res) => {
    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const [totalPosts, postsToday, activeDiscussions] = await Promise.all([
            Post.countDocuments(),
            Post.countDocuments({ createdAt: { $gte: today } }),
            Post.countDocuments({ 'replies.0': { $exists: true } })
        ]);

        // Get unique authors count
        const uniqueAuthors = await Post.distinct('author');
        const totalUsers = uniqueAuthors.length;

        res.json({
            success: true,
            data: {
                totalPosts,
                totalUsers,
                postsToday,
                activeDiscussions
            }
        });
    } catch (error) {
        console.error('Get community stats error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get community stats',
            error: error.message
        });
    }
};
