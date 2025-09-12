import { Loader2 } from 'lucide-react';

const LoadingSpinner = ({ size = 'md', text = 'Loading...' }) => {
    const sizes = {
        sm: 'w-4 h-4',
        md: 'w-8 h-8',
        lg: 'w-12 h-12',
    };

    const textSizes = {
        sm: 'text-sm',
        md: 'text-base',
        lg: 'text-lg',
    };

    return (
        <div className="flex flex-col items-center justify-center p-8 space-y-2">
            <Loader2 className={`${sizes[size]} animate-spin text-blue-600`} />
            <p className={`${textSizes[size]} text-gray-600`}>{text}</p>
        </div>
    );
};

export default LoadingSpinner;
