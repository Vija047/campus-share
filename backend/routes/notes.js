import express from 'express';
import { body, validationResult } from 'express-validator';
import {
    uploadNote,
    getNotes,
    getNote,
    toggleLike,
    downloadNote,
    generateShareableLink,
    getMyNotes,
    toggleBookmark,
    getBookmarkedNotes
} from '../controllers/noteController.js';
import { authenticate, optionalAuth } from '../middleware/auth.js';
import { uploadFile, uploadError } from '../middleware/upload.js';
import { uploadLimiter } from '../middleware/rateLimiter.js';

const router = express.Router();

// Validation middleware
const uploadValidation = [
    body('title')
        .trim()
        .isLength({ min: 3, max: 100 })
        .withMessage('Title must be between 3 and 100 characters'),
    body('subject')
        .trim()
        .notEmpty()
        .withMessage('Subject is required'),
    body('semester')
        .isIn(['1', '2', '3', '4', '5', '6', '7', '8'])
        .withMessage('Semester must be between 1 and 8'),
    body('description')
        .trim()
        .optional()
        .isLength({ min: 0, max: 500 })
        .withMessage('Description must be less than 500 characters')
];

// Validation error handler
const handleValidationErrors = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        console.log('Validation errors:', errors.array());
        return res.status(400).json({
            success: false,
            message: 'Validation failed',
            errors: errors.array()
        });
    }
    next();
};

// Routes
router.post('/upload',
    (req, res, next) => {
        console.log('Upload route hit:', {
            method: req.method,
            headers: Object.keys(req.headers),
            origin: req.get('origin'),
            contentType: req.get('content-type')
        });
        next();
    },
    authenticate,
    uploadLimiter,
    (req, res, next) => {
        console.log('Before multer - Content-Type:', req.get('content-type'));
        next();
    },
    uploadFile.single('file'),
    (req, res, next) => {
        console.log('After multer - File received:', !!req.file);
        if (req.file) {
            console.log('File details:', {
                originalname: req.file.originalname,
                mimetype: req.file.mimetype,
                size: req.file.size
            });
        }
        next();
    },
    uploadError,
    uploadValidation,
    handleValidationErrors,
    uploadNote
);

router.get('/', optionalAuth, getNotes);
router.get('/my-notes', authenticate, getMyNotes);
router.get('/bookmarked', authenticate, getBookmarkedNotes);
router.get('/:id', optionalAuth, getNote);
router.post('/:id/like', authenticate, toggleLike);
router.post('/:id/bookmark', authenticate, toggleBookmark);
router.get('/:id/download', authenticate, downloadNote);
router.post('/:id/share', authenticate, generateShareableLink);

export default router;
