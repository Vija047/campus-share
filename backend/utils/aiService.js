import { GoogleGenerativeAI } from '@google/generative-ai';
import axios from 'axios';
import fs from 'fs';

// PDF parsing will be handled differently
// We'll make it optional and provide fallback functionality
let pdfParse = null;

// Try to load pdf-parse, but don't fail if it doesn't work
const loadPdfParse = async () => {
    try {
        // Try importing pdf-parse
        const module = await import('pdf-parse');
        pdfParse = module.default;
        console.log('✓ PDF parsing enabled');
        return true;
    } catch (error) {
        console.warn('⚠ PDF parsing disabled (pdf-parse not available):', error.message);
        console.warn('  AI summaries will use fallback mode for PDF files');
        return false;
    }
};

// Initialize pdf-parse loading
loadPdfParse();

// Initialize Gemini AI client
const genAI = process.env.GEMINI_API_KEY ? new GoogleGenerativeAI(process.env.GEMINI_API_KEY) : null;
const model = genAI ? genAI.getGenerativeModel({ model: "gemini-flash-latest" }) : null;

/**
 * Extract structured content from PDF buffer with enhanced analysis
 */
export const extractTextFromPDF = async (buffer) => {
    // Wait a bit if pdf-parse is still loading
    if (pdfParse === null) {
        await new Promise(resolve => setTimeout(resolve, 100));
    }

    if (!pdfParse) {
        console.log('PDF parsing not available, using fallback');
        return {
            success: false,
            error: 'PDF text extraction not available. AI summary will use basic metadata.',
            fallback: true
        };
    }

    try {
        const data = await pdfParse(buffer);

        // Enhanced text analysis
        const analysisResult = await analyzePDFContent(data.text);

        return {
            success: true,
            text: data.text,
            pageCount: data.numpages,
            info: data.info,
            metadata: data.metadata,
            // Enhanced analysis results
            keyTopics: analysisResult.keyTopics,
            summary: analysisResult.summary,
            difficulty: analysisResult.difficulty,
            subject: analysisResult.subject,
            learningObjectives: analysisResult.learningObjectives
        };
    } catch (error) {
        console.error('PDF parsing error:', error);
        return {
            success: false,
            error: error.message,
            text: 'Failed to extract text from PDF'
        };
    }
};

/**
 * Analyze PDF content to extract key topics and structure
 */
const analyzePDFContent = async (text) => {
    if (!text || text.length < 100) {
        return {
            keyTopics: [],
            summary: 'Unable to analyze document content',
            difficulty: 'unknown',
            subject: 'unknown',
            learningObjectives: []
        };
    }

    try {
        // Use AI to analyze the content if available
        if (model) {
            const prompt = `Analyze the following educational document and provide a structured analysis:

${text.substring(0, 4000)}

Please provide:
1. Key topics (max 5 important topics)
2. Brief summary (2-3 sentences)
3. Difficulty level (beginner/intermediate/advanced)
4. Subject area
5. Learning objectives (max 3)

Format as JSON:
{
  "keyTopics": ["topic1", "topic2", ...],
  "summary": "brief summary",
  "difficulty": "level",
  "subject": "subject area",
  "learningObjectives": ["objective1", "objective2", ...]
}`;

            const result = await model.generateContent(prompt);
            const response = result.response.text().trim();

            // Try to parse JSON response
            try {
                const analysis = JSON.parse(response.replace(/```json\n?|\n?```/g, ''));
                return {
                    keyTopics: Array.isArray(analysis.keyTopics) ? analysis.keyTopics.slice(0, 5) : [],
                    summary: analysis.summary || 'Document analysis completed',
                    difficulty: analysis.difficulty || 'intermediate',
                    subject: analysis.subject || 'General',
                    learningObjectives: Array.isArray(analysis.learningObjectives) ? analysis.learningObjectives.slice(0, 3) : []
                };
            } catch (parseError) {
                console.warn('Failed to parse AI analysis JSON, using fallback');
            }
        }

        // Fallback analysis using text processing
        return performBasicContentAnalysis(text);

    } catch (error) {
        console.error('Content analysis error:', error);
        return performBasicContentAnalysis(text);
    }
};

/**
 * Basic content analysis without AI
 */
