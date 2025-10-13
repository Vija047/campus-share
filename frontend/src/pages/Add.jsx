import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { postService } from '../services/postService';
import toast from 'react-hot-toast';

const Add = () => {
    const [content, setContent] = useState('');
    const [semester, setSemester] = useState('general');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!content || content.trim().length < 10) {
            toast.error('Content must be at least 10 characters');
            return;
        }

        setLoading(true);
        try {
            const data = { content: content.trim(), semester };
            const res = await postService.createPost(data);
            toast.success(res.message || 'Post created');
            navigate('/dashboard');
        } catch (err) {
            console.error('Create post failed', err);
            // postService and api already show toast for errors; add fallback
            toast.error(err?.response?.data?.message || 'Failed to create post');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-3xl mx-auto p-6">
            <h1 className="text-2xl font-semibold mb-4">Create a Post</h1>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700">Content</label>
                    <textarea
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        rows={6}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                        placeholder="Share something helpful (10+ characters)..."
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700">Semester</label>
                    <select
                        value={semester}
                        onChange={(e) => setSemester(e.target.value)}
                        className="mt-1 block w-48 rounded-md border-gray-300 shadow-sm"
                    >
                        <option value="general">General</option>
                        <option value="1">1</option>
                        <option value="2">2</option>
                        <option value="3">3</option>
                        <option value="4">4</option>
                        <option value="5">5</option>
                        <option value="6">6</option>
                        <option value="7">7</option>
                        <option value="8">8</option>
                    </select>
                </div>

                <div className="flex items-center space-x-3">
                    <button
                        type="submit"
                        className={`px-4 py-2 bg-gradient-primary text-white rounded-md ${loading ? 'opacity-60 cursor-wait' : ''}`}
                        disabled={loading}
                    >
                        {loading ? 'Creating...' : 'Create Post'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default Add;
