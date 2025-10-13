import fs from 'fs';
import path from 'path';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { extractTextFromPDF } from '../utils/aiService.js';
import { searchYouTube, searchGeeksForGeeks, searchMDN, searchW3Schools, searchByPDFContent } from '../utils/resourceSearcher.js';

// Initialize Gemini AI client
const genAI = process.env.GEMINI_API_KEY ? new GoogleGenerativeAI(process.env.GEMINI_API_KEY) : null;
const model = genAI ? genAI.getGenerativeModel({ model: "gemini-flash-latest" }) : null;

// Store conversation history (in production, use database or Redis)
const conversationHistory = new Map();

/**
 * @desc    Process uploaded file (PDF/PPT) and extract content
 * @route   POST /api/chatbot/process-file
 * @access  Private
 */
export const processFile = async (req, res) => {
    try {
        console.log('Processing file upload request...', {
            hasFile: !!req.file,
            userId: req.user?.id
        });

        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: 'No file uploaded'
            });
        }

        console.log('File details:', {
            originalname: req.file.originalname,
            mimetype: req.file.mimetype,
            size: req.file.size,
            path: req.file.path
        });

        const file = req.file;
        const fileExtension = path.extname(file.originalname).toLowerCase();

        let extractedText = '';
        let fileInfo = {
            name: file.originalname,
            size: file.size,
            type: fileExtension
        };

        // Extract text based on file type
        if (fileExtension === '.pdf') {
            try {
                const buffer = fs.readFileSync(file.path);
                const result = await extractTextFromPDF(buffer);

                if (result.success) {
                    extractedText = result.text;
                    fileInfo.pageCount = result.pageCount;
                    // Store enhanced analysis for better resource searching
                    fileInfo.analysis = {
                        keyTopics: result.keyTopics || [],
                        summary: result.summary || '',
                        difficulty: result.difficulty || 'intermediate',
                        subject: result.subject || 'General',
                        learningObjectives: result.learningObjectives || []
                    };
                } else {
                    extractedText = `Unable to extract full text from PDF. Filename: ${file.originalname}`;
                }
            } catch (fileReadError) {
                console.error('Error reading PDF file:', fileReadError);
                extractedText = `Error reading PDF file. Filename: ${file.originalname}`;
            }
        } else if (['.ppt', '.pptx'].includes(fileExtension)) {
            // For PPT files, use basic metadata
            extractedText = `PowerPoint presentation: ${file.originalname}. Please ask specific questions about the topic.`;
        } else {
            // Clean up uploaded file before returning error
            if (fs.existsSync(file.path)) {
                fs.unlinkSync(file.path);
            }
            return res.status(400).json({
                success: false,
                message: 'Unsupported file type. Please upload PDF or PPT files.'
            });
        }

        // Clean up the uploaded file after processing
        if (fs.existsSync(file.path)) {
            fs.unlinkSync(file.path);
        }

        // Generate a session ID for this conversation
        const sessionId = `${req.user.id}_${Date.now()}`;

        // Initialize conversation with enhanced file context
        const systemPrompt = fileInfo.analysis ?
            `You are an educational AI assistant helping students learn. A student has uploaded "${file.originalname}" - a ${fileInfo.analysis.difficulty} level ${fileInfo.analysis.subject} document.

Key Topics: ${fileInfo.analysis.keyTopics.join(', ')}
Summary: ${fileInfo.analysis.summary}
Learning Objectives: ${fileInfo.analysis.learningObjectives.join(', ')}

Content Preview:
${extractedText.substring(0, 6000)}

Provide short, clear, and direct answers. Focus on the specific content and avoid unnecessary details. When asked questions, refer to the document content and suggest relevant learning resources.` :
            `You are an educational AI assistant helping students learn. A student has uploaded a file: ${file.originalname}. Here's the content:\n\n${extractedText.substring(0, 8000)}\n\nProvide short, clear answers and suggest learning resources when appropriate.`;

        conversationHistory.set(sessionId, [{
            role: 'system',
            content: systemPrompt
        }]);

        // Store file analysis for resource searching
        conversationHistory.set(`${sessionId}_analysis`, fileInfo.analysis);

        res.json({
            success: true,
            message: 'File processed successfully',
            data: {
                sessionId,
                fileInfo,
                summary: extractedText.substring(0, 500) + '...'
            }
        });

    } catch (error) {
        console.error('Process file error:', error);

        // Clean up file if it exists
        if (req.file?.path && fs.existsSync(req.file.path)) {
            try {
                fs.unlinkSync(req.file.path);
            } catch (cleanupError) {
                console.error('Error cleaning up file:', cleanupError);
            }
        }

        res.status(500).json({
            success: false,
            message: 'Failed to process file',
            error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
        });
    }
};

/**
 * @desc    Chat with AI assistant and get resource recommendations
 * @route   POST /api/chatbot/chat
 * @access  Private
 */
