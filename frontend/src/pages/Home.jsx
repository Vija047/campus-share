import { Link } from 'react-router-dom';
import {
    BookOpen,
    Upload,
    Users,
    MessageSquare,
    Star,
    Download,
    TrendingUp,
    ArrowRight,
    Zap,
    Shield,
    Award,
    Clock,
    Target,
    Heart,
    ChevronRight,
    Play
} from 'lucide-react';
import Button from '../components/common/Button';
import { useAuth } from '../hooks/useAuth';

const Home = () => {
    const { isAuthenticated } = useAuth();

    const features = [
        {
            icon: Upload,
            title: 'Smart Upload System',
            description: 'Upload and organize your notes with our intelligent categorization system.',
            color: 'bg-blue-500'
        },
        {
            icon: Download,
            title: 'Instant Access',
            description: 'Download thousands of verified notes and study materials instantly.',
            color: 'bg-green-500'
        },
        {
            icon: MessageSquare,
            title: 'Real-time Collaboration',
            description: 'Connect with classmates through dedicated chat rooms and discussions.',
            color: 'bg-purple-500'
        },
        {
            icon: Users,
            title: 'Academic Community',
            description: 'Join study groups, ask questions, and share knowledge with peers.',
            color: 'bg-orange-500'
        },
        {
            icon: Star,
            title: 'Quality Assurance',
            description: 'Rate and review materials to maintain high-quality content standards.',
            color: 'bg-yellow-500'
        },
        {
            icon: TrendingUp,
            title: 'Progress Tracking',
            description: 'Monitor your academic journey and contributions to the community.',
            color: 'bg-pink-500'
        }
    ];

    const stats = [
        { number: '10,000+', label: 'Notes Shared', icon: BookOpen },
        { number: '5,000+', label: 'Active Students', icon: Users },
        { number: '100,000+', label: 'Downloads', icon: Download },
        { number: '95%', label: 'Success Rate', icon: Award }
    ];

    const testimonials = [
        {
            name: 'Priya Sharma',
            role: 'Computer Science, 6th Sem',
            avatar: 'PS',
            content: 'Campus Share transformed my study routine. The quality of notes and the supportive community helped me improve my grades significantly!',
            rating: 5
        },
        {
            name: 'Arjun Patel',
            role: 'Mechanical Engineering, 4th Sem',
            avatar: 'AP',
            content: 'Amazing platform! Found exactly what I needed for my exams. The real-time chat feature is incredibly helpful for doubt clearing.',
            rating: 5
        },
        {
            name: 'Sneha Reddy',
            role: 'Electronics & Communication, 7th Sem',
            avatar: 'SR',
            content: 'Love how organized everything is. Easy to find notes by semester and subject. Highly recommend to all engineering students!',
            rating: 5
        }
    ];

    const benefits = [
        {
            icon: Zap,
            title: 'Lightning Fast',
            description: 'Access notes and resources instantly with our optimized platform.'
        },
        {
            icon: Shield,
            title: 'Secure & Reliable',
            description: 'Your data is protected with enterprise-grade security measures.'
        },
        {
            icon: Target,
            title: 'Targeted Content',
            description: 'Find exactly what you need with our smart search and filtering.'
        },
        {
            icon: Heart,
            title: 'Community Driven',
            description: 'Built by students, for students, with community at its heart.'
        }
    ];

    return (
        <div className="overflow-hidden">
            {/* Hero Section */}
            <section className="relative min-h-screen flex items-center bg-gradient-hero">
                <div className="absolute inset-0 bg-black opacity-10"></div>

                {/* Animated Background Elements */}
            
                <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-24">
                    <div className="lg:grid lg:grid-cols-12 lg:gap-8 items-center">
                        <div className="lg:col-span-7">
                            <div className="text-center lg:text-left">
                                <div className="mb-4 lg:mb-6">
                                    <span className="inline-flex items-center px-3 py-2 lg:px-4 lg:py-2 rounded-full text-xs lg:text-sm font-medium bg- from-blue-500 to-purple-600 bg-opacity-20 text-white backdrop-blur-sm">
                                        <Zap className="w-3 h-3 lg:w-4 lg:h-4 mr-2" />
                                        Join 5,000+ Students
                                    </span>
                                </div>

                                <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold text-white mb-4 lg:mb-6 leading-tight">
                                    Share Knowledge,
                                    <span className="block text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 to-orange-300">
                                        Excel Together
                                    </span>
                                </h1>

                                <p className="text-lg sm:text-xl lg:text-2xl mb-6 lg:mb-8 text-white opacity-90 max-w-2xl mx-auto lg:mx-0">
                                    The ultimate platform where students collaborate, share study materials,
                                    and achieve academic excellence together. Join the revolution!
                                </p>

                                <div className="flex flex-col sm:flex-row gap-3 lg:gap-4 justify-center lg:justify-start mb-6 lg:mb-8">
                                    {isAuthenticated ? (
                                        <>
                                            <Link to="/dashboard">
                                                <button className="group relative w-full sm:w-auto px-6 lg:px-8 py-3 lg:py-4 bg-white text-indigo-600 font-bold rounded-xl hover:bg-gray-100 transform hover:scale-105 transition-all duration-200 shadow-2xl">
                                                    <span className="flex items-center justify-center">
                                                        Go to Dashboard
                                                        <ArrowRight className="ml-2 h-4 w-4 lg:h-5 lg:w-5 group-hover:translate-x-1 transition-transform" />
                                                    </span>
                                                </button>
                                            </Link>
                                            <Link to="/upload">
                                                <button className="group relative w-full sm:w-auto px-6 lg:px-8 py-3 lg:py-4 border-2 border-white text-white font-bold rounded-xl hover:bg-white hover:text-indigo-600 transform hover:scale-105 transition-all duration-200">
                                                    <span className="flex items-center justify-center">
                                                        <Upload className="mr-2 h-4 w-4 lg:h-5 lg:w-5" />
                                                        Upload Notes
                                                    </span>
                                                </button>
                                            </Link>
                                        </>
                                    ) : (
                                        <>
                                            <Link to="/register">
                                                <button className="group relative w-full sm:w-auto px-6 lg:px-8 py-3 lg:py-4 bg-white text-indigo-600 font-bold rounded-xl hover:bg-gray-100 transform hover:scale-105 transition-all duration-200 shadow-2xl">
                                                    <span className="flex items-center justify-center">
                                                        Get Started Free
                                                        <ArrowRight className="ml-2 h-4 w-4 lg:h-5 lg:w-5 group-hover:translate-x-1 transition-transform" />
                                                    </span>
                                                </button>
                                            </Link>
                                            <Link to="/notes">
                                                <button className="group relative w-full sm:w-auto px-6 lg:px-8 py-3 lg:py-4 border-2 border-white text-white font-bold rounded-xl hover:bg-white hover:text-indigo-600 transform hover:scale-105 transition-all duration-200">
                                                    <span className="flex items-center justify-center">
                                                        <BookOpen className="mr-2 h-4 w-4 lg:h-5 lg:w-5" />
                                                        Browse Notes
                                                    </span>
                                                </button>
                                            </Link>
                                        </>
                                    )}
                                </div>

                                <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 lg:gap-6 text-white text-xs lg:text-sm opacity-75">
                                    <div className="flex items-center">
                                        <Clock className="w-3 h-3 lg:w-4 lg:h-4 mr-1" />
                                        <span>24/7 Access</span>
                                    </div>
                                    <div className="flex items-center">
                                        <Shield className="w-3 h-3 lg:w-4 lg:h-4 mr-1" />
                                        <span>100% Secure</span>
                                    </div>
                                 
                                </div>
                            </div>
                        </div>

                        <div className="lg:col-span-5 mt-8 lg:mt-0">
                            <div className="relative max-w-md mx-auto lg:max-w-none">
                                <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-600 rounded-3xl transform rotate-6 opacity-20 animate-pulse-glow"></div>
                                <div className="relative glass rounded-3xl p-6 lg:p-8 border border-white border-opacity-20 hover-lift">
                                    <div className="text-center text-white">
                                        <h3 className="text-xl lg:text-2xl font-bold mb-4 lg:mb-6">Quick Stats</h3>
                                        <div className="grid grid-cols-2 gap-4 lg:gap-6">
                                            {stats.map((stat, index) => (
                                                <div key={index} className="text-center group">
                                                    <div className="w-10 h-10 lg:w-12 lg:h-12 bg- from-blue-500 to-purple-600 bg-opacity-20 rounded-xl flex items-center justify-center mx-auto mb-2 lg:mb-3 group-hover:scale-110 transition-transform duration-300">
                                                        <stat.icon className="w-5 h-5 lg:w-6 lg:h-6 text-white" />
                                                    </div>
                                                    <div className="text-lg lg:text-2xl font-bold">{stat.number}</div>
                                                    <div className="text-xs lg:text-sm opacity-75">{stat.label}</div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

              
            </section>

            {/* Features Section */}
            <section className="py-16 lg:py-24 bg-gray-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-12 lg:mb-16">
                        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-4 lg:mb-6">
                            Everything You Need to
                            <span className="text-gradient"> Succeed</span>
                        </h2>
                        <p className="text-lg lg:text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
                            Our comprehensive platform provides all the tools and features you need
                            to excel in your academic journey and connect with fellow students.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
                        {features.map((feature, index) => (
                            <div key={index} className="group relative">
                                <div className="card card-hover p-6 lg:p-8 h-full relative overflow-hidden">
                                    {/* Background gradient overlay on hover */}
                                    <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-purple-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

                                    <div className="relative z-10">
                                        <div className={`w-12 h-12 lg:w-16 lg:h-16 ${feature.color} rounded-2xl flex items-center justify-center mb-4 lg:mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg`}>
                                            <feature.icon className="w-6 h-6 lg:w-8 lg:h-8 text-white" />
                                        </div>
                                        <h3 className="text-lg lg:text-xl font-bold text-gray-900 mb-3 lg:mb-4 group-hover:text-indigo-600 transition-colors duration-300">
                                            {feature.title}
                                        </h3>
                                        <p className="text-gray-600 leading-relaxed text-sm lg:text-base group-hover:text-gray-700 transition-colors duration-300">
                                            {feature.description}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Benefits Section */}
            <section className="py-16 lg:py-24 bg-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="lg:grid lg:grid-cols-2 lg:gap-16 items-center">
                        <div className="mb-12 lg:mb-0">
                            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4 lg:mb-6">
                                Why Students Choose
                                <span className="text-gradient"> Campus Share</span>
                            </h2>
                            <p className="text-lg lg:text-xl text-gray-600 mb-6 lg:mb-8 leading-relaxed">
                                We've built the most comprehensive and user-friendly platform
                                for academic collaboration. Here's what makes us different.
                            </p>

                            <div className="space-y-4 lg:space-y-6">
                                {benefits.map((benefit, index) => (
                                    <div key={index} className="flex items-start">
                                        <div className="flex-shrink-0">
                                            <div className="w-10 h-10 lg:w-12 lg:h-12 bg-indigo-100 rounded-xl flex items-center justify-center">
                                                <benefit.icon className="w-5 h-5 lg:w-6 lg:h-6 text-indigo-600" />
                                            </div>
                                        </div>
                                        <div className="ml-3 lg:ml-4">
                                            <h3 className="text-base lg:text-lg font-semibold text-gray-900 mb-1 lg:mb-2">
                                                {benefit.title}
                                            </h3>
                                            <p className="text-gray-600 text-sm lg:text-base leading-relaxed">
                                                {benefit.description}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="mt-8 lg:mt-0">
                            <div className="relative max-w-md mx-auto lg:max-w-none">
                                <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-3xl transform rotate-3 opacity-10 animate-pulse-glow"></div>
                                <div className="relative bg-white rounded-3xl shadow-2xl p-6 lg:p-8 border border-gray-100 hover-lift">
                                    <div className="text-center">
                                        <div className="w-16 h-16 lg:w-20 lg:h-20 bg-gradient-primary rounded-2xl flex items-center justify-center mx-auto mb-4 lg:mb-6 hover:scale-110 transition-transform duration-300">
                                            <Play className="w-8 h-8 lg:w-10 lg:h-10 text-white" />
                                        </div>
                                        <h3 className="text-xl lg:text-2xl font-bold text-gray-900 mb-3 lg:mb-4">
                                            See It In Action
                                        </h3>
                                        <p className="text-gray-600 mb-4 lg:mb-6 text-sm lg:text-base leading-relaxed">
                                            Watch how easy it is to upload, search, and download study materials.
                                        </p>
                                        <button className="btn-primary w-full sm:w-auto hover:shadow-xl transition-shadow duration-300">
                                            Watch Demo
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Testimonials Section */}
            <section className="py-16 lg:py-24 bg-gray-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-12 lg:mb-16">
                        <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4 lg:mb-6">
                            What Students Say About Us
                        </h2>
                        <p className="text-lg lg:text-xl text-gray-600 leading-relaxed">
                            Don't just take our word for it. Here's what our community has to say.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
                        {testimonials.map((testimonial, index) => (
                            <div key={index} className="card card-hover p-6 lg:p-8 relative overflow-hidden group">
                                {/* Quote icon background */}
                                <div className="absolute top-4 right-4 opacity-10 group-hover:opacity-20 transition-opacity duration-300">
                                    <svg className="w-12 h-12 text-indigo-600" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M4.583 17.321C3.553 16.227 3 15 3 13.011c0-3.5 2.457-6.637 6.03-8.188l.893 1.378c-3.335 1.804-3.987 4.145-4.247 5.621.537-.278 1.24-.375 1.929-.311 1.804.167 3.226 1.648 3.226 3.489a3.5 3.5 0 01-3.5 3.5c-1.073 0-2.099-.49-2.748-1.179zm10 0C13.553 16.227 13 15 13 13.011c0-3.5 2.457-6.637 6.03-8.188l.893 1.378c-3.335 1.804-3.987 4.145-4.247 5.621.537-.278 1.24-.375 1.929-.311 1.804.167 3.226 1.648 3.226 3.489a3.5 3.5 0 01-3.5 3.5c-1.073 0-2.099-.49-2.748-1.179z" />
                                    </svg>
                                </div>

                                <div className="relative z-10">
                                    <div className="flex items-center mb-3 lg:mb-4">
                                        {[...Array(testimonial.rating)].map((_, i) => (
                                            <Star key={i} className="w-4 h-4 lg:w-5 lg:h-5 text-yellow-400 fill-current" />
                                        ))}
                                    </div>
                                    <p className="text-gray-600 mb-4 lg:mb-6 italic text-sm lg:text-base leading-relaxed font-medium">
                                        "{testimonial.content}"
                                    </p>
                                    <div className="flex items-center">
                                        <div className="w-10 h-10 lg:w-12 lg:h-12 bg-gradient-primary rounded-full flex items-center justify-center text-white font-bold mr-3 lg:mr-4 text-sm lg:text-base shadow-lg">
                                            {testimonial.avatar}
                                        </div>
                                        <div>
                                            <div className="font-semibold text-gray-900 text-sm lg:text-base">{testimonial.name}</div>
                                            <div className="text-xs lg:text-sm text-gray-500">{testimonial.role}</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-16 lg:py-24 bg-gradient-hero text-white">
                <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
                    <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4 lg:mb-6">
                        Ready to Transform Your Academic Journey?
                    </h2>
                    <p className="text-lg lg:text-xl mb-6 lg:mb-8 opacity-90 leading-relaxed">
                        Join thousands of students who are already sharing knowledge and achieving success together.
                    </p>

                    {!isAuthenticated && (
                        <div className="flex flex-col sm:flex-row gap-3 lg:gap-4 justify-center">
                            <Link to="/register">
                                <button className="w-full sm:w-auto px-6 lg:px-8 py-3 lg:py-4 bg-white text-indigo-600 font-bold rounded-xl hover:bg-gray-100 transform hover:scale-105 transition-all duration-200 shadow-2xl">
                                    Get Started Free
                                </button>
                            </Link>
                            <Link to="/notes">
                                <button className="w-full sm:w-auto px-6 lg:px-8 py-3 lg:py-4 border-2 border-white text-white font-bold rounded-xl hover:bg-white hover:text-indigo-600 transform hover:scale-105 transition-all duration-200">
                                    Browse Notes
                                </button>
                            </Link>
                        </div>
                    )}
                </div>
            </section>
        </div>
    );
};

export default Home;