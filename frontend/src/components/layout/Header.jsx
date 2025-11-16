import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
    Menu,
    X,
    User,
    BookOpen,
    MessageSquare,
    Upload,
    Home,
    LogOut,
    Bookmark,
    Search,
    Settings,
    Users,
    PieChart,
    ChevronDown
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import Button from '../common/Button';

const Header = () => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const { user, isAuthenticated, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    const handleLogout = () => {
        logout();
        navigate('/');
        setIsProfileOpen(false);
    };

    const navigation = [
        { id: 'campus-nav-home', name: 'Home', href: '/', icon: Home },
        { id: 'campus-nav-notes', name: 'Notes', href: '/notes', icon: BookOpen },
        { id: 'campus-nav-community', name: 'Community', href: '/community', icon: MessageSquare }
    ];

    const authenticatedNavigation = [
        { id: 'campus-nav-dashboard', name: 'Dashboard', href: '/dashboard', icon: PieChart },
        { id: 'campus-nav-upload', name: 'Upload', href: '/upload', icon: Upload },
        { id: 'campus-nav-add', name: 'Add', href: '/add', icon: Users },
        { id: 'campus-nav-bookmarks', name: 'Bookmarks', href: '/bookmarks', icon: Bookmark },
    ];

    const isActiveLink = (href) => {
        return location.pathname === href;
    };

    return (
        <header id="campus-share-header" className="bg-white shadow-lg border-b border-gray-200 sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    {/* Logo */}
                    <div className="flex items-center">
                        <Link to="/" className="flex items-center space-x-3 group" id="campus-share-logo">
                            <div className="w-10 h-10 bg-gradient-primary rounded-xl flex items-center justify-center group-hover:scale-105 transition-transform duration-200">
                                <BookOpen className="w-6 h-6 text-white" />
                            </div>
                            <div className="hidden sm:block">
                                <span className="text-xl font-bold text-gray-900">Campus</span>
                                <span className="text-xl font-bold text-gray-900 ">Share</span>
                            </div>
                        </Link>
                    </div>

                    {/* Desktop Navigation */}
                    <nav className="hidden lg:flex space-x-1" id="campus-desktop-nav">{navigation.map((item) => (
                        <Link
                            key={item.id}
                            id={item.id}
                            to={item.href}
                            className={`flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${isActiveLink(item.href)
                                ? 'bg-blue-50 text-blue-600 shadow-sm'
                                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                                }`}
                        >
                            <item.icon className="w-4 h-4 mr-2" />
                            {item.name}
                        </Link>
                    ))}

                        {isAuthenticated && authenticatedNavigation.map((item) => (
                            <Link
                                key={item.id}
                                id={item.id}
                                to={item.href}
                                className={`flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${isActiveLink(item.href)
                                    ? 'bg-blue-50 text-blue-600 shadow-sm'
                                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                                    }`}
                            >
                                <item.icon className="w-4 h-4 mr-2" />
                                {item.name}
                            </Link>
                        ))}
                    </nav>

                    {/* Right Side */}
                    <div className="flex items-center space-x-4" id="campus-header-actions">
                        {/* Search Button */}
                        <button
                            id="campus-search-btn"
                            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                        >
                            <Search className="w-5 h-5" />
                        </button>

                        {isAuthenticated ? (
                            <>
                                {/* Profile Dropdown */}
                                <div className="relative" id="campus-profile-dropdown">
                                    <button
                                        id="campus-profile-btn"
                                        onClick={() => setIsProfileOpen(!isProfileOpen)}
                                        className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-100 transition-colors"
                                    >
                                        <div className="w-8 h-8 bg-gradient-primary rounded-full flex items-center justify-center text-white text-sm font-medium">
                                            {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                                        </div>
                                        <span className="hidden md:block text-sm font-medium text-gray-700">
                                            {user?.name || 'User'}
                                        </span>
                                        <ChevronDown className="w-4 h-4 text-gray-500" />
                                    </button>

                                    {/* Profile Dropdown Menu */}
                                    {isProfileOpen && (
                                        <div id="campus-profile-menu" className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-lg border border-gray-200 py-2 z-50">
                                            <div className="px-4 py-3 border-b border-gray-100">
                                                <div className="flex items-center space-x-3">
                                                    <div className="w-10 h-10 bg-gradient-primary rounded-full flex items-center justify-center text-white font-medium">
                                                        {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-medium text-gray-900">{user?.name}</p>
                                                        <p className="text-xs text-gray-500">{user?.email}</p>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="py-1">
                                                <Link
                                                    id="campus-profile-link"
                                                    to="/profile"
                                                    className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                                    onClick={() => setIsProfileOpen(false)}
                                                >
                                                    <User className="w-4 h-4 mr-3" />
                                                    View Profile
                                                </Link>
                                                <Link
                                                    id="campus-dashboard-link"
                                                    to="/dashboard"
                                                    className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                                    onClick={() => setIsProfileOpen(false)}
                                                >
                                                    <PieChart className="w-4 h-4 mr-3" />
                                                    Dashboard
                                                </Link>
                                                <Link
                                                    id="campus-bookmarks-link"
                                                    to="/bookmarks"
                                                    className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                                    onClick={() => setIsProfileOpen(false)}
                                                >
                                                    <Bookmark className="w-4 h-4 mr-3" />
                                                    Bookmarks
                                                </Link>

                                            </div>

                                            <div className="border-t border-gray-100 py-1">
                                                <button
                                                    id="campus-logout-btn"
                                                    onClick={handleLogout}
                                                    className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                                                >
                                                    <LogOut className="w-4 h-4 mr-3" />
                                                    Sign Out
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </>
                        ) : (
                            <div className="flex items-center space-x-3" id="campus-auth-buttons">
                                <Link to="/login" id="campus-signin-link">
                                    <Button variant="secondary" size="sm">
                                        Sign In
                                    </Button>
                                </Link>
                                <Link to="/register" id="campus-signup-link">
                                    <Button variant="primary" size="sm">
                                        Get Started
                                    </Button>
                                </Link>
                            </div>
                        )}

                        {/* Mobile menu button */}
                        <button
                            id="campus-mobile-menu-btn"
                            onClick={() => setIsMenuOpen(!isMenuOpen)}
                            className="lg:hidden p-2 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors"
                        >
                            {isMenuOpen ? (
                                <X className="w-6 h-6" />
                            ) : (
                                <Menu className="w-6 h-6" />
                            )}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Navigation */}
            {isMenuOpen && (
                <div id="campus-mobile-nav" className="lg:hidden border-t border-gray-200 bg-white">
                    <div className="px-4 py-4 space-y-2">
                        {navigation.map((item) => (
                            <Link
                                key={`mobile-${item.id}`}
                                id={`mobile-${item.id}`}
                                to={item.href}
                                className={`flex items-center px-3 py-2 rounded-lg text-base font-medium transition-colors ${isActiveLink(item.href)
                                    ? 'bg-blue-50 text-blue-600'
                                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                                    }`}
                                onClick={() => setIsMenuOpen(false)}
                            >
                                <item.icon className="w-5 h-5 mr-3" />
                                {item.name}
                            </Link>
                        ))}

                        {isAuthenticated && (
                            <>
                                <div className="border-t border-gray-200 my-3"></div>
                                {authenticatedNavigation.map((item) => (
                                    <Link
                                        key={`mobile-${item.id}`}
                                        id={`mobile-${item.id}`}
                                        to={item.href}
                                        className={`flex items-center px-3 py-2 rounded-lg text-base font-medium transition-colors ${isActiveLink(item.href)
                                            ? 'bg-blue-50 text-blue-600'
                                            : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                                            }`}
                                        onClick={() => setIsMenuOpen(false)}
                                    >
                                        <item.icon className="w-5 h-5 mr-3" />
                                        {item.name}
                                    </Link>
                                ))}
                                <div className="border-t border-gray-200 my-3"></div>
                                <button
                                    id="campus-mobile-logout"
                                    onClick={handleLogout}
                                    className="flex items-center w-full px-3 py-2 rounded-lg text-base font-medium text-red-600 hover:bg-red-50 transition-colors"
                                >
                                    <LogOut className="w-5 h-5 mr-3" />
                                    Sign Out
                                </button>
                            </>
                        )}

                        {!isAuthenticated && (
                            <div className="border-t border-gray-200 pt-4 space-y-2">
                                <Link
                                    id="campus-mobile-signin"
                                    to="/login"
                                    className="block w-full px-3 py-2 text-center border border-gray-300 rounded-lg text-base font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                                    onClick={() => setIsMenuOpen(false)}
                                >
                                    Sign In
                                </Link>
                                <Link
                                    id="campus-mobile-signup"
                                    to="/register"
                                    className="block w-full px-3 py-2 text-center bg-gradient-primary rounded-lg text-base font-medium text-white hover:opacity-90 transition-opacity"
                                    onClick={() => setIsMenuOpen(false)}
                                >
                                    Get Started
                                </Link>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Click outside to close dropdowns */}
            {isProfileOpen && (
                <div
                    id="campus-profile-overlay"
                    className="fixed inset-0 z-40"
                    onClick={() => {
                        setIsProfileOpen(false);
                    }}
                ></div>
            )}
        </header>
    );
};

export default Header;