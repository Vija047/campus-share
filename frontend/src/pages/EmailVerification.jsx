import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Mail, ArrowLeft, RefreshCw, CheckCircle, AlertCircle } from 'lucide-react';
import { authService } from '../services/authService';
import Button from '../components/common/Button';
import LoadingSpinner from '../components/common/LoadingSpinner';

const EmailVerification = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const [verificationCode, setVerificationCode] = useState(['', '', '', '', '', '']);
    const [isLoading, setIsLoading] = useState(false);
    const [isResending, setIsResending] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [countdown, setCountdown] = useState(0);
    const inputRefs = useRef([]);

    const email = searchParams.get('email');

    useEffect(() => {
        if (!email) {
            navigate('/register');
        }
    }, [email, navigate]);

    useEffect(() => {
        let timer;
        if (countdown > 0) {
            timer = setTimeout(() => setCountdown(countdown - 1), 1000);
        }
        return () => clearTimeout(timer);
    }, [countdown]);

    const handleInputChange = (index, value) => {
        // Only allow digits
        if (!/^\d*$/.test(value)) return;

        const newCode = [...verificationCode];
        newCode[index] = value;
        setVerificationCode(newCode);

        // Move to next input if value is entered
        if (value && index < 5) {
            inputRefs.current[index + 1]?.focus();
        }

        // Clear error when user starts typing
        if (error) setError('');
    };

    const handleKeyDown = (index, e) => {
        // Move to previous input on backspace if current input is empty
        if (e.key === 'Backspace' && !verificationCode[index] && index > 0) {
            inputRefs.current[index - 1]?.focus();
        }
    };

    const handlePaste = (e) => {
        e.preventDefault();
        const pastedData = e.clipboardData.getData('text');

        // Check if pasted data is 6 digits
        if (/^\d{6}$/.test(pastedData)) {
            const newCode = pastedData.split('');
            setVerificationCode(newCode);
            inputRefs.current[5]?.focus();
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const code = verificationCode.join('');
        if (code.length !== 6) {
            setError('Please enter the complete 6-digit verification code');
            return;
        }

        setIsLoading(true);
        setError('');

        try {
            const result = await authService.verifyEmail(email, code);
            if (result.success) {
                setSuccess('Email verified successfully! Redirecting...');
                setTimeout(() => {
                    navigate('/dashboard', { replace: true });
                }, 2000);
            }
        } catch (error) {
            console.error('Verification error:', error);
            setError(
                error.response?.data?.message ||
                'Failed to verify email. Please check your code and try again.'
            );
        } finally {
            setIsLoading(false);
        }
    };

    const handleResendCode = async () => {
        if (countdown > 0) return;

        setIsResending(true);
        setError('');

        try {
            const result = await authService.resendVerificationCode(email);
            if (result.success) {
                setSuccess('Verification code sent! Please check your email.');
                setCountdown(60); // 1 minute countdown
                setTimeout(() => setSuccess(''), 3000);
            }
        } catch (error) {
            console.error('Resend error:', error);
            setError(
                error.response?.data?.message ||
                'Failed to resend verification code. Please try again.'
            );
        } finally {
            setIsResending(false);
        }
    };

    if (!email) {
        return <LoadingSpinner text="Loading..." />;
    }

    if (isLoading && success) {
        return <LoadingSpinner text="Verifying email..." />;
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
            <div className="max-w-md w-full mx-4">
                {/* Back Button */}
                <div className="mb-6">
                    <Link
                        to="/register"
                        className="inline-flex items-center text-gray-600 hover:text-gray-800 transition-colors"
                    >
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Back to Registration
                    </Link>
                </div>

                {/* Main Card */}
                <div className="bg-white p-8 rounded-2xl shadow-xl border border-gray-100">
                    {/* Header */}
                    <div className="text-center mb-8">
                        <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Mail className="w-8 h-8 text-blue-600" />
                        </div>
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">Verify Your Email</h2>
                        <p className="text-gray-600">
                            We've sent a 6-digit verification code to
                        </p>
                        <p className="text-blue-600 font-medium mt-1">{email}</p>
                    </div>

                    {/* Success Message */}
                    {success && (
                        <div className="mb-6 p-4 bg-green-50 border-l-4 border-green-400 rounded-md animate-fade-in">
                            <div className="flex items-center">
                                <CheckCircle className="h-5 w-5 text-green-400 mr-3" />
                                <p className="text-green-700 text-sm font-medium">{success}</p>
                            </div>
                        </div>
                    )}

                    {/* Error Message */}
                    {error && (
                        <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-400 rounded-md animate-fade-in">
                            <div className="flex items-center">
                                <AlertCircle className="h-5 w-5 text-red-400 mr-3" />
                                <p className="text-red-700 text-sm font-medium">{error}</p>
                            </div>
                        </div>
                    )}

                    {/* Verification Form */}
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Code Input */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-3 text-center">
                                Enter Verification Code
                            </label>
                            <div className="flex justify-center space-x-3">
                                {verificationCode.map((digit, index) => (
                                    <input
                                        key={index}
                                        ref={(el) => (inputRefs.current[index] = el)}
                                        type="text"
                                        inputMode="numeric"
                                        maxLength={1}
                                        value={digit}
                                        onChange={(e) => handleInputChange(index, e.target.value)}
                                        onKeyDown={(e) => handleKeyDown(index, e)}
                                        onPaste={index === 0 ? handlePaste : undefined}
                                        className="w-12 h-12 text-center text-lg font-semibold border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
                                        placeholder="0"
                                    />
                                ))}
                            </div>
                        </div>

                        {/* Submit Button */}
                        <Button
                            type="submit"
                            disabled={isLoading || verificationCode.some(digit => !digit)}
                            className="w-full py-3 px-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-medium rounded-lg hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                        >
                            {isLoading ? (
                                <div className="flex items-center justify-center">
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                    Verifying...
                                </div>
                            ) : (
                                'Verify Email'
                            )}
                        </Button>
                    </form>

                    {/* Resend Code */}
                    <div className="mt-6 text-center">
                        <p className="text-sm text-gray-600 mb-3">
                            Didn't receive the code?
                        </p>
                        <button
                            type="button"
                            onClick={handleResendCode}
                            disabled={countdown > 0 || isResending}
                            className="inline-flex items-center text-blue-600 hover:text-blue-700 font-medium disabled:text-gray-400 disabled:cursor-not-allowed transition-colors"
                        >
                            <RefreshCw className={`h-4 w-4 mr-1 ${isResending ? 'animate-spin' : ''}`} />
                            {countdown > 0
                                ? `Resend code in ${countdown}s`
                                : isResending
                                    ? 'Sending...'
                                    : 'Resend code'
                            }
                        </button>
                    </div>

                    {/* Instructions */}
                    <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                        <h3 className="text-sm font-medium text-gray-900 mb-2">Instructions:</h3>
                        <ul className="text-xs text-gray-600 space-y-1">
                            <li>• Check your email inbox and spam folder</li>
                            <li>• The code expires in 15 minutes</li>
                            <li>• Enter all 6 digits without spaces</li>
                            <li>• Contact support if you continue to have issues</li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EmailVerification;