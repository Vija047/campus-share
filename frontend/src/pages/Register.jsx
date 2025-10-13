import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, BookOpen, UserPlus, Mail, Lock, User, GraduationCap, Building2, Users, ArrowRight, Sparkles } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import Select from '../components/common/Select';
import LoadingSpinner from '../components/common/LoadingSpinner';


const Register = () => {
    const [showPassword, setShowPassword] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        semester: '',
        department: '',
        gender: ''
    });
    const [errors, setErrors] = useState({});


    const { register, isLoading, error } = useAuth();
    const navigate = useNavigate();

    const semesters = [
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

    const departments = [
        { value: '', label: 'Select Department' },
        { value: 'Computer Science', label: 'Computer Science' },
        { value: 'Information Technology', label: 'Information Technology' },
        { value: 'Electronics and Communication', label: 'Electronics and Communication' },
        { value: 'Electrical Engineering', label: 'Electrical Engineering' },
        { value: 'Mechanical Engineering', label: 'Mechanical Engineering' },
        { value: 'Civil Engineering', label: 'Civil Engineering' },
        { value: 'Chemical Engineering', label: 'Chemical Engineering' },
        { value: 'Biotechnology', label: 'Biotechnology' },
        { value: 'Mathematics', label: 'Mathematics' },
        { value: 'Physics', label: 'Physics' },
        { value: 'Chemistry', label: 'Chemistry' },
        { value: 'Business Administration', label: 'Business Administration' },
        { value: 'Commerce', label: 'Commerce' },
        { value: 'Economics', label: 'Economics' },
        { value: 'Other', label: 'Other' }
    ];

    const genders = [
        { value: '', label: 'Select Gender' },
        { value: 'male', label: 'Male' },
        { value: 'female', label: 'Female' },
        { value: 'other', label: 'Other' },
        { value: 'prefer-not-to-say', label: 'Prefer not to say' }
    ];

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        // Clear error when user starts typing
        if (errors[name]) {
            setErrors(prev => ({
                ...prev,
                [name]: ''
            }));
        }
    };

    const validateForm = () => {
        const newErrors = {};

        // Name validation
        if (!formData.name.trim()) {
            newErrors.name = 'Name is required';
        } else if (formData.name.length > 50) {
            newErrors.name = 'Name cannot exceed 50 characters';
        }

        // Email validation
        if (!formData.email) {
            newErrors.email = 'Email is required';
        } else if (!/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(formData.email)) {
            newErrors.email = 'Please enter a valid email address';
        }

        // Password validation
        if (!formData.password) {
            newErrors.password = 'Password is required';
        } else if (formData.password.length < 6) {
            newErrors.password = 'Password must be at least 6 characters';
        }

        // Semester validation
        if (!formData.semester) {
            newErrors.semester = 'Semester is required';
        }

        // Department validation
        if (!formData.department) {
            newErrors.department = 'Department is required';
        }

        // Gender validation
        if (!formData.gender) {
            newErrors.gender = 'Gender is required';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) return;

        const result = await register(formData);
        if (result.success) {
            // Redirect to email verification page with email as parameter
            navigate(`/verify-email?email=${encodeURIComponent(formData.email)}`, { replace: true });
        }
    };

    if (isLoading) {
        return <LoadingSpinner text="Creating your account..." />;
    }

    return (
        <div className="min-h-screen flex">
            {/* Left Side - Hero Image/Content */}
            <div className="hidden lg:block lg:flex-1 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-hero"></div>
                <div className="absolute inset-0 bg-black opacity-20"></div>
                <div className="relative h-full flex flex-col justify-center items-center text-white p-12">
                    <div className="max-w-lg text-center">
                        <div className="mb-8">
                            <div className="w-24 h-24 bg-white bg-opacity-20 rounded-3xl flex items-center justify-center mx-auto mb-6 backdrop-blur-sm">
                                <GraduationCap className="w-12 h-12 text-black" />
                            </div>
                        </div>
                        <h2 className="text-4xl font-bold mb-6">
                            Start Your Academic Journey
                        </h2>
                        <p className="text-xl mb-8 opacity-90">
                            Join thousands of students sharing knowledge, building connections, and achieving academic excellence together.
                        </p>
                        <div className="grid grid-cols-3 gap-4 text-center">
                            <div>
                                <div className="text-2xl font-bold">5K+</div>
                                <div className="text-xs opacity-75">Notes</div>
                            </div>
                            <div>
                                <div className="text-2xl font-bold">2K+</div>
                                <div className="text-xs opacity-75">Students</div>
                            </div>
                            <div>
                                <div className="text-2xl font-bold">50K+</div>
                                <div className="text-xs opacity-75">Downloads</div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Floating Elements */}
                <div className="absolute top-16 left-20 w-20 h-20 bg-white bg-opacity-10 rounded-full backdrop-blur-sm"></div>
                <div className="absolute bottom-28 right-16 w-16 h-16 bg-white bg-opacity-10 rounded-full backdrop-blur-sm"></div>
                <div className="absolute top-1/3 left-32 w-12 h-12 bg-white bg-opacity-10 rounded-full backdrop-blur-sm"></div>
            </div>

            {/* Right Side - Registration Form */}
            <div className="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8 bg-gray-50">
                <div className="max-w-md w-full space-y-6">
                    {/* Header */}
                    <div className="text-center">
                        <div className="flex justify-center mb-6">
                            <div className="relative">
                                <div className="w-20 h-20 bg-gradient-secondary rounded-2xl flex items-center justify-center shadow-xl">
                                    <UserPlus className="w-10 h-10 text-purple-600" />
                                </div>
                            </div>
                        </div>
                        <h1 className="text-4xl font-bold text-gray-900 mb-2">
                            Create Account
                        </h1>
                        <p className="text-lg text-gray-600">
                            Join the learning community
                        </p>
                    </div>

                    {/* Form Card */}
                    <div className="bg-white p-8 rounded-2xl shadow-xl border border-gray-100">
                        {error && (
                            <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-400 rounded-md animate-fade-in">
                                <div className="flex">
                                    <div className="ml-3">
                                        <p className="text-red-700 text-sm font-medium">{error}</p>
                                    </div>
                                </div>
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-4">
                            {/* Name Input */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Full Name
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <User className="h-5 w-5 text-gray-400" />
                                    </div>
                                    <input
                                        type="text"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleChange}
                                        className="form-input pl-10 w-full focus-ring"
                                        placeholder="Enter your full name"
                                        required
                                    />
                                </div>
                                {errors.name && (
                                    <p className="mt-1 text-sm text-red-600">{errors.name}</p>
                                )}
                            </div>

                            {/* Email Input */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Email Address
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <Mail className="h-5 w-5 text-gray-400" />
                                    </div>
                                    <input
                                        type="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        className="form-input pl-10 w-full focus-ring"
                                        placeholder="Enter your email"
                                        required
                                    />
                                </div>
                                {errors.email && (
                                    <p className="mt-1 text-sm text-red-600">{errors.email}</p>
                                )}
                            </div>

                            {/* Password Input */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Password
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <Lock className="h-5 w-5 text-gray-400" />
                                    </div>
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        name="password"
                                        value={formData.password}
                                        onChange={handleChange}
                                        className="form-input pl-10 pr-10 w-full focus-ring"
                                        placeholder="Create a password"
                                        required
                                    />
                                    <button
                                        type="button"
                                        className="absolute inset-y-0 right-0 pr-3 flex items-center"
                                        onClick={() => setShowPassword(!showPassword)}
                                    >
                                        {showPassword ? (
                                            <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                                        ) : (
                                            <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                                        )}
                                    </button>
                                </div>
                                {errors.password && (
                                    <p className="mt-1 text-sm text-red-600">{errors.password}</p>
                                )}
                            </div>

                            {/* Academic Information */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {/* Semester */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Semester
                                    </label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <GraduationCap className="h-5 w-5 text-gray-400" />
                                        </div>
                                        <select
                                            name="semester"
                                            value={formData.semester}
                                            onChange={handleChange}
                                            className="form-input pl-10 w-full focus-ring"
                                            required
                                        >
                                            {semesters.map(semester => (
                                                <option key={semester.value} value={semester.value}>
                                                    {semester.label}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                    {errors.semester && (
                                        <p className="mt-1 text-sm text-red-600">{errors.semester}</p>
                                    )}
                                </div>

                                {/* Gender */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Gender
                                    </label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <Users className="h-5 w-5 text-gray-400" />
                                        </div>
                                        <select
                                            name="gender"
                                            value={formData.gender}
                                            onChange={handleChange}
                                            className="form-input pl-10 w-full focus-ring"
                                            required
                                        >
                                            {genders.map(gender => (
                                                <option key={gender.value} value={gender.value}>
                                                    {gender.label}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                    {errors.gender && (
                                        <p className="mt-1 text-sm text-red-600">{errors.gender}</p>
                                    )}
                                </div>
                            </div>

                            {/* Department */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Department
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <Building2 className="h-5 w-5 text-gray-400" />
                                    </div>
                                    <select
                                        name="department"
                                        value={formData.department}
                                        onChange={handleChange}
                                        className="form-input pl-10 w-full focus-ring"
                                        required
                                    >
                                        {departments.map(dept => (
                                            <option key={dept.value} value={dept.value}>
                                                {dept.label}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                {errors.department && (
                                    <p className="mt-1 text-sm text-red-600">{errors.department}</p>
                                )}
                            </div>

                            {/* Terms and Conditions */}
                            <div className="flex items-start">
                                <div className="flex items-center h-5">
                                    <input
                                        id="terms"
                                        name="terms"
                                        type="checkbox"
                                        className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                                        required
                                    />
                                </div>
                                <div className="ml-3 text-sm">
                                    <label htmlFor="terms" className="text-gray-700">
                                        I agree to the{' '}
                                        <Link to="/terms" className="font-medium text-indigo-600 hover:text-indigo-500">
                                            Terms and Conditions
                                        </Link>{' '}
                                        and{' '}
                                        <Link to="/privacy" className="font-medium text-indigo-600 hover:text-indigo-500">
                                            Privacy Policy
                                        </Link>
                                    </label>
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={isLoading}
                                className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-gradient-secondary hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pink-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                            >
                                {isLoading ? (
                                    <div className="flex items-center">
                                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                        Creating account...
                                    </div>
                                ) : (
                                    <div className="flex items-center text-black ">
                                        Create Account
                                        <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                                    </div>
                                )}
                            </button>
                        </form>

                        <div className="mt-6">
                            <div className="relative">
                                <div className="absolute inset-0 flex items-center">
                                    <div className="w-full border-t border-gray-300" />
                                </div>
                                <div className="relative flex justify-center text-sm">
                                    <span className="px-2 bg-white text-gray-500">Already have an account?</span>
                                </div>
                            </div>

                            <div className="mt-6">
                                <Link
                                    to="/login"
                                    className="w-full flex justify-center py-3 px-4 border-2 border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 hover:border-gray-400 transition-all"
                                >
                                    Sign in instead
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>


        </div>
    );
};

export default Register;