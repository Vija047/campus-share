import { Link } from 'react-router-dom';
import { BookOpen, Upload, Users, MessageSquare, Star, Download, TrendingUp } from 'lucide-react';
import Button from '../components/common/Button';
import { useAuth } from '../hooks/useAuth';

const Home = () => {
    const { isAuthenticated } = useAuth();

    const features = [
        {
            icon: Upload,
            title: 'Upload & Share',
            description: 'Upload your notes and share them with your classmates easily.'
        },
        {
            icon: Download,
            title: 'Download Resources',
            description: 'Access thousands of notes and study materials from other students.'
        },
        {
            icon: MessageSquare,
            title: 'Real-time Chat',
            description: 'Connect with your semester mates through dedicated chat rooms.'
        },
        {
            icon: Users,
            title: 'Community Posts',
            description: 'Ask questions, share insights, and help each other learn.'
        },
        {
            icon: Star,
            title: 'Rate & Review',
            description: 'Like and rate notes to help others find the best resources.'
        },
        {
            icon: TrendingUp,
            title: 'Track Progress',
            description: 'Monitor your contributions and see your impact on the community.'
        }
    ];

    const stats = [
        { number: '5,000+', label: 'Notes Shared' },
        { number: '2,000+', label: 'Active Students' },
        { number: '50,000+', label: 'Downloads' },
        { number: '8', label: 'Semesters' }
    ];

    return (
        <div className="overflow-hidden">
            {/* Hero Section */}
            <section className="relative bg-gradient-to-br from-blue-600 via-blue-700 to-purple-700 text-white">
                <div className="absolute inset-0 bg-black opacity-10"></div>
                <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
                    <div className="text-center">
                        <h1 className="text-4xl md:text-6xl font-bold mb-6">
                            Share Knowledge,
                            <span className="block text-yellow-300">Learn Together</span>
                        </h1>
                        <p className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto opacity-90">
                            The ultimate platform for students to upload, download, and share study notes.
                            Connect with your peers and excel in your academics.
                        </p>

                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            {isAuthenticated ? (
                                <>
                                    <Link to="/dashboard">
                                        <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-100">
                                            Go to Dashboard
                                        </Button>
                                    </Link>
                                    <Link to="/upload">
                                        <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-blue-600">
                                            Upload Notes
                                        </Button>
                                    </Link>
                                </>
                            ) : (
                                <>
                                    <Link to="/register">
                                        <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-100">
                                            Get Started Free
                                        </Button>
                                    </Link>
                                    <Link to="/notes">
                                        <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-blue-600">
                                            Browse Notes
                                        </Button>
                                    </Link>
                                </>
                            )}
                        </div>
                    </div>
                </div>

                {/* Decorative elements */}
                <div className="absolute bottom-0 left-0 right-0">
                    <svg viewBox="0 0 1440 120" className="w-full h-16 fill-current text-gray-50">
                        <path d="M0,64L48,69.3C96,75,192,85,288,85.3C384,85,480,75,576,64C672,53,768,43,864,42.7C960,43,1056,53,1152,58.7C1248,64,1344,64,1392,64L1440,64L1440,120L1392,120C1344,120,1248,120,1152,120C1056,120,960,120,864,120C768,120,672,120,576,120C480,120,384,120,288,120C192,120,96,120,48,120L0,120Z"></path>
                    </svg>
                </div>
            </section>

            {/* Stats Section */}
            <section className="py-16 bg-gray-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                        {stats.map((stat, index) => (
                            <div key={index} className="text-center">
                                <div className="text-3xl md:text-4xl font-bold text-blue-600 mb-2">
                                    {stat.number}
                                </div>
                                <div className="text-gray-600 font-medium">{stat.label}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section className="py-20">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                            Everything You Need to Succeed
                        </h2>
                        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                            Our platform provides all the tools and features you need to share knowledge
                            and collaborate with your fellow students.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {features.map((feature, index) => (
                            <div key={index} className="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-shadow border border-gray-100">
                                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-6">
                                    <feature.icon className="w-6 h-6 text-blue-600" />
                                </div>
                                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                                    {feature.title}
                                </h3>
                                <p className="text-gray-600 leading-relaxed">
                                    {feature.description}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-20 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <h2 className="text-3xl md:text-4xl font-bold mb-6">
                        Ready to Join the Community?
                    </h2>
                    <p className="text-xl mb-8 max-w-2xl mx-auto opacity-90">
                        Start sharing your knowledge and accessing resources from thousands of students today.
                    </p>

                    {!isAuthenticated && (
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <Link to="/register">
                                <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-100">
                                    Sign Up Now
                                </Button>
                            </Link>
                            <Link to="/login">
                                <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-blue-600">
                                    Already Have Account?
                                </Button>
                            </Link>
                        </div>
                    )}
                </div>
            </section>
        </div>
    );
};

export default Home;