const performBasicContentAnalysis = (text) => {
    const words = text.toLowerCase().split(/\s+/);
    const wordFreq = {};

    // Count word frequencies (excluding common words)
    const stopWords = new Set(['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'is', 'are', 'was', 'were', 'be', 'been', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could', 'should', 'this', 'that', 'these', 'those']);

    words.forEach(word => {
        if (word.length > 3 && !stopWords.has(word)) {
            wordFreq[word] = (wordFreq[word] || 0) + 1;
        }
    });

    // Get top keywords as topics
    const keyTopics = Object.entries(wordFreq)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 5)
        .map(([word]) => word);

    // Determine subject based on keywords
    const subjects = {
        programming: ['programming', 'code', 'software', 'algorithm', 'function', 'variable', 'javascript', 'python', 'java', 'html', 'css'],
        mathematics: ['math', 'equation', 'formula', 'calculate', 'theorem', 'proof', 'algebra', 'geometry', 'calculus'],
        science: ['science', 'experiment', 'theory', 'hypothesis', 'research', 'analysis', 'data', 'method'],
        business: ['business', 'management', 'marketing', 'finance', 'strategy', 'company', 'market', 'customer'],
        engineering: ['engineering', 'design', 'system', 'process', 'technology', 'development', 'project']
    };

    let detectedSubject = 'General';
    let maxMatches = 0;

    Object.entries(subjects).forEach(([subject, keywords]) => {
        const matches = keywords.filter(keyword =>
            keyTopics.some(topic => topic.includes(keyword)) ||
            text.toLowerCase().includes(keyword)
        ).length;

        if (matches > maxMatches) {
            maxMatches = matches;
            detectedSubject = subject.charAt(0).toUpperCase() + subject.slice(1);
        }
    });

    return {
        keyTopics,
        summary: `Document contains ${words.length} words focusing on ${keyTopics.slice(0, 3).join(', ')}.`,
        difficulty: words.length > 2000 ? 'advanced' : words.length > 1000 ? 'intermediate' : 'beginner',
        subject: detectedSubject,
        learningObjectives: [`Understand ${keyTopics[0] || 'key concepts'}`, `Learn about ${keyTopics[1] || 'main topics'}`, `Apply ${keyTopics[2] || 'learned principles'}`]
    };
};

/**
 * Extract text from PPT/PPTX (simplified - requires additional libraries for production)
 * For production, consider using 'officegen' or external services
 */
export const extractTextFromPPT = async (buffer) => {
    // For now, return a placeholder
    // In production, integrate with libraries like 'pptx-text-parser' or external APIs
    return {
        success: false,
        error: 'PPT extraction requires additional setup. Please use the file viewer.'
    };
};

/**
 * Generate AI summary and insights for document content
 */
export const generateAISummary = async (text, metadata = {}) => {
    if (!model) {
        console.warn('Gemini API key not configured. AI features disabled.');
        return {
            success: false,
            error: 'AI service not configured'
        };
    }

    try {
        // Limit text to prevent token overflow (approximately 12000 characters = ~3000 tokens)
        const limitedText = text.substring(0, 12000);

        const prompt = `You are an educational AI assistant analyzing academic content. Analyze the following document and provide:

1. A concise summary (2-3 sentences)
2. Key topics covered (list 3-5 main topics)
3. Difficulty level (Beginner/Intermediate/Advanced/Expert)
4. Estimated reading time in minutes
5. Main concepts (list 3-5 core concepts)
6. Suggested prerequisites (list 2-4 recommended prior knowledge areas)

Document metadata:
- Subject: ${metadata.subject || 'Unknown'}
- Semester: ${metadata.semester || 'Unknown'}
- Type: ${metadata.examType || 'Unknown'}

Document content:
${limitedText}

Respond ONLY with valid JSON in this exact format:
{
  "summary": "Brief summary here",
  "keyTopics": ["topic1", "topic2", "topic3"],
  "difficultyLevel": "Intermediate",
  "estimatedReadTime": 15,
  "mainConcepts": ["concept1", "concept2", "concept3"],
  "suggestedPrerequisites": ["prereq1", "prereq2"]
}`;

        const systemPrompt = "You are an expert educational content analyzer. Always respond with valid JSON only, no additional text.";
        const fullPrompt = `${systemPrompt}\n\n${prompt}`;

        const result = await model.generateContent(fullPrompt);
        const responseText = result.response.text().trim();

        // Parse the JSON response
        const analysis = JSON.parse(responseText);

        return {
            success: true,
            data: {
                summary: analysis.summary || 'Summary not available',
                keyTopics: analysis.keyTopics || [],
                difficultyLevel: analysis.difficultyLevel || 'Intermediate',
                estimatedReadTime: analysis.estimatedReadTime || 10,
                mainConcepts: analysis.mainConcepts || [],
                suggestedPrerequisites: analysis.suggestedPrerequisites || [],
                generatedAt: new Date()
            }
        };

    } catch (error) {
        console.error('Error generating AI summary:', error);
        return {
            success: false,
            error: error.message
        };
    }
};

