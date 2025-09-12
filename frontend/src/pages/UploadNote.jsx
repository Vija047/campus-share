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
    AlertCircle
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
        description: '',
        tags: '',
        file: null
    });

    // Check backend connectivity on component mount
    React.useEffect(() => {
        const checkBackend = async () => {
            try {
                const response = await fetch('http://localhost:5000/api/test');
                if (response.ok) {
                    setBackendStatus('connected');
                } else {
                    setBackendStatus('disconnected');
                }
            } catch (error) {
                console.error('Backend connectivity check failed:', error);
                setBackendStatus('disconnected');
            }
        };
        checkBackend();
    }, []);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleFileSelect = (file) => {
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
            'image/gif'
        ];

        if (!allowedTypes.includes(file.type)) {
            toast.error('Please upload a valid file (PDF, DOC, DOCX, PPT, PPTX, TXT, or image)');
            return;
        }

        // Validate file size (max 50MB)
        const maxSize = 50 * 1024 * 1024; // 50MB
        if (file.size > maxSize) {
            toast.error('File size must be less than 50MB');
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
        if (!formData.subject.trim()) {
            toast.error('Please enter a subject');
            return;
        }
        if (!formData.semester) {
            toast.error('Please select a semester');
            return;
        }
        if (!formData.description.trim()) {
            toast.error('Please enter a description');
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
            uploadData.append('description', formData.description.trim() || 'No description provided');
            uploadData.append('tags', formData.tags.trim());
            uploadData.append('file', formData.file);

            console.log('Uploading note with data:', {
                title: formData.title.trim(),
                subject: formData.subject.trim(),
                semester: formData.semester,
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
                const validationErrors = error.response.data.errors.map(err => err.msg || err.message).join(', ');
                errorMessage = `Validation error: ${validationErrors}`;
            } else if (error.message) {
                errorMessage = error.message;
            } else if (error.code === 'NETWORK_ERROR') {
                errorMessage = 'Network error. Please check your connection and try again.';
            }

            toast.error(errorMessage);
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
                        <div className="flex items-center space-x-2">
                            <div className={`w-3 h-3 rounded-full ${backendStatus === 'connected' ? 'bg-green-500' :
                                backendStatus === 'disconnected' ? 'bg-red-500' : 'bg-yellow-500'
                                }`}></div>
                            <span className="text-sm text-gray-600">
                                {backendStatus === 'connected' ? 'Connected' :
                                    backendStatus === 'disconnected' ? 'Disconnected' : 'Checking...'}
                            </span>
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
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    <FileText className="inline w-4 h-4 mr-1" />
                                    Title *
                                </label>
                                <Input
                                    type="text"
                                    name="title"
                                    value={formData.title}
                                    onChange={handleInputChange}
                                    placeholder="Enter note title"
                                    required
                                />
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
                                Description *
                            </label>
                            <Textarea
                                name="description"
                                value={formData.description}
                                onChange={handleInputChange}
                                placeholder="Provide a brief description of the note content..."
                                rows={4}
                                required
                            />
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
