import { forwardRef } from 'react';

const Input = forwardRef(({
    label,
    error,
    className = '',
    type = 'text',
    ...props
}, ref) => {
    const baseClasses = 'w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors';
    const errorClasses = error ? 'border-red-500 focus:ring-red-500' : '';

    return (
        <div className="space-y-1">
            {label && (
                <label className="block text-sm font-medium text-gray-700">
                    {label}
                </label>
            )}
            <input
                ref={ref}
                type={type}
                className={`${baseClasses} ${errorClasses} ${className}`}
                {...props}
            />
            {error && (
                <p className="text-sm text-red-600">{error}</p>
            )}
        </div>
    );
});

Input.displayName = 'Input';

export default Input;
