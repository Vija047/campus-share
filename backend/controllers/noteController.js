import Note from '../models/Note.js';
import User from '../models/User.js';
import Notification from '../models/Notification.js';
import { uploadToCloudinary, getFileType } from '../utils/cloudinary.js';
import { generateShareLink } from '../utils/jwt.js';
import { v4 as uuidv4 } from 'uuid';

// @desc    Upload note
// @route   POST /api/notes/upload
// @access  Private
export const uploadNote = async (req, res) => {
    try {
        console.log('Upload request received:', {
            body: req.body,
            file: req.file ? {
                originalname: req.file.originalname,
                mimetype: req.file.mimetype,
                size: req.file.size
            } : 'No file',
            user: req.user ? { id: req.user.id, name: req.user.name } : 'No user'
        });

        const { title, subject, semester, description, tags } = req.body;

        // Validate required fields
        if (!title || !title.trim()) {
            return res.status(400).json({
                success: false,
                message: 'Title is required'
            });
        }

        if (!subject || !subject.trim()) {
            return res.status(400).json({
                success: false,
                message: 'Subject is required'
            });
        }

        if (!semester) {
            return res.status(400).json({
                success: false,
                message: 'Semester is required'
            });
        }

        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: 'Please upload a file'
            });
        }

        let fileURL, uploadResult;

        // Check if Cloudinary is properly configured
        if (!process.env.CLOUDINARY_CLOUD_NAME ||
            !process.env.CLOUDINARY_API_KEY ||
            !process.env.CLOUDINARY_API_SECRET ||
            process.env.CLOUDINARY_CLOUD_NAME === 'your_cloudinary_cloud_name' ||
            process.env.CLOUDINARY_CLOUD_NAME === 'demo') {

            // For development: create a mock file URL
            fileURL = `http://localhost:5000/uploads/${Date.now()}-${req.file.originalname}`;
            uploadResult = { secure_url: fileURL };

            console.log('⚠️  Cloudinary not configured, using mock file URL for development');
        } else {
            try {
                // Upload file to Cloudinary
                uploadResult = await uploadToCloudinary(req.file.buffer, {
                    folder: `notes/${semester}/${subject}`,
                    resource_type: 'auto'
                });
                fileURL = uploadResult.secure_url;
            } catch (cloudinaryError) {
                console.error('Cloudinary upload failed:', cloudinaryError);
                return res.status(500).json({
                    success: false,
                    message: 'File upload failed. Please try again later.'
                });
            }
        }

        // Create note
        const note = await Note.create({
            title,
            subject,
            semester,
            description: description || 'No description provided',
            fileURL: fileURL,
            fileName: req.file.originalname,
            fileType: getFileType(req.file.mimetype),
            fileSize: req.file.size,
            uploader: req.user.id,
            shareLink: generateShareLink(uuidv4()),
            tags: tags ? tags.split(',').map(tag => tag.trim()) : []
        });

        // Update user's notes count
        await User.findByIdAndUpdate(req.user.id, {
            $inc: { notesUploaded: 1 }
        });

        // Create notifications for users in the same semester
        const sameYearUsers = await User.find({
            semester: semester,
            _id: { $ne: req.user.id },
            isActive: true
        });

        const notifications = sameYearUsers.map(user => ({
            recipient: user._id,
            sender: req.user.id,
            type: 'new_note',
            title: 'New Note Uploaded',
            message: `${req.user.name} uploaded a new note: ${title} for ${subject}`,
            data: {
                noteId: note._id
            }
        }));

        if (notifications.length > 0) {
            await Notification.insertMany(notifications);
        }

        const populatedNote = await Note.findById(note._id).populate('uploader', 'name profilePicture');

        res.status(201).json({
            success: true,
            message: 'Note uploaded successfully',
            data: { note: populatedNote }
        });
    } catch (error) {
        console.error('Upload note error:', error);

        // Handle validation errors specifically
        if (error.name === 'ValidationError') {
            const validationErrors = Object.values(error.errors).map(err => err.message);
            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors: validationErrors
            });
        }

        res.status(500).json({
            success: false,
            message: 'Failed to upload note',
            error: error.message
        });
    }
};

