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

        // Get user's stats with error handling
        const userStats = await User.findById(userId).select('notesUploaded likesReceived').lean();

        if (!userStats) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // Get user's notes stats with error handling
        const userNotes = await Note.find({ uploader: userId }).lean() || [];

        const totalDownloads = userNotes.reduce((sum, note) => {
            return sum + (note.downloads || 0);
        }, 0);

        const totalLikes = userNotes.reduce((sum, note) => {
            const likesArray = Array.isArray(note.likes) ? note.likes : [];
            return sum + likesArray.length;
        }, 0);

        // Get recent activities with error handling
        const recentNotes = await Note.find({ uploader: userId })
            .sort({ createdAt: -1 })
            .limit(5)
            .select('title createdAt likes downloads')
            .lean() || [];

        const recentPosts = await Post.find({ author: userId })
            .sort({ createdAt: -1 })
            .limit(5)
            .select('content createdAt upvotes replies')
            .lean() || [];

        // Get notifications count with error handling
        let unreadNotifications = 0;
        try {
            unreadNotifications = await Notification.countDocuments({
                recipient: userId,
                isRead: false
            });
        } catch (notificationError) {
            console.warn('Error counting notifications:', notificationError.message);
        }

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
            error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
        });
    }
};

// @desc    Get leaderboard
// @route   GET /api/stats/leaderboard
// @access  Public
export const getLeaderboard = async (req, res) => {
    try {
        // Top contributors by notes uploaded with error handling
        let topUploaders = [];
        try {
            topUploaders = await User.find({ isActive: true })
                .sort({ notesUploaded: -1 })
                .limit(10)
                .select('name semester notesUploaded profilePicture')
                .lean() || [];
        } catch (uploaderError) {
            console.warn('Error fetching top uploaders:', uploaderError.message);
        }

        // Top notes by likes with error handling
        let topNotes = [];
        try {
            const notes = await Note.find({ isApproved: true })
                .populate('uploader', 'name semester')
                .sort({ 'likes.length': -1 }) // Fix: sort by array length
                .limit(10)
                .select('title subject semester likes downloads uploader')
                .lean() || [];

            // Calculate likes count for each note
            topNotes = notes.map(note => ({
                ...note,
                likesCount: Array.isArray(note.likes) ? note.likes.length : 0
            }));
        } catch (notesError) {
            console.warn('Error fetching top notes:', notesError.message);
        }

        // Most active in community (posts + replies) with error handling
        let communityLeaders = [];
        try {
            const communityStats = await Post.aggregate([
                {
                    $group: {
                        _id: '$author',
                        postsCount: { $sum: 1 },
                        repliesCount: { $sum: { $size: { $ifNull: ['$replies', []] } } }
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
            const populatedStats = await User.populate(communityStats, {
                path: '_id',
                select: 'name semester profilePicture'
            });

            communityLeaders = populatedStats
                .filter(item => item._id) // Filter out null users
                .map(item => ({
                    user: item._id,
                    postsCount: item.postsCount || 0,
                    repliesCount: item.repliesCount || 0,
                    totalActivity: item.totalActivity || 0
                }));
        } catch (communityError) {
            console.warn('Error fetching community leaders:', communityError.message);
        }

        res.json({
            success: true,
            data: {
                topUploaders,
                topNotes,
                communityLeaders
            }
        });
    } catch (error) {
        console.error('Get leaderboard error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get leaderboard',
            error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
        });
    }
};

// @desc    Get general stats
// @route   GET /api/stats/general
// @access  Public
export const getGeneralStats = async (req, res) => {
    try {
        // Get counts with error handling
        let totalUsers = 0, totalNotes = 0, totalPosts = 0, totalDownloads = 0;

        try {
            totalUsers = await User.countDocuments({ isActive: true });
        } catch (error) {
            console.warn('Error counting users:', error.message);
        }

        try {
            totalNotes = await Note.countDocuments({ isApproved: true });
        } catch (error) {
            console.warn('Error counting notes:', error.message);
        }

        try {
            totalPosts = await Post.countDocuments();
        } catch (error) {
            console.warn('Error counting posts:', error.message);
        }

        // Get total downloads with error handling
        try {
            const downloadAggregation = await Note.aggregate([
                { $group: { _id: null, total: { $sum: { $ifNull: ['$downloads', 0] } } } }
            ]);
            totalDownloads = downloadAggregation[0]?.total || 0;
        } catch (error) {
            console.warn('Error calculating total downloads:', error.message);
        }

        // Notes by semester with error handling
        let notesBySemester = [];
        try {
            notesBySemester = await Note.aggregate([
                { $match: { isApproved: true } },
                { $group: { _id: '$semester', count: { $sum: 1 } } },
                { $sort: { _id: 1 } }
            ]) || [];
        } catch (error) {
            console.warn('Error aggregating notes by semester:', error.message);
        }

        // Recent activity (last 7 days) with error handling
        const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
        let recentActivity = {
            newUsers: 0,
            newNotes: 0,
            newPosts: 0
        };

        try {
            recentActivity.newUsers = await User.countDocuments({
                createdAt: { $gte: sevenDaysAgo },
                isActive: true
            });
        } catch (error) {
            console.warn('Error counting new users:', error.message);
        }

        try {
            recentActivity.newNotes = await Note.countDocuments({
                createdAt: { $gte: sevenDaysAgo },
                isApproved: true
            });
        } catch (error) {
            console.warn('Error counting new notes:', error.message);
        }

        try {
            recentActivity.newPosts = await Post.countDocuments({
                createdAt: { $gte: sevenDaysAgo }
            });
        } catch (error) {
            console.warn('Error counting new posts:', error.message);
        }

        res.json({
            success: true,
            data: {
                overview: {
                    totalUsers,
                    totalNotes,
                    totalPosts,
                    totalDownloads
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
            error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
        });
    }
};
