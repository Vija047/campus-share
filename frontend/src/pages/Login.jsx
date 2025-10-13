import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Eye, EyeOff, BookOpen, LogIn, Mail, Lock, Sparkles, Users, Download, FileText, TrendingUp } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import LoadingSpinner from '../components/common/LoadingSpinner';

const Login = () => {
    const [showPassword, setShowPassword] = useState(false);
    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });
    const [errors, setErrors] = useState({});
    const { login, isLoading, error } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    const from = location.state?.from?.pathname || '/dashboard';

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

        if (!formData.email) {
            newErrors.email = 'Email is required';
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
            newErrors.email = 'Email is invalid';
        }

        if (!formData.password) {
            newErrors.password = 'Password is required';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) return;

        const result = await login(formData);
        if (result.success) {
            navigate(from, { replace: true });
        } else if (result.emailNotVerified && result.email) {
            // Redirect to email verification page if email is not verified
            navigate(`/verify-email?email=${encodeURIComponent(result.email)}`, { replace: true });
        }
    };

    if (isLoading) {
        return <LoadingSpinner text="Signing in..." />;
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
                                <BookOpen className="w-12 h-12 text-black" />
                            </div>
                        </div>
                        <h2 className="text-4xl font-bold mb-6">
                            Welcome Back to Campus Share
                        </h2>
                        <p className="text-xl mb-8 opacity-90">
                            Continue your academic journey. Access thousands of notes, connect with peers, and excel in your studies.
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

            {/* Right Side - Login Form */}
            <div className="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8 bg-gray-50">
                <div className="max-w-md w-full space-y-6">
                    {/* Header */}
                    <div className="text-center">
                        <div className="flex justify-center mb-6">
                            <div className="relative">
                                <div className="w-20 h-20 bg-gradient-primary rounded-2xl flex items-center justify-center shadow-xl">
                                    <LogIn className="w-10 h-10 text-white" />
                                </div>

                            </div>
                        </div>
                        <h1 className="text-4xl font-bold text-gray-900 mb-2">
                            Welcome Back
                        </h1>
                        <p className="text-lg text-gray-600">
                            Sign in to continue learning
                        </p>
                    </div>

                    {/* Form Card */}
                    <div className="bg-white p-8 rounded-2xl shadow-xl border border-gray-100">
                        {location.state?.message && (
                            <div className="mb-6 p-4 bg-green-50 border-l-4 border-green-400 rounded-md animate-fade-in">
                                <div className="flex">
                                    <div className="ml-3">
                                        <p className="text-green-700 text-sm font-medium">{location.state.message}</p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {error && (
                            <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-400 rounded-md animate-fade-in">
                                <div className="flex">
                                    <div className="ml-3">
                                        <p className="text-red-700 text-sm font-medium">{error}</p>

                                    </div>
                                </div>
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-6">
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
                                        className="appearance-none relative block w-full px-3 py-3 pl-10 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm transition-all"
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
                                        className="appearance-none relative block w-full px-3 py-3 pl-10 pr-10 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm transition-all"
                                        placeholder="Enter your password"
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

                            <div className="flex items-center justify-between">
                                <div className="flex items-center">
                                    <input
                                        id="remember-me"
                                        name="remember-me"
                                        type="checkbox"
                                        className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                                    />
                                    <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-900">
                                        Remember me
                                    </label>
                                </div>

                                <div className="text-sm">
                                    <Link
                                        to="/forgot-password"
                                        className="font-medium text-indigo-600 hover:text-indigo-500"
                                    >
                                        Forgot your password?
                                    </Link>
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={isLoading}
                                className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-gradient-primary hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                            >
                                {isLoading ? (
                                    <div className="flex items-center">
                                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                        Signing in...
                                    </div>
                                ) : (
                                    <div className="flex items-center">
                                        Sign In
                                        <LogIn className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
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
                                    <span className="px-2 bg-white text-gray-500">New to Campus Share?</span>
                                </div>
                            </div>

                            <div className="mt-6">
                                <Link
                                    to="/register"
                                    className="w-full flex justify-center py-3 px-4 border-2 border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 hover:border-gray-400 transition-all"
                                >
                                    Create your account
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;
