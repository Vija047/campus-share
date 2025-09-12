import express from 'express';
import { body } from 'express-validator';
import {
    getChatMessages,
    sendMessage,
    editMessage,
    deleteMessage,
    addReaction
} from '../controllers/chatController.js';
import { authenticate } from '../middleware/auth.js';
import { chatLimiter } from '../middleware/rateLimiter.js';

const router = express.Router();

// Validation middleware
const messageValidation = [
    body('message')
        .trim()
        .isLength({ min: 1, max: 1000 })
        .withMessage('Message must be between 1 and 1000 characters'),
    body('messageType')
        .optional()
        .isIn(['text', 'file', 'image'])
        .withMessage('Invalid message type')
];

const reactionValidation = [
    body('emoji')
        .notEmpty()
        .withMessage('Emoji is required')
];

// Routes
router.get('/:semesterId', authenticate, getChatMessages);
router.post('/:semesterId', authenticate, chatLimiter, messageValidation, sendMessage);
router.put('/:messageId', authenticate, messageValidation, editMessage);
router.delete('/:messageId', authenticate, deleteMessage);
router.post('/:messageId/reaction', authenticate, reactionValidation, addReaction);

export default router;
