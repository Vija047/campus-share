import express from 'express';
import { body } from 'express-validator';
import {
    createPost,
    getPosts,
    getPost,
    toggleVote,
    addReply,
    deletePost
} from '../controllers/postController.js';
import { authenticate, optionalAuth } from '../middleware/auth.js';

const router = express.Router();

// Validation middleware
const postValidation = [
    body('content')
        .trim()
        .isLength({ min: 10, max: 1000 })
        .withMessage('Content must be between 10 and 1000 characters'),
    body('semester')
        .optional()
        .isIn(['1', '2', '3', '4', '5', '6', '7', '8', 'general'])
        .withMessage('Invalid semester')
];

const replyValidation = [
    body('content')
        .trim()
        .isLength({ min: 1, max: 500 })
        .withMessage('Reply must be between 1 and 500 characters')
];

const voteValidation = [
    body('voteType')
        .isIn(['upvote', 'downvote'])
        .withMessage('Vote type must be either upvote or downvote')
];

// Routes
router.post('/', authenticate, postValidation, createPost);
router.get('/', optionalAuth, getPosts);
router.get('/:id', optionalAuth, getPost);
router.post('/:id/vote', authenticate, voteValidation, toggleVote);
router.post('/:id/reply', authenticate, replyValidation, addReply);
router.delete('/:id', authenticate, deletePost);

export default router;
