import React from 'react';

interface InputProps {
    label?: string;
    type?: string;
    value: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    placeholder?: string;
    required?: boolean;
    disabled?: boolean;
    className?: string;
    error?: string;
}

export const Input: React.FC<InputProps> = ({
    label,
    type = 'text',
    value,
    onChange,
    placeholder,
    required = false,
    disabled = false,
    className = '',
    error,
}) => {
    return (
        <div className={`mb-4 ${className}`}>
            {label && (
                <label className="block text-sm font-semibold text-neutral-textPrimary mb-2">
                    {label}
                    {required && <span className="text-status-error ml-1">*</span>}
                </label>
            )}
            <input
                type={type}
                value={value}
                onChange={onChange}
                placeholder={placeholder}
                required={required}
                disabled={disabled}
                className={`w-full px-4 py-2.5 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-100 focus:border-primary-500 transition-all duration-200 ${error ? 'border-status-error' : 'border-neutral-border'
                    } ${disabled ? 'bg-gray-50 cursor-not-allowed' : ''}`}
            />
            {error && <p className="mt-1 text-sm text-status-error">{error}</p>}
        </div>
    );
};
