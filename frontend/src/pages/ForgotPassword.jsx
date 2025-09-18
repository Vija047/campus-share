import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, ArrowLeft, BookOpen, Shield, CheckCircle2, RotateCcw } from 'lucide-react';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { authService } from '../services/authService';

const ForgotPassword = () => {
    const [step, setStep] = useState('email'); // 'email', 'otp', 'reset', 'success'
    const [formData, setFormData] = useState({
        email: '',
        otp: '',
        newPassword: '',
        confirmPassword: ''
    });
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const navigate = useNavigate();

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        setError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');
        setSuccess('');

        try {
            if (step === 'email') {
                const result = await authService.forgotPassword(formData.email);
                if (result.success) {
                    setSuccess('OTP sent to your email successfully!');
                    setTimeout(() => {
                        setStep('otp');
                        setSuccess('');
                    }, 1500);
                } else {
                    setError(result.message || 'Failed to send OTP');
                }
            } else if (step === 'otp') {
                const result = await authService.verifyOTP(formData.email, formData.otp);
                if (result.success) {
                    setSuccess('OTP verified successfully!');
                    setTimeout(() => {
                        setStep('reset');
                        setSuccess('');
                    }, 1500);
                } else {
                    setError(result.message || 'Invalid OTP');
                }
            } else if (step === 'reset') {
                if (formData.newPassword !== formData.confirmPassword) {
                    setError('Passwords do not match');
                    return;
                }
                if (formData.newPassword.length < 6) {
                    setError('Password must be at least 6 characters long');
                    return;
                }

                const result = await authService.resetPassword(
                    formData.email,
                    formData.otp,
                    formData.newPassword
                );
                if (result.success) {
                    setStep('success');
                } else {
                    setError(result.message || 'Failed to reset password');
                }
            }
        } catch (error) {
            setError(error.response?.data?.message || 'Something went wrong. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const resetForm = () => {
        setStep('email');
        setFormData({
            email: '',
            otp: '',
            newPassword: '',
            confirmPassword: ''
        });
        setError('');
        setSuccess('');
    };

    const getStepContent = () => {
        switch (step) {
            case 'email':
                return {
                    title: 'Forgot Your Password?',
                    subtitle: 'Enter your email address and we\'ll send you an OTP to reset your password.',
                    icon: Mail,
                    buttonText: 'Send OTP'
                };
            case 'otp':
                return {
                    title: 'Verify OTP',
                    subtitle: 'Enter the 6-digit OTP code sent to your email address.',
                    icon: Shield,
                    buttonText: 'Verify OTP'
                };
            case 'reset':
                return {
                    title: 'Reset Password',
                    subtitle: 'Create a new strong password for your account.',
                    icon: Lock,
                    buttonText: 'Reset Password'
                };
            case 'success':
                return {
                    title: 'Password Reset Successful!',
                    subtitle: 'Your password has been successfully reset. You can now login with your new password.',
                    icon: CheckCircle2,
                    buttonText: 'Go to Login'
                };
            default:
                return {};
        }
    };

    const stepContent = getStepContent();

    if (step === 'success') {
        return (
            <div className="min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8 bg-gray-50">
                <div className="max-w-md w-full space-y-8">
                    <div className="text-center">
                        <div className="mx-auto flex items-center justify-center w-24 h-24 rounded-full bg-green-100 mb-6">
                            <CheckCircle2 className="w-12 h-12 text-green-600" />
                        </div>
                        <h2 className="text-3xl font-bold text-gray-900 mb-2">
                            {stepContent.title}
                        </h2>
                        <p className="text-gray-600 mb-8">
                            {stepContent.subtitle}
                        </p>
                        <div className="space-y-4">
                            <Button
                                onClick={() => navigate('/login')}
                                className="w-full"
                                size="lg"
                            >
                                Go to Login
                            </Button>
                            <button
                                onClick={resetForm}
                                className="w-full text-sm text-indigo-600 hover:text-indigo-500 font-medium"
                            >
                                Reset another password
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (isLoading) {
        return <LoadingSpinner text="Processing..." />;
    }

    return (
        <div className="min-h-screen flex">
            {/* Left Side - Hero Content */}
            <div className="hidden lg:block lg:flex-1 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-hero"></div>
                <div className="absolute inset-0 bg-black opacity-20"></div>
                <div className="relative h-full flex flex-col justify-center items-center text-white p-12">
                    <div className="max-w-lg text-center">
                        <div className="mb-8">
                            <div className="w-24 h-24 bg-white bg-opacity-20 rounded-3xl flex items-center justify-center mx-auto mb-6 backdrop-blur-sm">
                                <RotateCcw className="w-12 h-12 text-white" />
                            </div>
                        </div>
                        <h2 className="text-4xl font-bold mb-6">
                            Password Recovery
                        </h2>
                        <p className="text-xl mb-8 opacity-90">
                            Don't worry! Forgetting passwords happens to everyone. We'll help you get back to your studies in no time.
                        </p>
                        <div className="grid grid-cols-1 gap-4 text-center">
                            <div className="bg-white bg-opacity-10 backdrop-blur-sm rounded-lg p-4">
                                <div className="text-lg font-semibold">Secure Process</div>
                                <div className="text-sm opacity-75">Your account security is our priority</div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Floating Elements */}
                <div className="absolute top-16 left-20 w-20 h-20 bg-white bg-opacity-10 rounded-full backdrop-blur-sm"></div>
                <div className="absolute bottom-28 right-16 w-16 h-16 bg-white bg-opacity-10 rounded-full backdrop-blur-sm"></div>
                <div className="absolute top-1/3 left-32 w-12 h-12 bg-white bg-opacity-10 rounded-full backdrop-blur-sm"></div>
            </div>

            {/* Right Side - Form */}
            <div className="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8 bg-gray-50">
                <div className="max-w-md w-full space-y-6">
                    {/* Back to Login Link */}
                    <div className="flex items-center">
                        <Link
                            to="/login"
                            className="flex items-center text-sm text-gray-600 hover:text-gray-900 transition-colors"
                        >
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            Back to Login
                        </Link>
                    </div>

                    {/* Header */}
                    <div className="text-center">
                        <div className="flex justify-center mb-6">
                            <div className="w-20 h-20 bg-gradient-primary rounded-2xl flex items-center justify-center shadow-xl">
                                <stepContent.icon className="w-10 h-10 text-white" />
                            </div>
                        </div>
                        <h1 className="text-3xl font-bold text-gray-900 mb-2">
                            {stepContent.title}
                        </h1>
                        <p className="text-gray-600">
                            {stepContent.subtitle}
                        </p>
                    </div>

                    {/* Progress Indicator */}
                    <div className="flex justify-center space-x-2 mb-8">
                        <div className={`w-3 h-3 rounded-full ${step === 'email' ? 'bg-indigo-600' : step !== 'email' ? 'bg-indigo-600' : 'bg-gray-300'}`}></div>
                        <div className={`w-3 h-3 rounded-full ${step === 'otp' ? 'bg-indigo-600' : step === 'reset' ? 'bg-indigo-600' : 'bg-gray-300'}`}></div>
                        <div className={`w-3 h-3 rounded-full ${step === 'reset' ? 'bg-indigo-600' : 'bg-gray-300'}`}></div>
                    </div>

                    {/* Form Card */}
                    <div className="bg-white p-8 rounded-2xl shadow-xl border border-gray-100">
                        {error && (
                            <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-400 rounded-md animate-fade-in">
                                <p className="text-red-700 text-sm font-medium">{error}</p>
                            </div>
                        )}

                        {success && (
                            <div className="mb-6 p-4 bg-green-50 border-l-4 border-green-400 rounded-md animate-fade-in">
                                <p className="text-green-700 text-sm font-medium">{success}</p>
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* Email Step */}
                            {step === 'email' && (
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
                                            className="appearance-none relative block w-full px-3 py-3 pl-10 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm transition-all"
                                            placeholder="Enter your email address"
                                            required
                                        />
                                    </div>
                                </div>
                            )}

                            {/* OTP Step */}
                            {step === 'otp' && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        OTP Code
                                    </label>
                                    <input
                                        type="text"
                                        name="otp"
                                        value={formData.otp}
                                        onChange={handleChange}
                                        className="appearance-none relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm transition-all text-center font-mono text-lg tracking-widest"
                                        placeholder="000000"
                                        maxLength="6"
                                        required
                                    />
                                    <p className="mt-2 text-xs text-gray-500 text-center">
                                        Didn't receive the code?
                                        <button
                                            type="button"
                                            onClick={() => setStep('email')}
                                            className="ml-1 text-indigo-600 hover:text-indigo-500 font-medium"
                                        >
                                            Resend OTP
                                        </button>
                                    </p>
                                </div>
                            )}

                            {/* Reset Password Step */}
                            {step === 'reset' && (
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            New Password
                                        </label>
                                        <div className="relative">
                                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                <Lock className="h-5 w-5 text-gray-400" />
                                            </div>
                                            <input
                                                type="password"
                                                name="newPassword"
                                                value={formData.newPassword}
                                                onChange={handleChange}
                                                className="appearance-none relative block w-full px-3 py-3 pl-10 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm transition-all"
                                                placeholder="Enter new password"
                                                required
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Confirm Password
                                        </label>
                                        <div className="relative">
                                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                <Lock className="h-5 w-5 text-gray-400" />
                                            </div>
                                            <input
                                                type="password"
                                                name="confirmPassword"
                                                value={formData.confirmPassword}
                                                onChange={handleChange}
                                                className="appearance-none relative block w-full px-3 py-3 pl-10 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm transition-all"
                                                placeholder="Confirm new password"
                                                required
                                            />
                                        </div>
                                    </div>
                                </div>
                            )}

                            <Button
                                type="submit"
                                className="w-full"
                                size="lg"
                                disabled={isLoading}
                            >
                                {isLoading ? (
                                    <div className="flex items-center justify-center">
                                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                        Processing...
                                    </div>
                                ) : (
                                    stepContent.buttonText
                                )}
                            </Button>
                        </form>
                    </div>

                    {/* Footer Links */}
                    <div className="text-center">
                        <p className="text-sm text-gray-600">
                            Remember your password?{' '}
                            <Link
                                to="/login"
                                className="font-medium text-indigo-600 hover:text-indigo-500"
                            >
                                Sign in instead
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ForgotPassword;