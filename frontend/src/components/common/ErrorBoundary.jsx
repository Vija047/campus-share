import React from 'react';
import { RefreshCw, Home, AlertTriangle } from 'lucide-react';

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            hasError: false,
            error: null,
            errorInfo: null,
            retryCount: 0
        };
    }

    static getDerivedStateFromError() {
        // Update state so the next render will show the fallback UI
        return { hasError: true };
    }

    componentDidCatch(error, errorInfo) {
        // Only log errors in development
        if (import.meta.env.DEV) {
            console.error('ErrorBoundary caught an error:', error, errorInfo);
        }

        // Report error to monitoring service if available
        if (typeof window !== 'undefined' && window.gtag && import.meta.env.PROD) {
            window.gtag('event', 'exception', {
                description: error.toString(),
                fatal: false
            });
        }

        this.setState({
            error: error,
            errorInfo: errorInfo
        });
    }

    handleRetry = () => {
        this.setState(prevState => ({
            hasError: false,
            error: null,
            errorInfo: null,
            retryCount: prevState.retryCount + 1
        }));
    }

    handleGoHome = () => {
        window.location.href = '/';
    }

    handleReload = () => {
        window.location.reload();
    }

    render() {
        if (this.state.hasError) {
            // Fallback UI
            return (
                <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
                    <div className="max-w-md w-full bg-white shadow-xl rounded-lg p-8">
                        <div className="text-center">
                            <AlertTriangle className="mx-auto h-16 w-16 text-red-500 mb-4" />

                            <h2 className="text-2xl font-bold text-gray-900 mb-2">
                                Oops! Something went wrong
                            </h2>

                            <p className="text-gray-600 mb-6">
                                {import.meta.env.PROD
                                    ? "We encountered an unexpected error. Please try refreshing the page or go back to the homepage."
                                    : "A development error occurred. Check the console for more details."
                                }
                            </p>

                            {/* Show error details only in development */}
                            {import.meta.env.DEV && this.state.error && (
                                <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 text-left">
                                    <h3 className="text-sm font-medium text-red-800 mb-2">Error Details:</h3>
                                    <pre className="text-xs text-red-700 overflow-auto max-h-32">
                                        {this.state.error.toString()}
                                    </pre>
                                </div>
                            )}

                            <div className="space-y-3">
                                {/* Retry button */}
                                <button
                                    onClick={this.handleRetry}
                                    className="w-full flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                                    disabled={this.state.retryCount >= 3}
                                >
                                    <RefreshCw className="w-4 h-4 mr-2" />
                                    {this.state.retryCount >= 3 ? 'Max retries reached' : 'Try Again'}
                                </button>

                                {/* Home button */}
                                <button
                                    onClick={this.handleGoHome}
                                    className="w-full flex items-center justify-center px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                                >
                                    <Home className="w-4 h-4 mr-2" />
                                    Go to Homepage
                                </button>

                                {/* Reload button */}
                                <button
                                    onClick={this.handleReload}
                                    className="w-full px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                                >
                                    Refresh Page
                                </button>
                            </div>

                            {/* Additional help text */}
                            <p className="text-xs text-gray-500 mt-6">
                                If the problem persists, please contact support.
                            </p>
                        </div>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;