import React from 'react';

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null, errorInfo: null };
    }

    static getDerivedStateFromError() {
        // Update state so the next render will show the fallback UI
        return { hasError: true };
    }

    componentDidCatch(error, errorInfo) {
        // Log the error to console
        console.error('ErrorBoundary caught an error:', error, errorInfo);

        this.setState({
            error: error,
            errorInfo: errorInfo
        });
    }

    render() {
        if (this.state.hasError) {
            // Fallback UI
            return (
                <div className="min-h-screen flex items-center justify-center bg-gray-50">
                    <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-6">
                        <div className="text-center">
                            <div className="text-red-500 text-6xl mb-4">
                                ⚠️
                            </div>
                            <h2 className="text-2xl font-bold text-gray-900 mb-2">
                                Something went wrong
                            </h2>
                            <p className="text-gray-600 mb-6">
                                We encountered an unexpected error. Please try refreshing the page.
                            </p>
                            <div className="space-y-3">
                                <button
                                    onClick={() => window.location.reload()}
                                    className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
                                >
                                    Refresh Page
                                </button>
                                <button
                                    onClick={() => this.setState({ hasError: false, error: null, errorInfo: null })}
                                    className="w-full bg-gray-200 text-gray-800 py-2 px-4 rounded-md hover:bg-gray-300 transition-colors"
                                >
                                    Try Again
                                </button>
                            </div>

                            {import.meta.env.DEV && (
                                <details className="mt-6 text-left">
                                    <summary className="cursor-pointer text-sm text-gray-500 hover:text-gray-700">
                                        Error Details (Development)
                                    </summary>
                                    <div className="mt-2 p-3 bg-gray-100 rounded text-xs font-mono text-gray-700 overflow-auto max-h-40">
                                        <div className="font-bold mb-2">Error:</div>
                                        <div className="mb-3">{this.state.error && this.state.error.toString()}</div>
                                        <div className="font-bold mb-2">Stack Trace:</div>
                                        <div>{this.state.errorInfo.componentStack}</div>
                                    </div>
                                </details>
                            )}
                        </div>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;