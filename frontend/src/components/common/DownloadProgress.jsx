import React from 'react';
import { Download, CheckCircle, XCircle } from 'lucide-react';

const DownloadProgress = ({
    fileName,
    progress = 0,
    status = 'downloading', // 'downloading', 'completed', 'error'
    error = null
}) => {
    const getStatusIcon = () => {
        switch (status) {
            case 'completed':
                return <CheckCircle className="h-5 w-5 text-green-500" />;
            case 'error':
                return <XCircle className="h-5 w-5 text-red-500" />;
            default:
                return <Download className="h-5 w-5 text-blue-500 animate-pulse" />;
        }
    };

    const getStatusText = () => {
        switch (status) {
            case 'completed':
                return 'Download completed';
            case 'error':
                return error || 'Download failed';
            default:
                return `Downloading... ${Math.round(progress)}%`;
        }
    };

    const getStatusColor = () => {
        switch (status) {
            case 'completed':
                return 'text-green-600';
            case 'error':
                return 'text-red-600';
            default:
                return 'text-blue-600';
        }
    };

    return (
        <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
            <div className="flex items-center space-x-3">
                {getStatusIcon()}
                <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                        {fileName}
                    </p>
                    <p className={`text-xs ${getStatusColor()}`}>
                        {getStatusText()}
                    </p>
                </div>
            </div>

            {status === 'downloading' && (
                <div className="mt-3">
                    <div className="bg-gray-200 rounded-full h-2">
                        <div
                            className="bg-blue-500 h-2 rounded-full transition-all duration-300 ease-out"
                            style={{ width: `${Math.min(progress, 100)}%` }}
                        />
                    </div>
                </div>
            )}

            {status === 'completed' && (
                <div className="mt-2 text-xs text-gray-500">
                    File saved to your Downloads folder
                </div>
            )}
        </div>
    );
};

export default DownloadProgress;