export const chatWithBot = async (req, res) => {
    try {
        const { message, sessionId, topic } = req.body;

        if (!message) {
            return res.status(400).json({
                success: false,
                message: 'Message is required'
            });
        }

        if (!model) {
            return res.status(503).json({
                success: false,
                message: 'AI service not configured. Please set GEMINI_API_KEY.'
            });
        }

        // Get or create conversation history
        let history = conversationHistory.get(sessionId) || [];
        const analysisData = conversationHistory.get(`${sessionId}_analysis`);

        // Enhanced system prompt for better responses
        let systemPrompt = `You are an educational AI assistant helping students learn. Your responses must be:
- SHORT and concise (2-4 sentences maximum)
- CLEAR and easy to understand
- DIRECTLY answer the user's specific question
- Avoid unnecessary details or tangents
- Use simple language appropriate for students

${analysisData ? `Context: You're helping with ${analysisData.subject} content at ${analysisData.difficulty} level. Key topics include: ${analysisData.keyTopics.join(', ')}.` : ''}

Focus on being helpful and precise.`;

        if (history.length === 0) {
            // New conversation without file
            history = [];
            conversationHistory.set(sessionId, history);
        }

        // Build optimized conversation context for Gemini
        const recentHistory = history.slice(-6); // Keep only last 6 messages for context
        let conversationContext = systemPrompt + '\n\n';

        // Add recent conversation history
        recentHistory.forEach((msg, index) => {
            if (msg.role === 'user') {
                conversationContext += `User: ${msg.content}\n`;
            } else if (msg.role === 'assistant') {
                conversationContext += `Assistant: ${msg.content}\n`;
            } else if (msg.role === 'system' && index === 0) {
                return; // Skip duplicate system message
            }
        });

        // Add current user message with instruction emphasis
        conversationContext += `User: ${message}\nAssistant: (Remember: Be brief, clear, and directly answer the question) `;

        // Add user message to history
        history.push({
            role: 'user',
            content: message
        });

        // Limit history to last 12 messages to manage token usage
        if (history.length > 12) {
            history = history.slice(-12);
            conversationHistory.set(sessionId, history);
        }

        // Get AI response from Gemini with enhanced prompt
        const result = await model.generateContent(conversationContext);
        let aiResponse = result.response.text().trim();

        // Post-process response to ensure it's concise
        if (aiResponse.length > 500) {
            // If response is too long, ask AI to summarize
            const summarizePrompt = `Summarize this response in 2-3 clear, direct sentences that answer the user's question: "${message}"\n\nOriginal response: ${aiResponse}`;
            const summaryResult = await model.generateContent(summarizePrompt);
            aiResponse = summaryResult.response.text().trim();
        }

        // Add AI response to history
        history.push({
            role: 'assistant',
            content: aiResponse
        });

        // Search for learning resources based on context
        let resources = [];
        try {
            // Check if we have PDF analysis data for enhanced searching
            const analysisData = conversationHistory.get(`${sessionId}_analysis`);

            if (analysisData && analysisData.keyTopics && analysisData.keyTopics.length > 0) {
                // Use PDF content-aware search for more relevant results
                resources = await searchByPDFContent(analysisData, 6);
            } else {
                // Fallback to traditional topic-based search
                const searchTopic = topic || extractMainTopic(message);
                if (searchTopic) {
                    const [youtubeResults, geeksResults, mdnResults, w3Results] = await Promise.all([
                        searchYouTube(searchTopic, 2),
                        searchGeeksForGeeks(searchTopic, 2),
                        searchMDN(searchTopic, 1),
                        searchW3Schools(searchTopic, 1)
                    ]);

                    resources = [
                        ...youtubeResults,
                        ...geeksResults,
                        ...mdnResults,
                        ...w3Results
                    ];
                }
            }
        } catch (searchError) {
            console.error('Resource search error:', searchError);
        }

        res.json({
            success: true,
            data: {
                message: aiResponse,
                resources,
                sessionId
            }
        });

    } catch (error) {
        console.error('Chat error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to process chat message',
            error: error.message
        });
    }
};

/**
 * @desc    Get resource recommendations for a specific topic
 * @route   POST /api/chatbot/resources
 * @access  Private
 */
export const getResources = async (req, res) => {
    try {
        const { topic, resourceTypes = ['youtube', 'geeksforgeeks', 'mdn', 'w3schools'] } = req.body;

        if (!topic) {
            return res.status(400).json({
                success: false,
                message: 'Topic is required'
            });
        }

        const searchPromises = [];

        if (resourceTypes.includes('youtube')) {
            searchPromises.push(searchYouTube(topic));
        }
        if (resourceTypes.includes('geeksforgeeks')) {
            searchPromises.push(searchGeeksForGeeks(topic));
        }
        if (resourceTypes.includes('mdn')) {
            searchPromises.push(searchMDN(topic));
        }
        if (resourceTypes.includes('w3schools')) {
            searchPromises.push(searchW3Schools(topic));
        }

        const results = await Promise.all(searchPromises);
        const resources = results.flat();

        res.json({
            success: true,
            data: {
                topic,
                resources,
                count: resources.length
            }
        });

    } catch (error) {
        console.error('Get resources error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch resources',
            error: error.message
        });
    }
};

/**
 * @desc    Clear conversation history
 * @route   DELETE /api/chatbot/session/:sessionId
 * @access  Private
 */
export const clearSession = async (req, res) => {
    try {
        const { sessionId } = req.params;

        // Clear both conversation history and analysis data
        conversationHistory.delete(sessionId);
        conversationHistory.delete(`${sessionId}_analysis`);

        res.json({
            success: true,
            message: 'Session cleared successfully'
        });

    } catch (error) {
        console.error('Clear session error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to clear session',
            error: error.message
        });
    }
};

/**
 * Helper function to extract main topic from user message
 */
function extractMainTopic(message) {
    // Simple topic extraction - in production, use NLP or AI
    const keywords = message
        .toLowerCase()
        .replace(/[^\w\s]/g, '')
        .split(' ')
        .filter(word => word.length > 3);

    return keywords.slice(0, 3).join(' ');
}

export default {
    processFile,
    chatWithBot,
    getResources,
    clearSession
};
