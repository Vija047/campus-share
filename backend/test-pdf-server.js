// Test script to verify PDF serving
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const app = express();
const PORT = 5001; // Use different port for testing

// __dirname equivalent for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Security middleware
app.use(helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
    contentSecurityPolicy: false // Disable CSP for better PDF viewing compatibility
}));

// CORS configuration
app.use(cors({
    origin: ['http://localhost:3000', 'http://localhost:3001'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Accept-Version', 'Content-Length', 'Content-MD5', 'Date', 'X-Api-Version', 'Range'],
    exposedHeaders: ['Content-Length', 'Content-Range', 'Accept-Ranges'], // Allow range headers for file streaming
    optionsSuccessStatus: 200
}));

// Custom file serving route with proper error handling and MIME types
app.get('/uploads/:filename', async (req, res) => {
    try {
        const filename = req.params.filename;
        const filePath = path.join(__dirname, 'uploads', filename);

        // Check if file exists
        if (!fs.existsSync(filePath)) {
            return res.status(404).json({
                success: false,
                message: `File not found: ${filename}`,
                error: 'The requested file does not exist on the server'
            });
        }

        // Determine MIME type based on file extension
        const ext = path.extname(filename).toLowerCase();
        let mimeType = 'application/octet-stream'; // Default fallback

        switch (ext) {
            case '.pdf':
                mimeType = 'application/pdf';
                break;
            case '.doc':
                mimeType = 'application/msword';
                break;
            case '.docx':
                mimeType = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
                break;
            case '.txt':
                mimeType = 'text/plain';
                break;
            case '.ppt':
                mimeType = 'application/vnd.ms-powerpoint';
                break;
            case '.pptx':
                mimeType = 'application/vnd.openxmlformats-officedocument.presentationml.presentation';
                break;
            case '.xls':
                mimeType = 'application/vnd.ms-excel';
                break;
            case '.xlsx':
                mimeType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
                break;
            case '.jpg':
            case '.jpeg':
                mimeType = 'image/jpeg';
                break;
            case '.png':
                mimeType = 'image/png';
                break;
            case '.gif':
                mimeType = 'image/gif';
                break;
        }

        // Set proper headers for inline viewing
        res.setHeader('Content-Type', mimeType);
        res.setHeader('Content-Disposition', 'inline; filename="' + filename + '"');
        res.setHeader('Cache-Control', 'public, max-age=31536000'); // Cache for 1 year
        res.setHeader('Accept-Ranges', 'bytes'); // Enable range requests for better streaming

        // Special handling for PDFs to ensure proper rendering
        if (ext === '.pdf') {
            res.setHeader('X-Content-Type-Options', 'nosniff');
            res.setHeader('Content-Security-Policy', "default-src 'self'; script-src 'unsafe-inline' 'unsafe-eval'; style-src 'unsafe-inline';");
        }

        console.log(`Serving ${filename} with MIME type: ${mimeType}`);

        // Serve the file
        res.sendFile(filePath, (err) => {
            if (err) {
                console.error('Error serving file:', err);
                res.status(500).json({
                    success: false,
                    message: 'Error serving file',
                    error: err.message
                });
            }
        });
    } catch (error) {
        console.error('File serving error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error while serving file',
            error: error.message
        });
    }
});

// Test endpoint
app.get('/test', (req, res) => {
    res.json({
        message: 'PDF Test Server is running',
        availableFiles: fs.readdirSync(path.join(__dirname, 'uploads')).filter(f => f.endsWith('.pdf'))
    });
});

app.listen(PORT, () => {
    console.log(`🧪 PDF Test Server running on port ${PORT}`);
    console.log(`📄 Test PDF at: http://localhost:${PORT}/uploads/1757618833056-vijaykumar-03-28-08-2025.pdf`);
});