import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Menu, X, User, BookOpen, MessageSquare, Upload, Home, LogOut, Bell, Bookmark } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import Button from '../common/Button';

const Header = () => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const { user, isAuthenticated, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    const navigation = [
        { name: 'Home', href: '/', icon: Home },
        { name: 'Notes', href: '/notes', icon: BookOpen },
        
    ];

    const authenticatedNavigation = [
        { name: 'Dashboard', href: '/dashboard', icon: User },
        { name: 'Upload', href: '/upload', icon: Upload },
        { name: 'Bookmarks', href: '/bookmarks', icon: Bookmark },
        
    ];

    const isActiveLink = (href) => {
        return location.pathname === href;
    };

    return (
        <header className="bg-white shadow-lg border-b border-gray-200">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    {/* Logo */}
                    <div className="flex items-center">
                        <Link to="/" className="flex items-center space-x-2">
                            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                                <BookOpen className="w-5 h-5 text-white" />
                            </div>
                            <span className="text-xl font-bold text-gray-900">Notes Hub</span>
                        </Link>
                    </div>

                    {/* Desktop Navigation */}
                    <nav className="hidden md:flex space-x-8">
                        {navigation.map((item) => (
                            <Link
                                key={item.name}
                                to={item.href}
                                className={`flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium transition-colors ${isActiveLink(item.href)
                                    ? 'text-blue-600 bg-blue-50'
                                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                                    }`}
                            >
                                <item.icon className="w-4 h-4" />
                                <span>{item.name}</span>
                            </Link>
                        ))}

                        {isAuthenticated && authenticatedNavigation.map((item) => (
                            <Link
                                key={item.name}
                                to={item.href}
                                className={`flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium transition-colors ${isActiveLink(item.href)
                                    ? 'text-blue-600 bg-blue-50'
                                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                                    }`}
                            >
                                <item.icon className="w-4 h-4" />
                                <span>{item.name}</span>
                            </Link>
                        ))}
                    </nav>

                    {/* User Menu */}
                    <div className="hidden md:flex items-center space-x-4">
                        {isAuthenticated ? (
                            <div className="flex items-center space-x-4">
                                {/* Notifications */}
                                <button className="p-2 text-gray-600 hover:text-gray-900 relative">
                                    <Bell className="w-5 h-5" />
                                    <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full"></span>
                                </button>

                                {/* Profile */}
                                <div className="flex items-center space-x-3">
                                    <div className="text-right">
                                        <p className="text-sm font-medium text-gray-900">{user?.name}</p>
                                        <p className="text-xs text-gray-500">Semester {user?.semester}</p>
                                    </div>
                                    <Link
                                        to="/profile"
                                        className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-semibold"
                                    >
                                        {user?.name?.charAt(0).toUpperCase()}
                                    </Link>
                                </div>

                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={handleLogout}
                                    className="flex items-center space-x-1"
                                >
                                    <LogOut className="w-4 h-4" />
                                    <span>Logout</span>
                                </Button>
                            </div>
                        ) : (
                            <div className="flex items-center space-x-3">
                                <Link to="/login">
                                    <Button variant="outline" size="sm">
                                        Login
                                    </Button>
                                </Link>
                                <Link to="/register">
                                    <Button size="sm">
                                        Sign Up
                                    </Button>
                                </Link>
                            </div>
                        )}
                    </div>

                    {/* Mobile menu button */}
                    <div className="md:hidden">
                        <button
                            onClick={() => setIsMenuOpen(!isMenuOpen)}
                            className="p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                        >
                            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                        </button>
                    </div>
                </div>

                {/* Mobile Navigation */}
                {isMenuOpen && (
                    <div className="md:hidden border-t border-gray-200 py-4">
                        <div className="space-y-2">
                            {navigation.map((item) => (
                                <Link
                                    key={item.name}
                                    to={item.href}
                                    className={`flex items-center space-x-2 px-3 py-2 rounded-md text-base font-medium ${isActiveLink(item.href)
                                        ? 'text-blue-600 bg-blue-50'
                                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                                        }`}
                                    onClick={() => setIsMenuOpen(false)}
                                >
                                    <item.icon className="w-5 h-5" />
                                    <span>{item.name}</span>
                                </Link>
                            ))}

                            {isAuthenticated && authenticatedNavigation.map((item) => (
                                <Link
                                    key={item.name}
                                    to={item.href}
                                    className={`flex items-center space-x-2 px-3 py-2 rounded-md text-base font-medium ${isActiveLink(item.href)
                                        ? 'text-blue-600 bg-blue-50'
                                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                                        }`}
                                    onClick={() => setIsMenuOpen(false)}
                                >
                                    <item.icon className="w-5 h-5" />
                                    <span>{item.name}</span>
                                </Link>
                            ))}

                            {isAuthenticated ? (
                                <div className="pt-4 border-t border-gray-200">
                                    <div className="flex items-center px-3 py-2">
                                        <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-semibold">
                                            {user?.name?.charAt(0).toUpperCase()}
                                        </div>
                                        <div className="ml-3">
                                            <p className="text-base font-medium text-gray-900">{user?.name}</p>
                                            <p className="text-sm text-gray-500">Semester {user?.semester}</p>
                                        </div>
                                    </div>
                                    <Button
                                        variant="outline"
                                        onClick={handleLogout}
                                        className="mx-3 mt-2"
                                    >
                                        Logout
                                    </Button>
                                </div>
                            ) : (
                                <div className="pt-4 border-t border-gray-200 space-y-2">
                                    <Link to="/login" onClick={() => setIsMenuOpen(false)}>
                                        <Button variant="outline" className="w-full mx-3">
                                            Login
                                        </Button>
                                    </Link>
                                    <Link to="/register" onClick={() => setIsMenuOpen(false)}>
                                        <Button className="w-full mx-3">
                                            Sign Up
                                        </Button>
                                    </Link>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </header>
    );
};

export default Header;
