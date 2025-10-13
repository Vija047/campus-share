import React, { useState, useEffect, useRef } from 'react';
import { chatbotService } from '../../services/chatbotService.js';
import { useAuth } from '../../hooks/useAuth.js';
import {
    Send,
    Upload,
    X,
    Bot,
    User,
    FileText,
    Youtube,
    BookOpen,
    ExternalLink,
    Trash2,
    Loader2
} from 'lucide-react';
import Button from './Button.jsx';
import toast from 'react-hot-toast';

const AIChatbot = ({ onClose }) => {
    const { user } = useAuth();
    const messagesEndRef = useRef(null);
    const fileInputRef = useRef(null);

    const [messages, setMessages] = useState([]);
    const [inputMessage, setInputMessage] = useState('');
    const [sessionId, setSessionId] = useState(`${user?.id}_${Date.now()}`);
    const [loading, setLoading] = useState(false);
    const [uploadedFile, setUploadedFile] = useState(null);
    const [processingFile, setProcessingFile] = useState(false);

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    useEffect(() => {
        // Welcome message
        setMessages([{
            id: 'welcome',
            type: 'bot',
            content: 'Hello! 👋 I\'m your AI learning assistant. Upload a PDF or PPT file, or ask me anything about your studies. I can provide resources from YouTube, GeeksforGeeks, MDN, and more!',
            timestamp: new Date()
        }]);
    }, []);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const handleFileUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        // Validate file type
        const validTypes = ['.pdf', '.ppt', '.pptx'];
        const fileExtension = '.' + file.name.split('.').pop().toLowerCase();

        if (!validTypes.includes(fileExtension)) {
            toast.error('Please upload a PDF or PowerPoint file');
            return;
        }

        // Check file size (max 10MB)
        if (file.size > 10 * 1024 * 1024) {
            toast.error('File size must be less than 10MB');
            return;
        }

        try {
            setProcessingFile(true);
            const response = await chatbotService.processFile(file);

            if (response.success) {
                setUploadedFile(response.data.fileInfo);
                setSessionId(response.data.sessionId);

                // Add file upload message
                setMessages(prev => [...prev, {
                    id: Date.now(),
                    type: 'user',
                    content: `📎 Uploaded: ${file.name}`,
                    timestamp: new Date(),
                    isFile: true
                }, {
                    id: Date.now() + 1,
                    type: 'bot',
                    content: `Great! I've analyzed your file. Here's a quick summary:\n\n${response.data.summary}\n\nFeel free to ask me any questions about the content!`,
                    timestamp: new Date()
                }]);

                toast.success('File processed successfully!');
            }
        } catch (error) {
            console.error('File upload error:', error);
            toast.error(error.response?.data?.message || 'Failed to process file');
        } finally {
            setProcessingFile(false);
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        }
    };

    const handleSendMessage = async (e) => {
        e.preventDefault();

        if (!inputMessage.trim() || loading) return;

        const userMessage = {
            id: Date.now(),
            type: 'user',
            content: inputMessage,
            timestamp: new Date()
        };

        setMessages(prev => [...prev, userMessage]);
        setInputMessage('');
        setLoading(true);

        try {
            const response = await chatbotService.sendMessage(
                inputMessage,
                sessionId
            );

            if (response.success) {
                const botMessage = {
                    id: Date.now() + 1,
                    type: 'bot',
                    content: response.data.message,
                    resources: response.data.resources || [],
                    timestamp: new Date()
                };

                setMessages(prev => [...prev, botMessage]);
            }
        } catch (error) {
            console.error('Send message error:', error);
            toast.error(error.response?.data?.message || 'Failed to send message');

            setMessages(prev => [...prev, {
                id: Date.now() + 1,
                type: 'bot',
                content: 'Sorry, I encountered an error. Please try again.',
                timestamp: new Date(),
                isError: true
            }]);
        } finally {
            setLoading(false);
        }
    };

    const handleClearChat = () => {
        if (confirm('Are you sure you want to clear this conversation?')) {
            setMessages([{
                id: 'welcome',
                type: 'bot',
                content: 'Chat cleared. How can I help you today?',
                timestamp: new Date()
            }]);
            setUploadedFile(null);
            setSessionId(`${user?.id}_${Date.now()}`);
            chatbotService.clearSession(sessionId).catch(console.error);
        }
    };

    const renderResourceCard = (resource) => {
        const icons = {
            youtube: <Youtube className="w-5 h-5 text-red-500" />,
            article: <BookOpen className="w-5 h-5 text-green-500" />,
            documentation: <FileText className="w-5 h-5 text-blue-500" />,
            tutorial: <BookOpen className="w-5 h-5 text-purple-500" />,
            forum: <BookOpen className="w-5 h-5 text-orange-500" />
        };

        return (
            <a
                key={resource.url}
                href={resource.url}
                target="_blank"
                rel="noopener noreferrer"
                className="block p-3 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors border border-gray-200 dark:border-gray-600"
            >
                <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 mt-1">
                        {icons[resource.type] || <FileText className="w-5 h-5" />}
                    </div>
                    <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                            <h4 className="text-sm font-medium text-gray-900 dark:text-white line-clamp-2">
                                {resource.title}
                            </h4>
                            <ExternalLink className="w-4 h-4 text-gray-400 flex-shrink-0" />
                        </div>
                        {resource.description && (
                            <p className="text-xs text-gray-600 dark:text-gray-300 mt-1 line-clamp-2">
                                {resource.description}
                            </p>
                        )}
                        <div className="flex items-center gap-2 mt-2">
                            <span className="text-xs font-medium text-blue-600 dark:text-blue-400">
                                {resource.platform}
                            </span>
                            {resource.channel && (
                                <span className="text-xs text-gray-500">
                                    • {resource.channel}
                                </span>
                            )}
                        </div>
                    </div>
                </div>
            </a>
        );
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-4xl h-[80vh] flex flex-col">
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                            <Bot className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                                AI Learning Assistant
                            </h2>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                                Powered by GPT-3.5
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={handleClearChat}
                            className="text-gray-500 hover:text-gray-700"
                        >
                            <Trash2 className="w-4 h-4" />
                        </Button>
                        <button
                            onClick={onClose}
                            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                        >
                            <X className="w-6 h-6" />
                        </button>
                    </div>
                </div>

                {/* File Upload Info */}
                {uploadedFile && (
                    <div className="px-4 py-2 bg-blue-50 dark:bg-blue-900/20 border-b border-blue-100 dark:border-blue-800">
                        <div className="flex items-center gap-2 text-sm">
                            <FileText className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                            <span className="text-blue-900 dark:text-blue-200 font-medium">
                                {uploadedFile.name}
                            </span>
                            {uploadedFile.pageCount && (
                                <span className="text-blue-600 dark:text-blue-400">
                                    • {uploadedFile.pageCount} pages
                                </span>
                            )}
                        </div>
                    </div>
                )}

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    {messages.map((message) => (
                        <div
                            key={message.id}
                            className={`flex gap-3 ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                        >
                            {message.type === 'bot' && (
                                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
                                    <Bot className="w-5 h-5 text-white" />
                                </div>
                            )}

                            <div className={`max-w-[70%] ${message.type === 'user' ? 'order-first' : ''}`}>
                                <div
                                    className={`rounded-lg p-3 ${message.type === 'user'
                                        ? 'bg-blue-600 text-white'
                                        : message.isError
                                            ? 'bg-red-100 dark:bg-red-900/20 text-red-900 dark:text-red-200'
                                            : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white'
                                        }`}
                                >
                                    <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                                </div>

                                {/* Resources */}
                                {message.resources && message.resources.length > 0 && (
                                    <div className="mt-3 space-y-2">
                                        <p className="text-xs font-medium text-gray-500 dark:text-gray-400 px-1">
                                            📚 Learning Resources:
                                        </p>
                                        {message.resources.map(renderResourceCard)}
                                    </div>
                                )}

                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 px-1">
                                    {new Date(message.timestamp).toLocaleTimeString([], {
                                        hour: '2-digit',
                                        minute: '2-digit'
                                    })}
                                </p>
                            </div>

                            {message.type === 'user' && (
                                <div className="w-8 h-8 bg-gray-300 dark:bg-gray-600 rounded-full flex items-center justify-center flex-shrink-0">
                                    <User className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                                </div>
                            )}
                        </div>
                    ))}

                    {loading && (
                        <div className="flex gap-3">
                            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                                <Bot className="w-5 h-5 text-white" />
                            </div>
                            <div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-3">
                                <div className="flex items-center gap-2">
                                    <Loader2 className="w-4 h-4 animate-spin text-gray-500" />
                                    <span className="text-sm text-gray-600 dark:text-gray-300">
                                        Thinking...
                                    </span>
                                </div>
                            </div>
                        </div>
                    )}

                    <div ref={messagesEndRef} />
                </div>

                {/* Input */}
                <div className="border-t border-gray-200 dark:border-gray-700 p-4">
                    <form onSubmit={handleSendMessage} className="flex gap-2">
                        <input
                            type="file"
                            ref={fileInputRef}
                            onChange={handleFileUpload}
                            accept=".pdf,.ppt,.pptx"
                            className="hidden"
                        />

                        <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            disabled={processingFile}
                            className="flex-shrink-0 px-3 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors disabled:opacity-50"
                        >
                            {processingFile ? (
                                <Loader2 className="w-5 h-5 animate-spin" />
                            ) : (
                                <Upload className="w-5 h-5" />
                            )}
                        </button>

                        <input
                            type="text"
                            value={inputMessage}
                            onChange={(e) => setInputMessage(e.target.value)}
                            placeholder="Ask anything or upload a PDF/PPT..."
                            disabled={loading || processingFile}
                            className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white disabled:opacity-50"
                        />

                        <Button
                            type="submit"
                            disabled={loading || !inputMessage.trim() || processingFile}
                            className="flex-shrink-0"
                        >
                            <Send className="w-5 h-5" />
                        </Button>
                    </form>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 text-center">
                        Upload PDF/PPT files for analysis • Ask questions • Get learning resources
                    </p>
                </div>
            </div>
        </div>
    );
};

export default AIChatbot;