// @desc    Get notes with filters
// @route   GET /api/notes
// @access  Public
export const getNotes = async (req, res) => {
    try {
        const { semester, subject, search, page = 1, limit = 10, sortBy = 'createdAt' } = req.query;

        // Build query
        const query = { isApproved: true };

        if (semester) query.semester = semester;
        if (subject) query.subject = new RegExp(subject, 'i');
        if (search) {
            query.$or = [
                { title: new RegExp(search, 'i') },
                { description: new RegExp(search, 'i') },
                { tags: new RegExp(search, 'i') }
            ];
        }

        // Build sort object
        const sortOptions = {};
        switch (sortBy) {
            case 'likes':
                sortOptions.likes = -1;
                break;
            case 'downloads':
                sortOptions.downloads = -1;
                break;
            case 'title':
                sortOptions.title = 1;
                break;
            default:
                sortOptions.createdAt = -1;
        }

        // Execute query with pagination
        const notes = await Note.find(query)
            .populate('uploader', 'name profilePicture')
            .sort(sortOptions)
            .limit(limit * 1)
            .skip((page - 1) * limit)
            .exec();

        // If user is authenticated, check bookmark status
        let notesWithBookmarkStatus = notes;
        if (req.user) {
            const user = await User.findById(req.user.id);
            notesWithBookmarkStatus = notes.map(note => ({
                ...note.toObject(),
                isBookmarked: user.bookmarkedNotes && user.bookmarkedNotes.some(
                    bookmarkId => bookmarkId.toString() === note._id.toString()
                )
            }));
        } else {
            notesWithBookmarkStatus = notes.map(note => ({
                ...note.toObject(),
                isBookmarked: false
            }));
        }

        const total = await Note.countDocuments(query);

        res.json({
            success: true,
            data: {
                notes: notesWithBookmarkStatus,
                pagination: {
                    currentPage: parseInt(page),
                    totalPages: Math.ceil(total / limit),
                    totalNotes: total,
                    hasNextPage: page < Math.ceil(total / limit),
                    hasPrevPage: page > 1
                }
            }
        });
    } catch (error) {
        console.error('Get notes error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get notes',
            error: error.message
        });
    }
};

// @desc    Get single note
// @route   GET /api/notes/:id
// @access  Public
export const getNote = async (req, res) => {
    try {
        const note = await Note.findById(req.params.id)
            .populate('uploader', 'name profilePicture semester')
            .populate('likes.user', 'name');

        if (!note) {
            return res.status(404).json({
                success: false,
                message: 'Note not found'
            });
        }

        // Increment views
        note.views += 1;
        await note.save();

        res.json({
            success: true,
            data: { note }
        });
    } catch (error) {
        console.error('Get note error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get note',
            error: error.message
        });
    }
};

// @desc    Like/Unlike note
// @route   POST /api/notes/:id/like
// @access  Private
export const toggleLike = async (req, res) => {
    try {
        const note = await Note.findById(req.params.id);

        if (!note) {
            return res.status(404).json({
                success: false,
                message: 'Note not found'
            });
        }

        const likeIndex = note.likes.findIndex(
            like => like.user.toString() === req.user.id
        );

        if (likeIndex > -1) {
            // Unlike
            note.likes.splice(likeIndex, 1);
        } else {
            // Like
            note.likes.push({ user: req.user.id });

            // Create notification for note uploader
            if (note.uploader.toString() !== req.user.id) {
                await Notification.create({
                    recipient: note.uploader,
                    sender: req.user.id,
                    type: 'note_liked',
                    title: 'Note Liked',
                    message: `${req.user.name} liked your note: ${note.title}`,
                    data: {
                        noteId: note._id
                    }
                });
            }
        }

        await note.save();

        res.json({
            success: true,
            message: likeIndex > -1 ? 'Note unliked' : 'Note liked',
            data: {
                likesCount: note.likes.length,
                isLiked: likeIndex === -1
            }
        });
    } catch (error) {
        console.error('Toggle like error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to toggle like',
            error: error.message
        });
    }
};

// @desc    Download note
// @route   GET /api/notes/:id/download
// @access  Private
export const downloadNote = async (req, res) => {
    try {
        const note = await Note.findById(req.params.id);

        if (!note) {
            return res.status(404).json({
                success: false,
                message: 'Note not found'
            });
        }

        // Check if user already downloaded
        const alreadyDownloaded = note.downloadedBy.some(
            download => download.user.toString() === req.user.id
        );

        if (!alreadyDownloaded) {
            // Add to downloaded by
            note.downloadedBy.push({ user: req.user.id });
            note.downloads += 1;
            await note.save();

            // Create notification for note uploader
            if (note.uploader.toString() !== req.user.id) {
                await Notification.create({
                    recipient: note.uploader,
                    sender: req.user.id,
                    type: 'note_downloaded',
                    title: 'Note Downloaded',
                    message: `${req.user.name} downloaded your note: ${note.title}`,
                    data: {
                        noteId: note._id
                    }
                });
            }
        }

        // Prepare download URL with appropriate flags for better downloading
        let downloadUrl = note.fileURL;

        // If it's a Cloudinary URL, add download flags
        if (downloadUrl.includes('cloudinary.com')) {
            const separator = downloadUrl.includes('?') ? '&' : '?';
            downloadUrl = `${downloadUrl}${separator}fl_attachment:${encodeURIComponent(note.fileName)}`;
        }

        res.json({
            success: true,
            data: {
                downloadUrl: downloadUrl,
                fileName: note.fileName,
                fileSize: note.fileSize,
                mimeType: note.mimeType
            }
        });
    } catch (error) {
        console.error('Download note error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to download note',
            error: error.message
        });
    }
};

