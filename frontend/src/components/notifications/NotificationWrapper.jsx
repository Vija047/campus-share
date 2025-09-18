import React, { useState, useEffect } from 'react';
import { useNotifications } from '../../hooks/useNotifications';
import NotificationErrorBoundary from './NotificationErrorBoundary';

const NotificationWrapper = ({ children, onError }) => {
    const { error, clearError } = useNotifications();
    const [showError, setShowError] = useState(false);

    useEffect(() => {
        if (error) {
            setShowError(true);
            if (onError) {
                onError(error);
            }
        }
    }, [error, onError]);

    const handleDismissError = () => {
        setShowError(false);
        clearError();
    };

    return (
        <NotificationErrorBoundary>
            {showError && error && (
                <div className="notification-error-alert mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center">
                            <div className="text-red-500 mr-2">⚠️</div>
                            <div>
                                <h4 className="text-sm font-semibold text-red-800">
                                    Notification Error
                                </h4>
                                <p className="text-sm text-red-600">{error}</p>
                            </div>
                        </div>
                        <button
                            onClick={handleDismissError}
                            className="text-red-500 hover:text-red-700 text-xl font-bold"
                            aria-label="Dismiss error"
                        >
                            ×
                        </button>
                    </div>
                </div>
            )}
            {children}
        </NotificationErrorBoundary>
    );
};

export default NotificationWrapper;