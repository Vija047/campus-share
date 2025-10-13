import { useState } from 'react';
import { X, Send, Hash, Users } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

const CreatePost = ({ onCreatePost, onClose, isModal = false }) => {
    const { user } = useAuth();
    const [content, setContent] = useState('');
    const [semester, setSemester] = useState('general');
    const [category, setCategory] = useState('general');
    const [tags, setTags] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const categories = [
        { value: 'general', label: 'General Discussion' },
        { value: 'academic', label: 'Academic Help' },
        { value: 'projects', label: 'Projects & Assignments' },
        { value: 'internships', label: 'Internships & Jobs' },
        { value: 'events', label: 'Campus Events' },
        { value: 'resources', label: 'Study Resources' },
        { value: 'announcements', label: 'Announcements' }
    ];

    const semesters = [
        { value: 'general', label: 'All Semesters' },
        { value: '1', label: '1st Semester' },
        { value: '2', label: '2nd Semester' },
        { value: '3', label: '3rd Semester' },
        { value: '4', label: '4th Semester' },
        { value: '5', label: '5th Semester' },
        { value: '6', label: '6th Semester' },
        { value: '7', label: '7th Semester' },
        { value: '8', label: '8th Semester' }
    ];

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!content.trim() || isSubmitting) return;

        setIsSubmitting(true);
        try {
            const postData = {
                content: content.trim(),
                semester,
                category,
                tags: tags
                    .split(',')
                    .map(tag => tag.trim())
                    .filter(tag => tag.length > 0)
            };

            await onCreatePost(postData);

            // Reset form
            setContent('');
            setSemester('general');
            setCategory('general');
            setTags('');

            if (onClose) onClose();
        } catch (error) {
            console.error('Error creating post:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const characterCount = content.length;
    const maxCharacters = 1000;
    const isNearLimit = characterCount > maxCharacters * 0.8;

    const formContent = (
        <form onSubmit={handleSubmit} className="space-y-4">
            {/* User Info */}
            <div className="flex items-center space-x-3 pb-4 border-b border-gray-100">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold">
                    {user?.name?.charAt(0).toUpperCase() || 'U'}
                </div>
                <div>
                    <h4 className="font-semibold text-gray-900">{user?.name || 'User'}</h4>
                    <p className="text-sm text-gray-500">Share your thoughts with the community</p>
                </div>
            </div>

            {/* Content */}
            <div>
                <textarea
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="What's on your mind? Share a question, start a discussion, or help a fellow student..."
                    className="w-full p-4 border border-gray-200 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    rows={isModal ? "6" : "4"}
                    maxLength={maxCharacters}
                    required
                />
                <div className="flex justify-between items-center mt-2">
                    <span className="text-xs text-gray-500">
                        Minimum 10 characters required
                    </span>
                    <span className={`text-xs ${isNearLimit ? 'text-orange-500' : 'text-gray-500'
                        }`}>
                        {characterCount}/{maxCharacters}
                    </span>
                </div>
            </div>

            {/* Category and Semester Selection */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        <Users className="w-4 h-4 inline mr-1" />
                        Category
                    </label>
                    <select
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                        className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                        {categories.map((cat) => (
                            <option key={cat.value} value={cat.value}>
                                {cat.label}
                            </option>
                        ))}
                    </select>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Semester
                    </label>
                    <select
                        value={semester}
                        onChange={(e) => setSemester(e.target.value)}
                        className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                        {semesters.map((sem) => (
                            <option key={sem.value} value={sem.value}>
                                {sem.label}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Tags */}
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Hash className="w-4 h-4 inline mr-1" />
                    Tags (optional)
                </label>
                <input
                    type="text"
                    value={tags}
                    onChange={(e) => setTags(e.target.value)}
                    placeholder="study-tips, programming, exams (separate with commas)"
                    className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <p className="text-xs text-gray-500 mt-1">
                    Add relevant tags to help others find your post
                </p>
            </div>

            {/* Submit Button */}
            <div className="flex justify-end space-x-3 pt-4">
                {isModal && (
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-6 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                    >
                        Cancel
                    </button>
                )}
                <button
                    type="submit"
                    disabled={isSubmitting || content.trim().length < 10}
                    className="flex items-center px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    <Send className="w-4 h-4 mr-2" />
                    {isSubmitting ? 'Posting...' : 'Post'}
                </button>
            </div>
        </form>
    );

    if (isModal) {
        return (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                    {/* Modal Header */}
                    <div className="flex items-center justify-between p-6 border-b border-gray-100">
                        <h2 className="text-xl font-semibold text-gray-900">Create New Post</h2>
                        <button
                            onClick={onClose}
                            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                        >
                            <X className="w-5 h-5 text-gray-500" />
                        </button>
                    </div>

                    {/* Modal Content */}
                    <div className="p-6">
                        {formContent}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Start a Discussion</h3>
            {formContent}
        </div>
    );
};

export default CreatePost;