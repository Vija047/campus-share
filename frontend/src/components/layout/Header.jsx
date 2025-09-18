import { useState, useEffect } from 'react';
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
    Bell,
    Search,
    Settings,
    Users,
    PieChart,
    ChevronDown,
    Trash2,
    CheckCheck,
    ExternalLink
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useNotifications } from '../../hooks/useNotifications';
import Button from '../common/Button';

const Header = () => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
    const { user, isAuthenticated, logout } = useAuth();
    const {
        notifications,
        unreadCount,
        isLoading: notificationsLoading,
        fetchNotifications,
        fetchNotificationCount,
        markAllAsRead,
        deleteNotification,
        handleNotificationClick,
        formatMessage,
        getIcon,
        getRelativeTime
    } = useNotifications();
    const navigate = useNavigate();
    const location = useLocation();

    const handleLogout = () => {
        logout();
        navigate('/');
        setIsProfileOpen(false);
    };

    const navigation = [
        { name: 'Home', href: '/', icon: Home },
        { name: 'Notes', href: '/notes', icon: BookOpen }
    ];

    const authenticatedNavigation = [
        { name: 'Dashboard', href: '/dashboard', icon: PieChart },
        { name: 'Upload', href: '/upload', icon: Upload },
        { name: 'Bookmarks', href: '/bookmarks', icon: Bookmark },
    ];

    const isActiveLink = (href) => {
        return location.pathname === href;
    };

    // Fetch notifications when component mounts or when notifications dropdown opens
    useEffect(() => {
        if (isAuthenticated && isNotificationsOpen && !notificationsLoading) {
            fetchNotifications({ limit: 10 });
        }
    }, [isAuthenticated, isNotificationsOpen, notificationsLoading, fetchNotifications]);

    // Fetch notification count on mount
    useEffect(() => {
        if (isAuthenticated) {
            fetchNotificationCount();
        }
    }, [isAuthenticated, fetchNotificationCount]);

    return (
        <header className="bg-white shadow-lg border-b border-gray-200 sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    {/* Logo */}
                    <div className="flex items-center">
                        <Link to="/" className="flex items-center space-x-3 group">
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
                    <nav className="hidden lg:flex space-x-1">
                        {navigation.map((item) => (
                            <Link
                                key={item.name}
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
                                key={item.name}
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
                    <div className="flex items-center space-x-4">
                        {/* Search Button */}
                        <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                            <Search className="w-5 h-5" />
                        </button>

                        {isAuthenticated ? (
                            <>
                                {/* Notifications */}
                                <div className="relative">
                                    <button
                                        onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
                                        className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors relative"
                                    >
                                        <Bell className="w-5 h-5" />
                                        {unreadCount > 0 && (
                                            <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                                                {unreadCount}
                                            </span>
                                        )}
                                    </button>

                                    {/* Notifications Dropdown */}
                                    {isNotificationsOpen && (
                                        <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-lg border border-gray-200 py-2 z-50">
                                            <div className="px-4 py-2 border-b border-gray-100 flex justify-between items-center">
                                                <h3 className="text-lg font-semibold text-gray-900">Notifications</h3>
                                                {unreadCount > 0 && (
                                                    <button
                                                        onClick={markAllAsRead}
                                                        className="flex items-center text-sm text-blue-600 hover:text-blue-500 transition-colors"
                                                        title="Mark all as read"
                                                    >
                                                        <CheckCheck className="w-4 h-4 mr-1" />
                                                        Mark all read
                                                    </button>
                                                )}
                                            </div>
                                            <div className="max-h-96 overflow-y-auto">
                                                {notificationsLoading ? (
                                                    <div className="px-4 py-6 text-center text-gray-500">
                                                        <div className="animate-spin w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full mx-auto"></div>
                                                        <p className="mt-2 text-sm">Loading notifications...</p>
                                                    </div>
                                                ) : notifications.length === 0 ? (
                                                    <div className="px-4 py-6 text-center text-gray-500">
                                                        <Bell className="w-12 h-12 mx-auto text-gray-300 mb-2" />
                                                        <p className="text-sm">No notifications yet</p>
                                                    </div>
                                                ) : (
                                                    notifications.map((notification) => (
                                                        <div
                                                            key={notification._id}
                                                            className={`px-4 py-3 hover:bg-gray-50 cursor-pointer border-b border-gray-50 relative group ${!notification.isRead ? 'bg-blue-50 border-l-4 border-l-blue-500' : ''
                                                                }`}
                                                            onClick={() => handleNotificationClick(notification, navigate)}
                                                        >
                                                            <div className="flex items-start justify-between">
                                                                <div className="flex-1 min-w-0">
                                                                    <div className="flex items-center mb-1">
                                                                        <span className="text-sm mr-2">
                                                                            {getIcon(notification.type)}
                                                                        </span>
                                                                        <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                                                                            {notification.type.replace('_', ' ')}
                                                                        </span>
                                                                        {!notification.isRead && (
                                                                            <span className="ml-2 w-2 h-2 bg-blue-500 rounded-full"></span>
                                                                        )}
                                                                    </div>
                                                                    <p className="text-sm text-gray-900 line-clamp-2">
                                                                        {formatMessage(notification)}
                                                                    </p>
                                                                    <p className="text-xs text-gray-500 mt-1">
                                                                        {getRelativeTime(notification.createdAt)}
                                                                    </p>
                                                                </div>
                                                                <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                                    <button
                                                                        onClick={(e) => {
                                                                            e.stopPropagation();
                                                                            deleteNotification(notification._id);
                                                                        }}
                                                                        className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                                                                        title="Delete notification"
                                                                    >
                                                                        <Trash2 className="w-4 h-4" />
                                                                    </button>
                                                                    <ExternalLink className="w-4 h-4 text-gray-400" />
                                                                </div>
                                                            </div>
                                                        </div>
                                                    ))
                                                )}
                                            </div>
                                            <div className="px-4 py-2 border-t border-gray-100">
                                                <Link
                                                    to="/notifications"
                                                    className="text-sm text-blue-600 hover:text-blue-500 transition-colors"
                                                    onClick={() => setIsNotificationsOpen(false)}
                                                >
                                                    View all notifications
                                                </Link>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Profile Dropdown */}
                                <div className="relative">
                                    <button
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
                                        <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-lg border border-gray-200 py-2 z-50">
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
                                                    to="/profile"
                                                    className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                                    onClick={() => setIsProfileOpen(false)}
                                                >
                                                    <User className="w-4 h-4 mr-3" />
                                                    View Profile
                                                </Link>
                                                <Link
                                                    to="/dashboard"
                                                    className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                                    onClick={() => setIsProfileOpen(false)}
                                                >
                                                    <PieChart className="w-4 h-4 mr-3" />
                                                    Dashboard
                                                </Link>
                                                <Link
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
                            <div className="flex items-center space-x-3">
                                <Link to="/login">
                                    <Button variant="secondary" size="sm">
                                        Sign In
                                    </Button>
                                </Link>
                                <Link to="/register">
                                    <Button variant="primary" size="sm">
                                        Get Started
                                    </Button>
                                </Link>
                            </div>
                        )}

                        {/* Mobile menu button */}
                        <button
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
                <div className="lg:hidden border-t border-gray-200 bg-white">
                    <div className="px-4 py-4 space-y-2">
                        {navigation.map((item) => (
                            <Link
                                key={item.name}
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
                                        key={item.name}
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
                                    to="/login"
                                    className="block w-full px-3 py-2 text-center border border-gray-300 rounded-lg text-base font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                                    onClick={() => setIsMenuOpen(false)}
                                >
                                    Sign In
                                </Link>
                                <Link
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
            {(isProfileOpen || isNotificationsOpen) && (
                <div
                    className="fixed inset-0 z-40"
                    onClick={() => {
                        setIsProfileOpen(false);
                        setIsNotificationsOpen(false);
                    }}
                ></div>
            )}
        </header>
    );
};

export default Header;