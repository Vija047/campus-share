import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { noteService } from '../services/noteService.js';
import { useAuth } from '../hooks/useAuth.js';
import {
    Upload,
    FileText,
    X,
    BookOpen,
    Calendar,
    Tag,
    AlignLeft,
    CheckCircle,
    AlertCircle,
    GraduationCap
} from 'lucide-react';
import Button from '../components/common/Button.jsx';
import Input from '../components/common/Input.jsx';
import Textarea from '../components/common/Textarea.jsx';
import Select from '../components/common/Select.jsx';
import toast from 'react-hot-toast';

const UploadNote = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [dragActive, setDragActive] = useState(false);
    const [backendStatus, setBackendStatus] = useState('checking');
    const [formData, setFormData] = useState({
        title: '',
        subject: '',
        semester: user?.semester || '',
        examType: '',
        description: '',
        tags: '',
        file: null
    });

    // Check backend connectivity on component mount
    React.useEffect(() => {
        const checkBackend = async () => {
            try {
                const apiUrl = import.meta.env.VITE_API_URL || 'ttps://campus-share.onrender.com';
                const response = await fetch(`${apiUrl}/test`, {
                    timeout: 5000
                });
                if (response.ok) {  
                    setBackendStatus('connected');
                    console.log('Backend connection successful');
                } else {
                    console.error('Backend responded with error:', response.status);
                    setBackendStatus('disconnected');
                }
            } catch (error) {
                console.error('Backend connectivity check failed:', error);
                setBackendStatus('disconnected');
            }
        };
        checkBackend();

        // Recheck every 30 seconds if disconnected
        const interval = setInterval(() => {
            if (backendStatus === 'disconnected') {
                checkBackend();
            }
        }, 30000);

        return () => clearInterval(interval);
    }, [backendStatus]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleFileSelect = (file) => {
        console.log('File selected:', {
            name: file.name,
            type: file.type,
            size: file.size
        });

        // Validate file type
        const allowedTypes = [
            'application/pdf',
            'application/msword',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'application/vnd.ms-powerpoint',
            'application/vnd.openxmlformats-officedocument.presentationml.presentation',
            'text/plain',
            'image/jpeg',
            'image/png',
            'image/jpg',
            'image/gif'
        ];

        if (!allowedTypes.includes(file.type)) {
            console.error('Invalid file type:', file.type);
            toast.error(`Invalid file type: ${file.type}. Please upload PDF, DOC, DOCX, PPT, PPTX, TXT, or image files.`);
            return;
        }

        // Validate file size (max 50MB)
        const maxSize = 50 * 1024 * 1024; // 50MB
        if (file.size > maxSize) {
            toast.error(`File size (${formatFileSize(file.size)}) exceeds the 50MB limit`);
            return;
        }

        // Check for empty files
        if (file.size === 0) {
            toast.error('Cannot upload empty files');
            return;
        }

        setFormData(prev => ({
            ...prev,
            file
        }));

        // Warn about large files
        if (file.size > 10 * 1024 * 1024) { // 10MB
            toast.success(`Large file selected (${formatFileSize(file.size)}). Upload may take a few minutes.`, {
                duration: 4000
            });
        } else {
            toast.success(`File selected: ${file.name} (${formatFileSize(file.size)})`);
        }
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            handleFileSelect(file);
        }
    };

    const handleDrag = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === 'dragenter' || e.type === 'dragover') {
            setDragActive(true);
        } else if (e.type === 'dragleave') {
            setDragActive(false);
        }
    };

    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);

        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            handleFileSelect(e.dataTransfer.files[0]);
        }
    };

    const removeFile = () => {
        setFormData(prev => ({
            ...prev,
            file: null
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validation
        if (!formData.title.trim()) {
            toast.error('Please enter a title');
            return;
        }
        if (formData.title.trim().length < 3) {
            toast.error('Title must be at least 3 characters long');
            return;
        }
        if (formData.title.trim().length > 100) {
            toast.error('Title must be less than 100 characters long');
            return;
        }
        if (!formData.subject.trim()) {
            toast.error('Please enter a subject');
            return;
        }
        if (!formData.semester) {
            toast.error('Please select a semester');
            return;
        }
        if (!formData.examType) {
            toast.error('Please select an exam type');
            return;
        }
        // Description is optional, but if provided, validate length
        if (formData.description.trim() && formData.description.trim().length > 500) {
            toast.error('Description must be less than 500 characters long');
            return;
        }
        if (!formData.file) {
            toast.error('Please select a file');
            return;
        }

        try {
            setLoading(true);

            const uploadData = new FormData();
            uploadData.append('title', formData.title.trim());
            uploadData.append('subject', formData.subject.trim());
            uploadData.append('semester', String(formData.semester));
            uploadData.append('examType', formData.examType);
            uploadData.append('description', formData.description.trim() || 'No description provided');
            uploadData.append('tags', formData.tags.trim());
            uploadData.append('file', formData.file);

            console.log('Uploading note with data:', {
                title: formData.title.trim(),
                subject: formData.subject.trim(),
                semester: formData.semester,
                examType: formData.examType,
                fileName: formData.file.name,
                fileSize: formData.file.size,
                fileType: formData.file.type
            });

            await noteService.uploadNote(uploadData);

            toast.success('Note uploaded successfully!');
            navigate('/notes');
        } catch (error) {
            console.error('Upload error:', error);
            let errorMessage = 'Failed to upload note';

            if (error.response?.data?.message) {
                errorMessage = error.response.data.message;
            } else if (error.response?.data?.errors && Array.isArray(error.response.data.errors)) {
                // Handle validation errors
                const validationErrors = error.response.data.errors.map(err => err.msg || err.message || err).join(', ');
                errorMessage = `Validation error: ${validationErrors}`;
            } else if (error.response?.status === 413) {
                errorMessage = 'File too large. Maximum size is 50MB.';
            } else if (error.response?.status === 415) {
                errorMessage = 'Invalid file type. Please upload PDF, DOC, DOCX, PPT, PPTX, TXT, or image files.';
            } else if (error.response?.status === 401) {
                errorMessage = 'Authentication failed. Please log in again.';
            } else if (error.response?.status === 403) {
                errorMessage = 'Access denied. Please check your permissions.';
            } else if (error.response?.status >= 500) {
                errorMessage = 'Server error. Please try again later.';
            } else if (error.message) {
                errorMessage = error.message;
            } else if (error.code === 'NETWORK_ERROR' || !error.response) {
                errorMessage = 'Network error. Please check your connection and try again.';
            }

            toast.error(errorMessage, {
                duration: 5000,
                position: 'top-center'
            });
        } finally {
            setLoading(false);
        }
    };

    const formatFileSize = (bytes) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    const getFileIcon = (fileType) => {
        if (fileType?.includes('pdf')) return '📄';
        if (fileType?.includes('word') || fileType?.includes('document')) return '📝';
        if (fileType?.includes('presentation') || fileType?.includes('powerpoint')) return '📊';
        if (fileType?.includes('text')) return '📃';
        if (fileType?.includes('image')) return '🖼️';
        return '📁';
    };

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="mb-8">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900 mb-2">Upload Note</h1>
                            <p className="text-gray-600">Share your study materials with fellow students</p>
                        </div>

                    </div>
                </div>

                {/* Upload Form */}
                {backendStatus === 'disconnected' && (
                    <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
                        <div className="flex items-center">
                            <AlertCircle className="w-5 h-5 text-red-500 mr-2" />
                            <p className="text-red-700">
                                Unable to connect to the server. Please ensure the backend is running on port 5000.
                            </p>
                        </div>
                    </div>
                )}

                <div className={`bg-white rounded-lg shadow-sm border border-gray-200${backendStatus === 'connected' ? '' : ' opacity-75'}`}>
                    <form onSubmit={handleSubmit} className="p-6 space-y-6">
                        {/* File Upload Area */}
                        <div className="space-y-4">
                            <h3 className="text-lg font-medium text-gray-900 flex items-center">
                                <Upload className="w-5 h-5 mr-2" />
                                Select File
                            </h3>

                            {!formData.file ? (
                                <div
                                    className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-colors ${dragActive
                                        ? 'border-blue-500 bg-blue-50'
                                        : 'border-gray-300 hover:border-gray-400'
                                        }`}
                                    onDragEnter={handleDrag}
                                    onDragLeave={handleDrag}
                                    onDragOver={handleDrag}
                                    onDrop={handleDrop}
                                >
                                    <input
                                        type="file"
                                        onChange={handleFileChange}
                                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                        accept=".pdf,.doc,.docx,.ppt,.pptx,.txt,.jpg,.jpeg,.png,.gif"
                                    />
                                    <FileText className="mx-auto w-12 h-12 text-gray-400 mb-4" />
                                    <p className="text-lg font-medium text-gray-900 mb-2">
                                        Drop your file here or click to browse
                                    </p>
                                    <p className="text-sm text-gray-600">
                                        Supports PDF, DOC, DOCX, PPT, PPTX, TXT, and images (max 50MB)
                                    </p>
                                </div>
                            ) : (
                                <div className="bg-gray-50 rounded-lg p-4">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center space-x-3">
                                            <span className="text-2xl">
                                                {getFileIcon(formData.file.type)}
                                            </span>
                                            <div>
                                                <p className="font-medium text-gray-900">
                                                    {formData.file.name}
                                                </p>
                                                <p className="text-sm text-gray-600">
                                                    {formatFileSize(formData.file.size)}
                                                </p>
                                            </div>
                                        </div>
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="sm"
                                            onClick={removeFile}
                                            icon={X}
                                        >
                                            Remove
                                        </Button>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Note Details */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    <FileText className="inline w-4 h-4 mr-1" />
                                    Title *
                                    <span className="text-xs text-gray-500 ml-1">
                                        ({formData.title.length}/100 chars, min 3)
                                    </span>
                                </label>
                                <Input
                                    type="text"
                                    name="title"
                                    value={formData.title}
                                    onChange={handleInputChange}
                                    placeholder="Enter note title (minimum 3 characters)"
                                    required
                                    minLength={3}
                                    maxLength={100}
                                    className={formData.title.length > 0 && formData.title.length < 3
                                        ? 'border-red-300 focus:border-red-500 focus:ring-red-200'
                                        : ''
                                    }
                                />
                                {formData.title.length > 0 && formData.title.length < 3 && (
                                    <p className="mt-1 text-sm text-red-600">
                                        Title must be at least 3 characters long
                                    </p>
                                )}
                                {formData.title.length > 100 && (
                                    <p className="mt-1 text-sm text-red-600">
                                        Title must be less than 100 characters long
                                    </p>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    <BookOpen className="inline w-4 h-4 mr-1" />
                                    Subject *
                                </label>
                                <Input
                                    type="text"
                                    name="subject"
                                    value={formData.subject}
                                    onChange={handleInputChange}
                                    placeholder="e.g., Data Structures, Calculus"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    <Calendar className="inline w-4 h-4 mr-1" />
                                    Semester *
                                </label>
                                <Select
                                    name="semester"
                                    value={formData.semester}
                                    onChange={handleInputChange}
                                    required
                                >
                                    <option value="">Select Semester</option>
                                    <option value="1">Semester 1</option>
                                    <option value="2">Semester 2</option>
                                    <option value="3">Semester 3</option>
                                    <option value="4">Semester 4</option>
                                    <option value="5">Semester 5</option>
                                    <option value="6">Semester 6</option>
                                    <option value="7">Semester 7</option>
                                    <option value="8">Semester 8</option>
                                </Select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    <GraduationCap className="inline w-4 h-4 mr-1" />
                                    Exam Type *
                                </label>
                                <Select
                                    name="examType"
                                    value={formData.examType}
                                    onChange={handleInputChange}
                                    required
                                >
                                    <option value="">Select Exam Type</option>
                                    <option value="Mid-term">Mid-term Exam</option>
                                    <option value="Final">Final Exam</option>
                                    <option value="Quiz">Quiz</option>
                                    <option value="Assignment">Assignment</option>
                                    <option value="Lab Report">Lab Report</option>
                                    <option value="Project">Project</option>
                                    <option value="Study Material">Study Material</option>
                                    <option value="Other">Other</option>
                                </Select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    <Tag className="inline w-4 h-4 mr-1" />
                                    Tags
                                </label>
                                <Input
                                    type="text"
                                    name="tags"
                                    value={formData.tags}
                                    onChange={handleInputChange}
                                    placeholder="e.g., algorithms, sorting, data structures"
                                />
                                <p className="text-xs text-gray-500 mt-1">
                                    Separate multiple tags with commas
                                </p>
                            </div>
                        </div>

                        {/* Description */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                <AlignLeft className="inline w-4 h-4 mr-1" />
                                Description
                                <span className="text-xs text-gray-500 ml-1">
                                    (optional, {formData.description.length}/500 chars)
                                </span>
                            </label>
                            <Textarea
                                name="description"
                                value={formData.description}
                                onChange={handleInputChange}
                                placeholder="Provide a brief description of the note content (optional)..."
                                rows={4}
                                maxLength={500}
                                className={formData.description.length > 500
                                    ? 'border-red-300 focus:border-red-500 focus:ring-red-200'
                                    : ''
                                }
                            />
                            {formData.description.length > 500 && (
                                <p className="mt-1 text-sm text-red-600">
                                    Description must be less than 500 characters long
                                </p>
                            )}
                            <p className="text-xs text-gray-500 mt-1">
                                Describe what this note contains and what topics it covers
                            </p>
                        </div>

                        {/* Submit Button */}
                        <div className="flex items-center justify-end space-x-4 pt-6 border-t border-gray-200">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => navigate('/notes')}
                            >
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                variant="primary"
                                loading={loading}
                                disabled={loading || backendStatus !== 'connected'}
                                icon={loading ? undefined : CheckCircle}
                            >
                                {loading ? 'Uploading...' : 'Upload Note'}
                            </Button>
                        </div>
                    </form>
                </div>

                {/* Tips */}
                <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
                    <h3 className="text-lg font-medium text-blue-900 mb-4">Upload Tips</h3>
                    <ul className="space-y-2 text-sm text-blue-800">
                        <li className="flex items-start">
                            <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                            Use clear, descriptive titles that indicate the topic and content
                        </li>
                        <li className="flex items-start">
                            <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                            Select the correct exam type to help others find relevant materials
                        </li>
                        <li className="flex items-start">
                            <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                            Add relevant tags to help others find your notes
                        </li>
                        <li className="flex items-start">
                            <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                            Ensure your notes are well-organized and legible
                        </li>
                        <li className="flex items-start">
                            <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                            Only upload original content or properly attributed materials
                        </li>
                    </ul>
                </div>
            </div>
        </div>
    );
};

export default UploadNote;
