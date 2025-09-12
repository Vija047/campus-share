import { Link } from 'react-router-dom';
import { Home, BookOpen } from 'lucide-react';
import Button from '../components/common/Button';

const NotFound = () => {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="text-center">
                <div className="flex justify-center mb-8">
                    <div className="w-32 h-32 bg-blue-100 rounded-full flex items-center justify-center">
                        <BookOpen className="w-16 h-16 text-blue-600" />
                    </div>
                </div>

                <h1 className="text-6xl font-bold text-gray-900 mb-4">404</h1>
                <h2 className="text-2xl font-semibold text-gray-700 mb-4">Page Not Found</h2>
                <p className="text-gray-600 mb-8 max-w-md">
                    Sorry, we couldn't find the page you're looking for.
                    It might have been moved, deleted, or the URL might be incorrect.
                </p>

                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Link to="/">
                        <Button className="flex items-center space-x-2">
                            <Home className="w-4 h-4" />
                            <span>Go Home</span>
                        </Button>
                    </Link>
                    <Link to="/notes">
                        <Button variant="outline">Browse Notes</Button>
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default NotFound;