// @desc    Generate share link
// @route   POST /api/notes/:id/share
// @access  Private
export const generateShareableLink = async (req, res) => {
    try {
        const note = await Note.findById(req.params.id);

        if (!note) {
            return res.status(404).json({
                success: false,
                message: 'Note not found'
            });
        }

        // Generate new share link if doesn't exist
        if (!note.shareLink) {
            note.shareLink = generateShareLink(note._id);
            await note.save();
        }

        res.json({
            success: true,
            data: {
                shareLink: note.shareLink
            }
        });
    } catch (error) {
        console.error('Generate share link error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to generate share link',
            error: error.message
        });
    }
};

// @desc    Toggle bookmark on note
// @route   POST /api/notes/:id/bookmark
// @access  Private
export const toggleBookmark = async (req, res) => {
    try {
        console.log('Toggle bookmark request:', {
            noteId: req.params.id,
            userId: req.user?.id,
            userObject: req.user
        });

        // Validate note ID format
        if (!req.params.id || !req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
            console.log('Invalid note ID format:', req.params.id);
            return res.status(400).json({
                success: false,
                message: 'Invalid note ID format'
            });
        }

        const note = await Note.findById(req.params.id);

        if (!note) {
            console.log('Note not found:', req.params.id);
            return res.status(404).json({
                success: false,
                message: 'Note not found'
            });
        }

        const user = await User.findById(req.user.id);

        if (!user) {
            console.log('User not found:', req.user.id);
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // Ensure bookmarkedNotes array exists
        if (!user.bookmarkedNotes) {
            user.bookmarkedNotes = [];
        }

        const isBookmarked = user.bookmarkedNotes.some(
            noteId => noteId.toString() === note._id.toString()
        );

        console.log('Current bookmark status:', {
            isBookmarked,
            bookmarkedNotes: user.bookmarkedNotes,
            noteId: note._id
        });

        let updatedUser;
        if (isBookmarked) {
            // Remove bookmark using $pull operator
            updatedUser = await User.findByIdAndUpdate(
                req.user.id,
                { $pull: { bookmarkedNotes: note._id } },
                { new: true, runValidators: false }
            );
        } else {
            // Add bookmark using $addToSet operator (prevents duplicates)
            updatedUser = await User.findByIdAndUpdate(
                req.user.id,
                { $addToSet: { bookmarkedNotes: note._id } },
                { new: true, runValidators: false }
            );
        }

        console.log('Bookmark toggled successfully:', {
            noteId: note._id,
            userId: updatedUser._id,
            wasBookmarked: isBookmarked,
            nowBookmarked: !isBookmarked,
            newBookmarkedNotes: updatedUser.bookmarkedNotes
        });

        res.json({
            success: true,
            message: isBookmarked ? 'Note removed from bookmarks' : 'Note bookmarked successfully',
            data: {
                isBookmarked: !isBookmarked
            }
        });
    } catch (error) {
        console.error('Toggle bookmark error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to toggle bookmark',
            error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
        });
    }
};

// @desc    Get bookmarked notes
// @route   GET /api/notes/bookmarked
// @access  Private
export const getBookmarkedNotes = async (req, res) => {
    try {
        const { page = 1, limit = 10 } = req.query;

        const user = await User.findById(req.user.id).populate({
            path: 'bookmarkedNotes',
            populate: {
                path: 'uploader',
                select: 'name email'
            }
        });

        if (!user || !user.bookmarkedNotes) {
            return res.json({
                success: true,
                data: {
                    notes: [],
                    pagination: {
                        currentPage: parseInt(page),
                        totalPages: 0,
                        totalNotes: 0
                    }
                }
            });
        }

        // Sort bookmarked notes by creation date (newest first)
        const sortedNotes = user.bookmarkedNotes.sort((a, b) =>
            new Date(b.createdAt) - new Date(a.createdAt)
        );

        // Apply pagination
        const startIndex = (page - 1) * limit;
        const endIndex = page * limit;
        const paginatedNotes = sortedNotes.slice(startIndex, endIndex);

        const totalBookmarked = sortedNotes.length;

        res.json({
            success: true,
            data: {
                notes: paginatedNotes,
                pagination: {
                    currentPage: parseInt(page),
                    totalPages: Math.ceil(totalBookmarked / limit),
                    totalNotes: totalBookmarked,
                    hasNextPage: endIndex < totalBookmarked,
                    hasPrevPage: page > 1
                }
            }
        });
    } catch (error) {
        console.error('Get bookmarked notes error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get bookmarked notes',
            error: error.message
        });
    }
};

// @desc    Get my uploaded notes
// @route   GET /api/notes/my-notes
// @access  Private
export const getMyNotes = async (req, res) => {
    try {
        const { page = 1, limit = 10 } = req.query;

        const notes = await Note.find({ uploader: req.user.id })
            .sort({ createdAt: -1 })
            .limit(limit * 1)
            .skip((page - 1) * limit)
            .exec();

        const total = await Note.countDocuments({ uploader: req.user.id });

        res.json({
            success: true,
            data: {
                notes,
                pagination: {
                    currentPage: parseInt(page),
                    totalPages: Math.ceil(total / limit),
                    totalNotes: total
                }
            }
        });
    } catch (error) {
        console.error('Get my notes error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get your notes',
            error: error.message
        });
    }
};
