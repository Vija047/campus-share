import { forwardRef } from 'react';

const Select = forwardRef(({
    label,
    error,
    children,
    options,
    className = '',
    ...props
}, ref) => {
    const baseClasses = 'w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors bg-white';
    const errorClasses = error ? 'border-red-500 focus:ring-red-500' : '';

    return (
        <div className="space-y-1">
            {label && (
                <label className="block text-sm font-medium text-gray-700">
                    {label}
                </label>
            )}
            <select
                ref={ref}
                className={`${baseClasses} ${errorClasses} ${className}`}
                {...props}
            >
                {options ? (
                    options.map((option) => (
                        <option key={option.value} value={option.value}>
                            {option.label}
                        </option>
                    ))
                ) : (
                    children
                )}
            </select>
            {error && (
                <p className="text-sm text-red-600">{error}</p>
            )}
        </div>
    );
});

Select.displayName = 'Select';

export default Select;
