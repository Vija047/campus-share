import express from 'express';
import { authenticate } from '../middleware/auth.js';
import { uploadFile, uploadError } from '../middleware/upload.js';
import {
    processFile,
    chatWithBot,
    getResources,
    clearSession
} from '../controllers/chatbotController.js';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// Process uploaded file (PDF/PPT) with error handling
router.post('/process-file', uploadFile.single('file'), uploadError, processFile);

// Chat with AI assistant
router.post('/chat', chatWithBot);

// Get learning resources for a topic
router.post('/resources', getResources);

// Clear conversation session
router.delete('/session/:sessionId', clearSession);

export default router;
