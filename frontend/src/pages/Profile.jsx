import { useState, useEffect } from 'react';
import { Camera, Save, User, Mail, Building, Calendar, Users, RefreshCw, Bookmark, BookOpen, Download, Heart, Eye, Edit3, MapPin, Star, Award, TrendingUp, Activity } from 'lucide-react';
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
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-30 pointer-events-none"
                style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23f3f4f6' fill-opacity='0.3'%3E%3Ccircle cx='30' cy='30' r='1'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
                    backgroundSize: '60px 60px'
                }}>
            </div>

            <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8 space-y-6 lg:space-y-8">
                {/* Profile Header with Gradient Card */}
                <div className="relative overflow-hidden bg-white rounded-2xl lg:rounded-3xl shadow-xl border border-gray-100">
                    {/* Gradient Background */}
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-600 via-purple-600 to-pink-500 opacity-5"></div>
                    <div className="absolute top-0 right-0 w-64 h-64 lg:w-96 lg:h-96 bg-gradient-to-bl from-blue-400/10 to-purple-500/10 rounded-full -translate-y-1/2 translate-x-1/2"></div>
                    <div className="absolute bottom-0 left-0 w-48 h-48 lg:w-64 lg:h-64 bg-gradient-to-tr from-pink-400/10 to-blue-500/10 rounded-full translate-y-1/2 -translate-x-1/2"></div>

                    <div className="relative p-6 lg:p-12">
                        <div className="flex flex-col lg:flex-row items-center lg:items-start gap-6 lg:gap-8">
                            {/* Enhanced Profile Picture */}
                            <div className="relative group">
                                <div className="w-28 h-28 lg:w-36 lg:h-36 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 p-1 shadow-2xl">
                                    <div className="w-full h-full rounded-full bg-white p-1">
                                        <div className="w-full h-full rounded-full overflow-hidden bg-gray-100 flex items-center justify-center">
                                            {formData.profilePicture ? (
                                                <img
                                                    src={formData.profilePicture}
                                                    alt="Profile"
                                                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                                                />
                                            ) : (
                                                <User className="w-12 h-12 lg:w-16 lg:h-16 text-gray-400" />
                                            )}
                                        </div>
                                    </div>
                                </div>
                                {isEditing && (
                                    <label className="absolute bottom-2 right-2 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full p-2 lg:p-3 cursor-pointer hover:from-blue-700 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105">
                                        <Camera className="w-4 h-4 lg:w-5 lg:h-5 text-white" />
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={handleImageUpload}
                                            className="hidden"
                                        />
                                    </label>
                                )}
                                {/* Online Status Indicator */}
                                <div className="absolute bottom-3 right-3 lg:bottom-4 lg:right-4 w-3 h-3 lg:w-4 lg:h-4 bg-green-500 rounded-full border-2 border-white shadow-lg"></div>
                            </div>

                            {/* Enhanced Profile Info */}
                            <div className="flex-1 text-center lg:text-left space-y-3 lg:space-y-4">
                                <div>
                                    <h1 className="text-3xl lg:text-4xl xl:text-5xl font-bold bg-gradient-to-r from-gray-900 via-blue-800 to-purple-800 bg-clip-text text-transparent leading-tight">
                                        {user.name}
                                    </h1>
                                    <p className="text-lg lg:text-xl text-gray-600 mt-2 flex items-center justify-center lg:justify-start">
                                        <Mail className="w-4 h-4 lg:w-5 lg:h-5 mr-2 text-blue-500" />
                                        <span className="truncate">{user.email}</span>
                                    </p>
                                </div>

                                {/* Enhanced Info Tags */}
                                <div className="flex flex-wrap gap-2 lg:gap-3 justify-center lg:justify-start">
                                    {user.department && (
                                        <div className="flex items-center px-3 lg:px-4 py-1 lg:py-2 bg-blue-50 border border-blue-200 rounded-full text-blue-700 hover:bg-blue-100 transition-colors">
                                            <Building className="w-3 h-3 lg:w-4 lg:h-4 mr-1 lg:mr-2" />
                                            <span className="font-medium text-xs lg:text-sm">{user.department}</span>
                                        </div>
                                    )}
                                    {user.semester && (
                                        <div className="flex items-center px-3 lg:px-4 py-1 lg:py-2 bg-purple-50 border border-purple-200 rounded-full text-purple-700 hover:bg-purple-100 transition-colors">
                                            <Calendar className="w-3 h-3 lg:w-4 lg:h-4 mr-1 lg:mr-2" />
                                            <span className="font-medium text-xs lg:text-sm">Semester {user.semester}</span>
                                        </div>
                                    )}
                                    {user.gender && (
                                        <div className="flex items-center px-3 lg:px-4 py-1 lg:py-2 bg-pink-50 border border-pink-200 rounded-full text-pink-700 hover:bg-pink-100 transition-colors">
                                            <Users className="w-3 h-3 lg:w-4 lg:h-4 mr-1 lg:mr-2" />
                                            <span className="font-medium text-xs lg:text-sm">
                                                {user.gender === 'male' ? 'He/Him' : user.gender === 'female' ? 'She/Her' : 'They/Them'}
                                            </span>
                                        </div>
                                    )}
                                </div>

                                {/* Bio Preview */}
                                {user.bio && (
                                    <div className="bg-gray-50 rounded-xl lg:rounded-2xl p-3 lg:p-4 border border-gray-200">
                                        <p className="text-sm lg:text-base text-gray-700 italic leading-relaxed">"{user.bio}"</p>
                                    </div>
                                )}
                            </div>

                            {/* Enhanced Action Buttons */}
                            <div className="flex flex-col sm:flex-row gap-2 lg:gap-3 w-full lg:w-auto">
                                <Button
                                    onClick={refreshProfile}
                                    variant="outline"
                                    loading={isRefreshing}
                                    className="px-4 lg:px-6 py-2 lg:py-3 border-gray-300 hover:border-blue-400 hover:text-blue-600 transition-all duration-300 text-sm lg:text-base"
                                    icon={RefreshCw}
                                >
                                    Refresh
                                </Button>
                                <Button
                                    onClick={() => setIsEditing(!isEditing)}
                                    variant={isEditing ? 'secondary' : 'primary'}
                                    className={`px-6 lg:px-8 py-2 lg:py-3 ${!isEditing ? 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg hover:shadow-xl' : ''} transition-all duration-300 transform hover:scale-105 text-sm lg:text-base`}
                                    icon={isEditing ? RefreshCw : Edit3}
                                >
                                    {isEditing ? 'Cancel' : 'Edit Profile'}
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Enhanced Profile Form */}
                {isEditing ? (
                    <div className="relative overflow-hidden bg-white rounded-2xl lg:rounded-3xl shadow-xl border border-gray-100">
                        {/* Gradient Background for Form */}
                        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 opacity-50"></div>

                        <div className="relative p-6 lg:p-12">
                            <div className="flex items-center mb-6 lg:mb-8">
                                <div className="flex-shrink-0 w-10 h-10 lg:w-12 lg:h-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center">
                                    <Edit3 className="w-5 h-5 lg:w-6 lg:h-6 text-white" />
                                </div>
                                <div className="ml-4">
                                    <h2 className="text-2xl lg:text-3xl font-bold bg-gradient-to-r from-gray-900 via-blue-800 to-purple-800 bg-clip-text text-transparent">
                                        Edit Profile
                                    </h2>
                                    <p className="text-sm lg:text-base text-gray-600 mt-1">Update your information and preferences</p>
                                </div>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-6 lg:space-y-8">
                                {/* Personal Information Section */}
                                <div className="bg-white/50 rounded-xl lg:rounded-2xl p-4 lg:p-6 border border-gray-200/50 backdrop-blur-sm">
                                    <h3 className="text-base lg:text-lg font-semibold text-gray-900 mb-4 flex items-center">
                                        <User className="w-4 h-4 lg:w-5 lg:h-5 mr-2 text-blue-600" />
                                        Personal Information
                                    </h3>
                                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
                                        <Input
                                            type="text"
                                            name="name"
                                            label="Full Name *"
                                            value={formData.name}
                                            onChange={handleInputChange}
                                            required
                                            icon={User}
                                            className="transition-all duration-300 focus:scale-105"
                                        />
                                        <Input
                                            type="email"
                                            name="email"
                                            label="Email Address *"
                                            value={formData.email}
                                            onChange={handleInputChange}
                                            required
                                            icon={Mail}
                                            className="transition-all duration-300 focus:scale-105"
                                        />
                                    </div>
                                </div>

                                {/* Academic Information Section */}
                                <div className="bg-white/50 rounded-xl lg:rounded-2xl p-4 lg:p-6 border border-gray-200/50 backdrop-blur-sm">
                                    <h3 className="text-base lg:text-lg font-semibold text-gray-900 mb-4 flex items-center">
                                        <Building className="w-4 h-4 lg:w-5 lg:h-5 mr-2 text-purple-600" />
                                        Academic Details
                                    </h3>
                                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
                                        <Select
                                            name="department"
                                            label="Department *"
                                            value={formData.department}
                                            onChange={handleInputChange}
                                            options={departmentOptions}
                                            required
                                            className="transition-all duration-300 focus:scale-105"
                                        />
                                        <Select
                                            name="semester"
                                            label="Current Semester *"
                                            value={formData.semester}
                                            onChange={handleInputChange}
                                            options={semesterOptions}
                                            required
                                            className="transition-all duration-300 focus:scale-105"
                                        />
                                    </div>
                                </div>

                                {/* Personal Preferences Section */}
                                <div className="bg-white/50 rounded-xl lg:rounded-2xl p-4 lg:p-6 border border-gray-200/50 backdrop-blur-sm">
                                    <h3 className="text-base lg:text-lg font-semibold text-gray-900 mb-4 flex items-center">
                                        <Users className="w-4 h-4 lg:w-5 lg:h-5 mr-2 text-pink-600" />
                                        Personal Preferences
                                    </h3>
                                    <div className="space-y-4 lg:space-y-6">
                                        <Select
                                            name="gender"
                                            label="Gender Pronouns *"
                                            value={formData.gender}
                                            onChange={handleInputChange}
                                            options={genderOptions}
                                            required
                                            className="transition-all duration-300 focus:scale-105"
                                        />

                                        <div>
                                            <label className="flex items-center text-xs lg:text-sm font-medium text-gray-700 mb-3">
                                                <Heart className="w-3 h-3 lg:w-4 lg:h-4 mr-2 text-red-500" />
                                                Bio
                                            </label>
                                            <textarea
                                                name="bio"
                                                value={formData.bio}
                                                onChange={handleInputChange}
                                                rows="4"
                                                className="w-full px-3 lg:px-4 py-2 lg:py-3 border border-gray-300 rounded-lg lg:rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 resize-none bg-white/80 backdrop-blur-sm hover:bg-white focus:bg-white text-sm lg:text-base"
                                                placeholder="Tell us about yourself, your interests, and what makes you unique..."
                                            />
                                            <p className="text-xs text-gray-500 mt-2">Share a bit about yourself to help others connect with you</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Action Buttons */}
                                <div className="flex flex-col sm:flex-row justify-end gap-3 lg:gap-4 pt-4 lg:pt-6">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => setIsEditing(false)}
                                        className="px-6 lg:px-8 py-2 lg:py-3 border-gray-300 hover:border-gray-400 transition-all duration-300 text-sm lg:text-base"
                                    >
                                        Cancel
                                    </Button>
                                    <Button
                                        type="submit"
                                        loading={isLoading}
                                        className="px-8 lg:px-12 py-2 lg:py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 text-sm lg:text-base"
                                        icon={Save}
                                    >
                                        Save Changes
                                    </Button>
                                </div>
                            </form>
                        </div>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6 lg:gap-8">
                        {/* Personal Information - Enhanced */}
                        <div className="lg:col-span-1 xl:col-span-1">
                            <div className="relative overflow-hidden bg-white rounded-3xl shadow-xl border border-gray-100 hover:shadow-2xl transition-all duration-300 h-full">
                                <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-white to-purple-50 opacity-50"></div>

                                <div className="relative p-6 lg:p-8">
                                    <div className="flex items-center mb-6">
                                        <div className="flex-shrink-0 w-10 h-10 lg:w-12 lg:h-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center">
                                            <User className="w-5 h-5 lg:w-6 lg:h-6 text-white" />
                                        </div>
                                        <div className="ml-4">
                                            <h2 className="text-xl lg:text-2xl font-bold bg-gradient-to-r from-gray-900 via-blue-800 to-purple-800 bg-clip-text text-transparent">
                                                Personal Information
                                            </h2>
                                            <p className="text-sm lg:text-base text-gray-600">Your profile details</p>
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <EnhancedInfoItem
                                            icon={User}
                                            label="Full Name"
                                            value={user.name}
                                            color="text-blue-600"
                                        />
                                        <EnhancedInfoItem
                                            icon={Mail}
                                            label="Email"
                                            value={user.email}
                                            color="text-green-600"
                                        />
                                        <EnhancedInfoItem
                                            icon={Building}
                                            label="Department"
                                            value={user.department || 'Not specified'}
                                            color="text-purple-600"
                                        />
                                        <EnhancedInfoItem
                                            icon={Calendar}
                                            label="Semester"
                                            value={user.semester ? `${user.semester}` : 'Not specified'}
                                            color="text-pink-600"
                                        />
                                        <EnhancedInfoItem
                                            icon={Users}
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
                                            color="text-indigo-600"
                                        />
                                        <EnhancedInfoItem
                                            icon={Calendar}
                                            label="Member Since"
                                            value={user.createdAt ? new Date(user.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long' }) : 'N/A'}
                                            color="text-gray-600"
                                        />
                                    </div>

                                    {user.bio && (
                                        <div className="mt-6 p-4 lg:p-6 bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl border border-blue-200/50">
                                            <h3 className="flex items-center text-base lg:text-lg font-semibold text-gray-900 mb-3">
                                                <Heart className="w-4 h-4 lg:w-5 lg:h-5 mr-2 text-red-500" />
                                                About Me
                                            </h3>
                                            <p className="text-sm lg:text-base text-gray-700 leading-relaxed italic">"{user.bio}"</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Enhanced Statistics Sidebar */}
                        <div className="lg:col-span-1 xl:col-span-1">
                            {/* Activity Stats Card */}
                            <div className="relative overflow-hidden bg-white rounded-3xl shadow-xl border border-gray-100 hover:shadow-2xl transition-all duration-300 h-full">
                                <div className="absolute inset-0 bg-gradient-to-br from-green-50 via-white to-blue-50 opacity-50"></div>

                                <div className="relative p-6 lg:p-8">
                                    <div className="flex items-center mb-6">
                                        <div className="flex-shrink-0 w-10 h-10 lg:w-12 lg:h-12 bg-gradient-to-r from-green-600 to-blue-600 rounded-full flex items-center justify-center">
                                            <Activity className="w-5 h-5 lg:w-6 lg:h-6 text-white" />
                                        </div>
                                        <div className="ml-4">
                                            <h3 className="text-xl lg:text-2xl font-bold bg-gradient-to-r from-green-700 to-blue-700 bg-clip-text text-transparent">
                                                Activity Stats
                                            </h3>
                                            <p className="text-sm lg:text-base text-gray-600">Your platform engagement</p>
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <EnhancedStatItem
                                            icon={BookOpen}
                                            label="Notes Uploaded"
                                            value={user.notesUploaded || 0}
                                            color="from-blue-600 to-purple-600"
                                            bgColor="from-blue-50 to-purple-50"
                                            description="Total notes shared"
                                        />
                                        <EnhancedStatItem
                                            icon={Heart}
                                            label="Likes Received"
                                            value={user.likesReceived || 0}
                                            color="from-pink-600 to-red-600"
                                            bgColor="from-pink-50 to-red-50"
                                            description="Community appreciation"
                                        />
                                        <EnhancedStatItem
                                            icon={Download}
                                            label="Downloads"
                                            value={user.totalDownloads || 0}
                                            color="from-green-600 to-teal-600"
                                            bgColor="from-green-50 to-teal-50"
                                            description="Total downloads"
                                        />
                                        <EnhancedStatItem
                                            icon={Star}
                                            label="Reputation Score"
                                            value={Math.floor((user.likesReceived || 0) * 2 + (user.notesUploaded || 0) * 5)}
                                            color="from-yellow-600 to-orange-600"
                                            bgColor="from-yellow-50 to-orange-50"
                                            description="Overall contribution"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Enhanced Saved Notes Section */}
                        <div className="lg:col-span-2 xl:col-span-1">
                            <div className="relative overflow-hidden bg-white rounded-3xl shadow-xl border border-gray-100 hover:shadow-2xl transition-all duration-300 h-full">
                                <div className="absolute inset-0 bg-gradient-to-br from-amber-50 via-white to-orange-50 opacity-50"></div>

                                <div className="relative p-6 lg:p-8">
                                    <div className="flex items-center justify-between mb-6">
                                        <div className="flex items-center">
                                            <div className="flex-shrink-0 w-10 h-10 lg:w-12 lg:h-12 bg-gradient-to-r from-amber-600 to-orange-600 rounded-full flex items-center justify-center">
                                                <Bookmark className="w-5 h-5 lg:w-6 lg:h-6 text-white" />
                                            </div>
                                            <div className="ml-4">
                                                <h3 className="text-xl lg:text-2xl font-bold bg-gradient-to-r from-amber-700 to-orange-700 bg-clip-text text-transparent">
                                                    Saved Notes
                                                </h3>
                                                <p className="text-sm lg:text-base text-gray-600">Your bookmarked content</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center px-2 lg:px-3 py-1 bg-gradient-to-r from-amber-100 to-orange-100 rounded-full">
                                            <span className="text-xs lg:text-sm font-semibold text-amber-700">
                                                {savedNotes.length} saved
                                            </span>
                                        </div>
                                    </div>

                                    {savedNotesLoading ? (
                                        <div className="flex justify-center py-12">
                                            <LoadingSpinner />
                                        </div>
                                    ) : savedNotes.length === 0 ? (
                                        <div className="text-center py-8 lg:py-12">
                                            <div className="w-16 h-16 lg:w-20 lg:h-20 mx-auto bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center mb-4">
                                                <BookOpen className="w-8 h-8 lg:w-10 lg:h-10 text-gray-400" />
                                            </div>
                                            <h4 className="text-base lg:text-lg font-semibold text-gray-600 mb-2">No saved notes yet</h4>
                                            <p className="text-sm lg:text-base text-gray-500 mb-4">Bookmark notes to see them here</p>
                                            <div className="inline-flex px-3 py-2 lg:px-4 lg:py-2 bg-gradient-to-r from-blue-100 to-purple-100 rounded-full">
                                                <span className="text-xs lg:text-sm text-blue-700">Start exploring notes to bookmark your favorites!</span>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="space-y-3 lg:space-y-4 max-h-96 overflow-y-auto">
                                            {savedNotes.slice(0, 5).map((note) => (
                                                <div key={note._id} className="group">
                                                    <div className="flex items-center justify-between p-3 lg:p-4 bg-white/60 rounded-xl lg:rounded-2xl border border-gray-200/50 hover:bg-white hover:shadow-lg transition-all duration-300 backdrop-blur-sm">
                                                        <div className="flex-1 min-w-0">
                                                            <div className="flex items-start justify-between">
                                                                <div className="flex-1">
                                                                    <h4 className="text-xs lg:text-sm font-semibold text-gray-900 truncate group-hover:text-blue-600 transition-colors">
                                                                        {note.title}
                                                                    </h4>
                                                                    <div className="flex items-center text-xs text-gray-500 mt-2 space-x-2 lg:space-x-4 flex-wrap">
                                                                        <span className="flex items-center px-2 py-1 bg-blue-50 rounded-full">
                                                                            <BookOpen className="w-2 h-2 lg:w-3 lg:h-3 mr-1" />
                                                                            <span className="text-xs">{note.subject}</span>
                                                                        </span>
                                                                        <span className="flex items-center px-2 py-1 bg-purple-50 rounded-full">
                                                                            <Calendar className="w-2 h-2 lg:w-3 lg:h-3 mr-1" />
                                                                            <span className="text-xs">Sem {note.semester}</span>
                                                                        </span>
                                                                        <span className="px-2 py-1 bg-gray-50 rounded-full text-xs">
                                                                            {formatFileSize(note.fileSize)}
                                                                        </span>
                                                                    </div>
                                                                </div>
                                                                <div className="flex items-center space-x-2 lg:space-x-3 ml-4">
                                                                    <div className="flex items-center text-xs text-gray-400 space-x-2 lg:space-x-3">
                                                                        <span className="flex items-center px-2 py-1 bg-red-50 rounded-full">
                                                                            <Heart className="w-2 h-2 lg:w-3 lg:h-3 mr-1 text-red-500" />
                                                                            <span className="text-red-600 font-medium text-xs">{note.likes?.length || 0}</span>
                                                                        </span>
                                                                        <span className="flex items-center px-2 py-1 bg-green-50 rounded-full">
                                                                            <Download className="w-2 h-2 lg:w-3 lg:h-3 mr-1 text-green-500" />
                                                                            <span className="text-green-600 font-medium text-xs">{note.downloads || 0}</span>
                                                                        </span>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                            {savedNotes.length > 5 && (
                                                <div className="text-center mt-4 lg:mt-6 pt-4 border-t border-gray-200">
                                                    <button
                                                        onClick={() => window.location.href = '/bookmarks'}
                                                        className="inline-flex items-center px-4 lg:px-6 py-2 lg:py-3 bg-gradient-to-r from-amber-600 to-orange-600 text-white rounded-full hover:from-amber-700 hover:to-orange-700 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl text-sm lg:text-base"
                                                    >
                                                        <Eye className="w-3 h-3 lg:w-4 lg:h-4 mr-2" />
                                                        View all {savedNotes.length} saved notes
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

// Enhanced reusable components
const EnhancedInfoItem = ({ icon, label, value, color }) => {
    const IconComponent = icon;
    return (
        <div className="group p-3 lg:p-4 bg-white/50 rounded-xl lg:rounded-2xl border border-gray-200/50 hover:bg-white hover:shadow-md transition-all duration-300 backdrop-blur-sm">
            <div className="flex items-center space-x-3">
                <div className={`flex-shrink-0 w-8 h-8 lg:w-10 lg:h-10 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
                    <IconComponent className={`w-4 h-4 lg:w-5 lg:h-5 ${color}`} />
                </div>
                <div className="flex-1 min-w-0">
                    <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wide">{label}</h3>
                    <p className="text-xs lg:text-sm font-semibold text-gray-900 truncate mt-1">{value}</p>
                </div>
            </div>
        </div>
    );
};

const EnhancedStatItem = ({ icon, label, value, color, bgColor, description }) => {
    const IconComponent = icon;
    return (
        <div className={`p-4 lg:p-6 bg-gradient-to-r ${bgColor} rounded-xl lg:rounded-2xl border border-gray-200/50 hover:shadow-lg transition-all duration-300 group`}>
            <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3 lg:space-x-4">
                    <div className={`flex-shrink-0 w-10 h-10 lg:w-12 lg:h-12 bg-gradient-to-r ${color} rounded-lg lg:rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                        <IconComponent className="w-5 h-5 lg:w-6 lg:h-6 text-white" />
                    </div>
                    <div>
                        <h4 className="text-xs lg:text-sm font-medium text-gray-600">{label}</h4>
                        <p className="text-xs text-gray-500 mt-1">{description}</p>
                    </div>
                </div>
                <div className={`text-xl lg:text-2xl font-bold bg-gradient-to-r ${color} bg-clip-text text-transparent`}>
                    {value}
                </div>
            </div>
        </div>
    );
};

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