/**
 * Analyze document and generate comprehensive insights
 */
export const analyzeDocument = async (buffer, fileType, metadata = {}) => {
    try {
        let textContent;

        // Extract text based on file type
        if (fileType === 'pdf') {
            const result = await extractTextFromPDF(buffer);
            if (!result.success) {
                // Use fallback mode - generate summary from metadata only
                if (result.fallback) {
                    return {
                        success: true,
                        data: {
                            summary: `${metadata.title || 'This document'} is a PDF resource for ${metadata.subject || 'the subject'} (${metadata.examType || 'academic material'}).`,
                            keyTopics: metadata.tags || [metadata.subject || 'General Topics'],
                            difficultyLevel: metadata.semester ?
                                (parseInt(metadata.semester) <= 2 ? 'Beginner' :
                                    parseInt(metadata.semester) <= 4 ? 'Intermediate' : 'Advanced') : 'Intermediate',
                            estimatedReadTime: 20,
                            mainConcepts: [
                                metadata.subject || 'Core concepts',
                                metadata.examType || 'Study material',
                                'Academic content'
                            ],
                            suggestedPrerequisites: [
                                'Basic understanding of ' + (metadata.subject || 'the topic'),
                                'Fundamental concepts'
                            ],
                            generatedAt: new Date(),
                            mode: 'fallback'
                        }
                    };
                }
                return {
                    success: false,
                    error: 'Failed to extract text from PDF'
                };
            }
            textContent = result.text;
        } else if (fileType === 'ppt' || fileType === 'pptx') {
            // For PPT files, provide a basic analysis without full text extraction
            return {
                success: true,
                data: {
                    summary: `${metadata.title || 'This presentation'} covers key concepts in ${metadata.subject || 'the subject'}.`,
                    keyTopics: metadata.tags || [metadata.subject || 'General Topics'],
                    difficultyLevel: 'Intermediate',
                    estimatedReadTime: 15,
                    mainConcepts: [metadata.subject || 'Core concepts', 'Visual presentations', 'Diagrams and examples'],
                    suggestedPrerequisites: ['Basic understanding of ' + (metadata.subject || 'the topic')],
                    generatedAt: new Date(),
                    mode: 'metadata-based'
                }
            };
        } else {
            return {
                success: false,
                error: 'Unsupported file type for AI analysis'
            };
        }

        // Generate AI summary
        if (textContent && textContent.trim().length > 50) {
            const aiResult = await generateAISummary(textContent, metadata);
            if (aiResult.success) {
                aiResult.data.mode = 'ai-powered';
            }
            return aiResult;
        } else {
            return {
                success: false,
                error: 'Insufficient text content for analysis'
            };
        }

    } catch (error) {
        console.error('Error analyzing document:', error);
        return {
            success: false,
            error: error.message
        };
    }
};

/**
 * Generate search-friendly keywords from AI analysis
 */
export const generateSearchKeywords = (aiSummary) => {
    if (!aiSummary) return [];

    const keywords = new Set();

    // Add key topics
    if (aiSummary.keyTopics) {
        aiSummary.keyTopics.forEach(topic => keywords.add(topic.toLowerCase()));
    }

    // Add main concepts
    if (aiSummary.mainConcepts) {
        aiSummary.mainConcepts.forEach(concept => keywords.add(concept.toLowerCase()));
    }

    // Add prerequisites
    if (aiSummary.suggestedPrerequisites) {
        aiSummary.suggestedPrerequisites.forEach(prereq => keywords.add(prereq.toLowerCase()));
    }

    return Array.from(keywords);
};

export default {
    extractTextFromPDF,
    extractTextFromPPT,
    generateAISummary,
    analyzeDocument,
    generateSearchKeywords
};
