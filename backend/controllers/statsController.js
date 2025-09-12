import User from '../models/User.js';
import Note from '../models/Note.js';
import Post from '../models/Post.js';
import Notification from '../models/Notification.js';

// @desc    Get dashboard stats
// @route   GET /api/stats/dashboard
// @access  Private
export const getDashboardStats = async (req, res) => {
    try {
        const userId = req.user.id;

        // Get user's stats
        const userStats = await User.findById(userId).select('notesUploaded likesReceived');

        if (!userStats) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // Get user's notes stats
        const userNotes = await Note.find({ uploader: userId });

        const totalDownloads = userNotes.reduce((sum, note) => sum + (note.downloads || 0), 0);
        const totalLikes = userNotes.reduce((sum, note) => {
            const likesArray = note.likes || [];
            return sum + likesArray.length;
        }, 0);

        // Get recent activities
        const recentNotes = await Note.find({ uploader: userId })
            .sort({ createdAt: -1 })
            .limit(5)
            .select('title createdAt likes downloads');

        const recentPosts = await Post.find({ author: userId })
            .sort({ createdAt: -1 })
            .limit(5)
            .select('content createdAt upvotes replies');

        // Get notifications count
        const unreadNotifications = await Notification.countDocuments({
            recipient: userId,
            isRead: false
        });

        res.json({
            success: true,
            data: {
                stats: {
                    notesUploaded: userStats.notesUploaded || 0,
                    totalDownloads,
                    totalLikes,
                    unreadNotifications
                },
                recentActivity: {
                    notes: recentNotes,
                    posts: recentPosts
                }
            }
        });
    } catch (error) {
        console.error('Get dashboard stats error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get dashboard stats',
            error: error.message
        });
    }
};

// @desc    Get leaderboard
// @route   GET /api/stats/leaderboard
// @access  Public
export const getLeaderboard = async (req, res) => {
    try {
        // Top contributors by notes uploaded
        const topUploaders = await User.find({ isActive: true })
            .sort({ notesUploaded: -1 })
            .limit(10)
            .select('name semester notesUploaded profilePicture');

        // Top notes by likes
        const topNotes = await Note.find({ isApproved: true })
            .populate('uploader', 'name semester')
            .sort({ likes: -1 })
            .limit(10)
            .select('title subject semester likes downloads uploader');

        // Most active in community (posts + replies)
        const communityStats = await Post.aggregate([
            {
                $group: {
                    _id: '$author',
                    postsCount: { $sum: 1 },
                    repliesCount: { $sum: { $size: '$replies' } }
                }
            },
            {
                $addFields: {
                    totalActivity: { $add: ['$postsCount', '$repliesCount'] }
                }
            },
            { $sort: { totalActivity: -1 } },
            { $limit: 10 }
        ]);

        // Populate user details for community stats
        const communityLeaders = await User.populate(communityStats, {
            path: '_id',
            select: 'name semester profilePicture'
        });

        res.json({
            success: true,
            data: {
                topUploaders,
                topNotes,
                communityLeaders: communityLeaders.map(item => ({
                    user: item._id,
                    postsCount: item.postsCount,
                    repliesCount: item.repliesCount,
                    totalActivity: item.totalActivity
                }))
            }
        });
    } catch (error) {
        console.error('Get leaderboard error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get leaderboard',
            error: error.message
        });
    }
};

// @desc    Get general stats
// @route   GET /api/stats/general
// @access  Public
export const getGeneralStats = async (req, res) => {
    try {
        const totalUsers = await User.countDocuments({ isActive: true });
        const totalNotes = await Note.countDocuments({ isApproved: true });
        const totalPosts = await Post.countDocuments();
        const totalDownloads = await Note.aggregate([
            { $group: { _id: null, total: { $sum: '$downloads' } } }
        ]);

        // Notes by semester
        const notesBySemester = await Note.aggregate([
            { $match: { isApproved: true } },
            { $group: { _id: '$semester', count: { $sum: 1 } } },
            { $sort: { _id: 1 } }
        ]);

        // Recent activity (last 7 days)
        const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
        const recentActivity = {
            newUsers: await User.countDocuments({
                createdAt: { $gte: sevenDaysAgo },
                isActive: true
            }),
            newNotes: await Note.countDocuments({
                createdAt: { $gte: sevenDaysAgo },
                isApproved: true
            }),
            newPosts: await Post.countDocuments({
                createdAt: { $gte: sevenDaysAgo }
            })
        };

        res.json({
            success: true,
            data: {
                overview: {
                    totalUsers,
                    totalNotes,
                    totalPosts,
                    totalDownloads: totalDownloads[0]?.total || 0
                },
                notesBySemester,
                recentActivity
            }
        });
    } catch (error) {
        console.error('Get general stats error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get general stats',
            error: error.message
        });
    }
};
