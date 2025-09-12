import Chat from '../models/Chat.js';

// @desc    Get chat messages for a semester
// @route   GET /api/chat/:semesterId
// @access  Private
export const getChatMessages = async (req, res) => {
    try {
        const { semesterId } = req.params;
        const { page = 1, limit = 50 } = req.query;

        // Check if user is in the same semester (except for general chat)
        if (semesterId !== 'general' && req.user.semester !== semesterId) {
            return res.status(403).json({
                success: false,
                message: 'Access denied. You can only access your semester chat.'
            });
        }

        const messages = await Chat.find({
            semesterId,
            isDeleted: false
        })
            .populate('sender', 'name profilePicture')
            .populate('replyTo', 'message sender')
            .sort({ createdAt: -1 })
            .limit(limit * 1)
            .skip((page - 1) * limit)
            .exec();

        const total = await Chat.countDocuments({
            semesterId,
            isDeleted: false
        });

        res.json({
            success: true,
            data: {
                messages: messages.reverse(), // Show oldest first
                pagination: {
                    currentPage: parseInt(page),
                    totalPages: Math.ceil(total / limit),
                    totalMessages: total
                }
            }
        });
    } catch (error) {
        console.error('Get chat messages error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get chat messages',
            error: error.message
        });
    }
};

// @desc    Send chat message
// @route   POST /api/chat/:semesterId
// @access  Private
export const sendMessage = async (req, res) => {
    try {
        const { semesterId } = req.params;
        const { message, messageType = 'text', replyTo } = req.body;

        // Check if user is in the same semester (except for general chat)
        if (semesterId !== 'general' && req.user.semester !== semesterId) {
            return res.status(403).json({
                success: false,
                message: 'Access denied. You can only send messages to your semester chat.'
            });
        }

        const chatMessage = await Chat.create({
            semesterId,
            sender: req.user.id,
            message,
            messageType,
            replyTo: replyTo || null
        });

        const populatedMessage = await Chat.findById(chatMessage._id)
            .populate('sender', 'name profilePicture')
            .populate('replyTo', 'message sender');

        res.status(201).json({
            success: true,
            message: 'Message sent successfully',
            data: { message: populatedMessage }
        });
    } catch (error) {
        console.error('Send message error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to send message',
            error: error.message
        });
    }
};

// @desc    Edit chat message
// @route   PUT /api/chat/:messageId
// @access  Private
export const editMessage = async (req, res) => {
    try {
        const { messageId } = req.params;
        const { message } = req.body;

        const chatMessage = await Chat.findById(messageId);

        if (!chatMessage) {
            return res.status(404).json({
                success: false,
                message: 'Message not found'
            });
        }

        // Check if user is the sender
        if (chatMessage.sender.toString() !== req.user.id) {
            return res.status(403).json({
                success: false,
                message: 'You can only edit your own messages'
            });
        }

        // Check if message is not too old (15 minutes limit)
        const timeDiff = Date.now() - chatMessage.createdAt.getTime();
        if (timeDiff > 15 * 60 * 1000) {
            return res.status(400).json({
                success: false,
                message: 'Cannot edit messages older than 15 minutes'
            });
        }

        chatMessage.message = message;
        chatMessage.isEdited = true;
        chatMessage.editedAt = new Date();
        await chatMessage.save();

        const populatedMessage = await Chat.findById(messageId)
            .populate('sender', 'name profilePicture');

        res.json({
            success: true,
            message: 'Message updated successfully',
            data: { message: populatedMessage }
        });
    } catch (error) {
        console.error('Edit message error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to edit message',
            error: error.message
        });
    }
};

// @desc    Delete chat message
// @route   DELETE /api/chat/:messageId
// @access  Private
export const deleteMessage = async (req, res) => {
    try {
        const { messageId } = req.params;

        const chatMessage = await Chat.findById(messageId);

        if (!chatMessage) {
            return res.status(404).json({
                success: false,
                message: 'Message not found'
            });
        }

        // Check if user is the sender or admin
        if (chatMessage.sender.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'You can only delete your own messages'
            });
        }

        chatMessage.isDeleted = true;
        chatMessage.message = 'This message was deleted';
        await chatMessage.save();

        res.json({
            success: true,
            message: 'Message deleted successfully'
        });
    } catch (error) {
        console.error('Delete message error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to delete message',
            error: error.message
        });
    }
};

// @desc    Add reaction to message
// @route   POST /api/chat/:messageId/reaction
// @access  Private
export const addReaction = async (req, res) => {
    try {
        const { messageId } = req.params;
        const { emoji } = req.body;

        const chatMessage = await Chat.findById(messageId);

        if (!chatMessage) {
            return res.status(404).json({
                success: false,
                message: 'Message not found'
            });
        }

        // Check if user already reacted with this emoji
        const existingReaction = chatMessage.reactions.find(
            reaction => reaction.user.toString() === req.user.id && reaction.emoji === emoji
        );

        if (existingReaction) {
            // Remove reaction
            chatMessage.reactions = chatMessage.reactions.filter(
                reaction => !(reaction.user.toString() === req.user.id && reaction.emoji === emoji)
            );
        } else {
            // Add reaction
            chatMessage.reactions.push({
                user: req.user.id,
                emoji
            });
        }

        await chatMessage.save();

        res.json({
            success: true,
            message: existingReaction ? 'Reaction removed' : 'Reaction added',
            data: {
                reactions: chatMessage.reactions
            }
        });
    } catch (error) {
        console.error('Add reaction error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to add reaction',
            error: error.message
        });
    }
};
