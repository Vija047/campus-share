import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, BookOpen, UserPlus } from 'lucide-react';
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
            navigate('/dashboard', { replace: true });
        }
    };

    if (isLoading) {
        return <LoadingSpinner text="Creating your account..." />;
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8">
                {/* Header */}
                <div className="text-center">
                    <div className="flex justify-center mb-4">
                        <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center">
                            <BookOpen className="w-8 h-8 text-white" />
                        </div>
                    </div>
                    <h2 className="text-3xl font-bold text-gray-900">
                        Join Campus Share
                    </h2>
                    <p className="mt-2 text-gray-600">
                        Create your account to start sharing and accessing notes
                    </p>
                </div>

                {/* Form */}
                <div className="bg-white p-8 rounded-lg shadow-lg">
                    {error && (
                        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md">
                            <p className="text-red-600 text-sm">{error}</p>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <Input
                            label="Full Name"
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            error={errors.name}
                            placeholder="Enter your full name"
                            required
                        />

                        <Input
                            label="Email Address"
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            error={errors.email}
                            placeholder="Enter your email address"
                            required
                        />

                        <div className="relative">
                            <Input
                                label="Password"
                                type={showPassword ? 'text' : 'password'}
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                                error={errors.password}
                                placeholder="Create a strong password"
                                required
                            />
                            <button
                                type="button"
                                className="absolute right-3 top-8 text-gray-400 hover:text-gray-600"
                                onClick={() => setShowPassword(!showPassword)}
                            >
                                {showPassword ? (
                                    <EyeOff className="w-5 h-5" />
                                ) : (
                                    <Eye className="w-5 h-5" />
                                )}
                            </button>
                        </div>

                        <Select
                            label="Current Semester"
                            name="semester"
                            value={formData.semester}
                            onChange={handleChange}
                            error={errors.semester}
                            required
                        >
                            <option value="">Select your semester</option>
                            <option value="1">1st Semester</option>
                            <option value="2">2nd Semester</option>
                            <option value="3">3rd Semester</option>
                            <option value="4">4th Semester</option>
                            <option value="5">5th Semester</option>
                            <option value="6">6th Semester</option>
                            <option value="7">7th Semester</option>
                            <option value="8">8th Semester</option>
                        </Select>

                        <Select
                            label="Department"
                            name="department"
                            value={formData.department}
                            onChange={handleChange}
                            error={errors.department}
                            required
                        >
                            <option value="">Select your department</option>
                            <option value="Computer Science">Computer Science</option>
                            <option value="Information Technology">Information Technology</option>
                            <option value="Electronics">Electronics</option>
                            <option value="Mechanical">Mechanical</option>
                            <option value="Civil">Civil</option>
                            <option value="Electrical">Electrical</option>
                            <option value="Chemical">Chemical</option>
                            <option value="Biotechnology">Biotechnology</option>
                            <option value="Other">Other</option>
                        </Select>

                        <Select
                            label="Gender"
                            name="gender"
                            value={formData.gender}
                            onChange={handleChange}
                            error={errors.gender}
                            required
                        >
                            <option value="">Select your gender</option>
                            <option value="male">Male</option>
                            <option value="female">Female</option>
                            <option value="other">Other</option>
                        </Select>

                        <Button
                            type="submit"
                            className="w-full"
                            loading={isLoading}
                            disabled={isLoading}
                        >
                            <UserPlus className="w-5 h-5 mr-2" />
                            Create Account
                        </Button>
                    </form>

                    {/* Login Link */}
                    <div className="mt-6 text-center">
                        <p className="text-gray-600">
                            Already have an account?{' '}
                            <Link
                                to="/login"
                                className="text-blue-600 hover:text-blue-500 font-medium"
                            >
                                Sign in here
                            </Link>
                        </p>
                    </div>
                </div>

                {/* Terms and Privacy */}
                <div className="text-center">
                    <p className="text-xs text-gray-500">
                        By creating an account, you agree to our{' '}
                        <a href="#" className="text-blue-600 hover:text-blue-500">
                            Terms of Service
                        </a>{' '}
                        and{' '}
                        <a href="#" className="text-blue-600 hover:text-blue-500">
                            Privacy Policy
                        </a>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Register;
