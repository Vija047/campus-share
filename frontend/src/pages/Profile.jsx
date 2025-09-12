import { useState, useEffect } from 'react';
import { Camera, Save, User, Mail, Building, Calendar, Users, RefreshCw, Bookmark, BookOpen, Download, Heart, Eye } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { authService } from '../services/authService';
import { noteService } from '../services/noteService';
import Input from '../components/common/Input';
import Select from '../components/common/Select';
import Button from '../components/common/Button';
import LoadingSpinner from '../components/common/LoadingSpinner';
import toast from 'react-hot-toast';

const Profile = () => {
    const { user, updateProfile } = useAuth();
    const [isLoading, setIsLoading] = useState(false);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [savedNotes, setSavedNotes] = useState([]);
    const [savedNotesLoading, setSavedNotesLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        department: '',
        semester: '',
        gender: '',
        bio: '',
        profilePicture: ''
    });

    useEffect(() => {
        if (user) {
            console.log('User data received:', user); // Debug log
            setFormData({
                name: user.name || '',
                email: user.email || '',
                department: user.department || '',
                semester: user.semester || '',
                gender: user.gender || '',
                bio: user.bio || '',
                profilePicture: user.profilePicture || ''
            });
            fetchSavedNotes();
        }
    }, [user]);

    const fetchSavedNotes = async () => {
        setSavedNotesLoading(true);
        try {
            const response = await noteService.getBookmarkedNotes(1);
            setSavedNotes(response.data.notes);
        } catch (error) {
            console.error('Error fetching saved notes:', error);
            toast.error('Failed to fetch saved notes');
        } finally {
            setSavedNotesLoading(false);
        }
    };

    const refreshProfile = async () => {
        setIsRefreshing(true);
        try {
            const response = await authService.getCurrentUser();
            if (response.success) {
                console.log('Refreshed user data:', response.data.user); // Debug log
                // The AuthContext will automatically update from the stored user data
                toast.success('Profile data refreshed');
            }
        } catch (error) {
            toast.error('Failed to refresh profile data');
            console.error('Error refreshing profile:', error);
        } finally {
            setIsRefreshing(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            await updateProfile(formData);
            toast.success('Profile updated successfully!');
            setIsEditing(false);
        } catch (error) {
            toast.error('Failed to update profile');
            console.error('Error updating profile:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleImageUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                setFormData((prev) => ({
                    ...prev,
                    profilePicture: e.target.result
                }));
            };
            reader.readAsDataURL(file);
        }
    };

    const formatFileSize = (bytes) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    const formatDate = (date) => {
        return new Date(date).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    const departmentOptions = [
        { value: '', label: 'Select Department' },
        { value: 'Computer Science', label: 'Computer Science' },
        { value: 'Information Technology', label: 'Information Technology' },
        { value: 'Electronics', label: 'Electronics' },
        { value: 'Mechanical', label: 'Mechanical' },
        { value: 'Civil', label: 'Civil' },
        { value: 'Electrical', label: 'Electrical' },
        { value: 'Chemical', label: 'Chemical' },
        { value: 'Biotechnology', label: 'Biotechnology' },
        { value: 'Other', label: 'Other' }
    ];

    const semesterOptions = [
        { value: '', label: 'Select Semester' },
        { value: '1', label: '1st Semester' },
        { value: '2', label: '2nd Semester' },
        { value: '3', label: '3rd Semester' },
        { value: '4', label: '4th Semester' },
        { value: '5', label: '5th Semester' },
        { value: '6', label: '6th Semester' },
        { value: '7', label: '7th Semester' },
        { value: '8', label: '8th Semester' }
    ];

    const genderOptions = [
        { value: '', label: 'Select Gender' },
        { value: 'male', label: 'Male (He/Him)' },
        { value: 'female', label: 'Female (She/Her)' },
        { value: 'other', label: 'Other (They/Them)' }
    ];

    if (!user) {
        return <LoadingSpinner />;
    }

    return (
        <div className="min-h-screen bg-gray-50 py-10">
            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
                {/* Profile Header */}
                <div className="bg-white rounded-2xl shadow-md border border-gray-200 p-8">
                    <div className="flex flex-col md:flex-row items-center md:items-start gap-6 md:gap-10">
                        {/* Profile Picture */}
                        <div className="relative">
                            <div className="w-32 h-32 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden shadow">
                                {formData.profilePicture ? (
                                    <img
                                        src={formData.profilePicture}
                                        alt="Profile"
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <User className="w-16 h-16 text-gray-400" />
                                )}
                            </div>
                            {isEditing && (
                                <label className="absolute bottom-0 right-0 bg-blue-600 rounded-full p-2 cursor-pointer hover:bg-blue-700 transition">
                                    <Camera className="w-4 h-4 text-white" />
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={handleImageUpload}
                                        className="hidden"
                                    />
                                </label>
                            )}
                        </div>

                        {/* Profile Info */}
                        <div className="flex-1 text-center md:text-left">
                            <h1 className="text-3xl font-bold text-gray-900">{user.name}</h1>
                            <p className="text-gray-600 mt-1">{user.email}</p>
                            <div className="flex flex-wrap gap-4 mt-4 justify-center md:justify-start">
                                <span className="flex items-center text-sm text-gray-500">
                                    <Building className="w-4 h-4 mr-1" />
                                    {user.department || 'Not specified'}
                                </span>
                                <span className="flex items-center text-sm text-gray-500">
                                    <Calendar className="w-4 h-4 mr-1" />
                                    Semester {user.semester || 'Not specified'}
                                </span>
                                <span className="flex items-center text-sm text-gray-500">
                                    <Users className="w-4 h-4 mr-1" />
                                    {user.gender === 'male'
                                        ? 'He/Him'
                                        : user.gender === 'female'
                                            ? 'She/Her'
                                            : 'They/Them'}
                                </span>
                            </div>
                        </div>

                        {/* Edit Button */}
                        <div className="flex gap-2">
                            <Button
                                onClick={refreshProfile}
                                variant="secondary"
                                loading={isRefreshing}
                                className="px-4"
                                icon={RefreshCw}
                            >
                                Refresh
                            </Button>
                            <Button
                                onClick={() => setIsEditing(!isEditing)}
                                variant={isEditing ? 'secondary' : 'primary'}
                                className="px-6"
                            >
                                {isEditing ? 'Cancel' : 'Edit Profile'}
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Profile Form or Details */}
                {isEditing ? (
                    <div className="bg-white rounded-2xl shadow-md border border-gray-200 p-8">
                        <h2 className="text-2xl font-semibold text-gray-900 mb-6">Edit Profile</h2>
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <Input
                                    type="text"
                                    name="name"
                                    label="Full Name *"
                                    value={formData.name}
                                    onChange={handleInputChange}
                                    required
                                    icon={User}
                                />
                                <Input
                                    type="email"
                                    name="email"
                                    label="Email Address *"
                                    value={formData.email}
                                    onChange={handleInputChange}
                                    required
                                    icon={Mail}
                                />
                                <Select
                                    name="department"
                                    label="Department *"
                                    value={formData.department}
                                    onChange={handleInputChange}
                                    options={departmentOptions}
                                    required
                                />
                                <Select
                                    name="semester"
                                    label="Current Semester *"
                                    value={formData.semester}
                                    onChange={handleInputChange}
                                    options={semesterOptions}
                                    required
                                />
                                <Select
                                    name="gender"
                                    label="Gender Pronouns *"
                                    value={formData.gender}
                                    onChange={handleInputChange}
                                    options={genderOptions}
                                    required
                                    className="md:col-span-2"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Bio</label>
                                <textarea
                                    name="bio"
                                    value={formData.bio}
                                    onChange={handleInputChange}
                                    rows="4"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                    placeholder="Tell us about yourself..."
                                />
                            </div>
                            <div className="flex justify-end">
                                <Button type="submit" loading={isLoading} className="px-8" icon={Save}>
                                    Save Changes
                                </Button>
                            </div>
                        </form>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Personal Information */}
                        <div className="lg:col-span-2">
                            <div className="bg-white rounded-2xl shadow-md border border-gray-200 p-8">
                                <h2 className="text-xl font-semibold text-gray-900 mb-6">Personal Information</h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <InfoItem label="Full Name" value={user.name} />
                                    <InfoItem label="Email" value={user.email} />
                                    <InfoItem label="Department" value={user.department || 'Not specified'} />
                                    <InfoItem label="Semester" value={user.semester ? `${user.semester}` : 'Not specified'} />
                                    <InfoItem
                                        label="Gender"
                                        value={
                                            user.gender === 'male'
                                                ? 'Male (He/Him)'
                                                : user.gender === 'female'
                                                    ? 'Female (She/Her)'
                                                    : user.gender === 'other'
                                                        ? 'Other (They/Them)'
                                                        : 'Not specified'
                                        }
                                    />
                                </div>
                                {user.bio && (
                                    <div className="mt-6">
                                        <h3 className="text-sm font-medium text-gray-500 mb-1">Bio</h3>
                                        <p className="text-gray-900">{user.bio}</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Statistics */}
                        <div>
                            <div className="bg-white rounded-2xl shadow-md border border-gray-200 p-6 mb-6">
                                <h3 className="text-lg font-semibold text-gray-900 mb-4">Activity Stats</h3>
                                <StatItem label="Notes Uploaded" value={user.notesUploaded || 0} color="text-blue-600" />
                                <StatItem label="Likes Received" value={user.likesReceived || 0} color="text-green-600" />
                                <StatItem
                                    label="Member Since"
                                    value={user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
                                    color="text-gray-900"
                                />
                            </div>


                        </div>

                        {/* Saved Notes Section */}
                        <div className="bg-white rounded-2xl shadow-md border border-gray-200 p-6">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                                    <Bookmark className="w-5 h-5 mr-2 text-blue-600" />
                                    Saved Notes
                                </h3>
                                <span className="text-sm text-gray-500">
                                    {savedNotes.length} saved
                                </span>
                            </div>

                            {savedNotesLoading ? (
                                <div className="flex justify-center py-8">
                                    <LoadingSpinner />
                                </div>
                            ) : savedNotes.length === 0 ? (
                                <div className="text-center py-8">
                                    <BookOpen className="mx-auto w-12 h-12 text-gray-400 mb-2" />
                                    <p className="text-gray-500">No saved notes yet</p>
                                    <p className="text-sm text-gray-400">Bookmark notes to see them here</p>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {savedNotes.slice(0, 5).map((note) => (
                                        <div key={note._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                                            <div className="flex-1 min-w-0">
                                                <h4 className="text-sm font-medium text-gray-900 truncate">
                                                    {note.title}
                                                </h4>
                                                <div className="flex items-center text-xs text-gray-500 mt-1 space-x-3">
                                                    <span className="flex items-center">
                                                        <BookOpen className="w-3 h-3 mr-1" />
                                                        {note.subject}
                                                    </span>
                                                    <span className="flex items-center">
                                                        <Calendar className="w-3 h-3 mr-1" />
                                                        Sem {note.semester}
                                                    </span>
                                                    <span>{formatFileSize(note.fileSize)}</span>
                                                </div>
                                            </div>
                                            <div className="flex items-center space-x-2 ml-3">
                                                <div className="flex items-center text-xs text-gray-400 space-x-2">
                                                    <span className="flex items-center">
                                                        <Heart className="w-3 h-3 mr-1" />
                                                        {note.likes?.length || 0}
                                                    </span>
                                                    <span className="flex items-center">
                                                        <Download className="w-3 h-3 mr-1" />
                                                        {note.downloads || 0}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                    {savedNotes.length > 5 && (
                                        <div className="text-center mt-3">
                                            <button
                                                onClick={() => window.location.href = '/bookmarks'}
                                                className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                                            >
                                                View all {savedNotes.length} saved notes
                                            </button>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

// Small reusable components
const InfoItem = ({ label, value }) => (
    <div>
        <h3 className="text-sm font-medium text-gray-500">{label}</h3>
        <p className="text-gray-900 font-medium">{value}</p>
    </div>
);

const StatItem = ({ label, value, color }) => (
    <div className="flex justify-between items-center py-2 border-b border-gray-100 last:border-0">
        <span className="text-gray-600">{label}</span>
        <span className={`font-semibold ${color}`}>{value}</span>
    </div>
);

export default Profile;
