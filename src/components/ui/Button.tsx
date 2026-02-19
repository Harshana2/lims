import React from 'react';

interface ButtonProps {
    children: React.ReactNode;
    onClick?: () => void;
    variant?: 'primary' | 'secondary' | 'danger' | 'success';
    type?: 'button' | 'submit' | 'reset';
    disabled?: boolean;
    className?: string;
}

export const Button: React.FC<ButtonProps> = ({
    children,
    onClick,
    variant = 'primary',
    type = 'button',
    disabled = false,
    className = '',
}) => {
    const baseClasses = 'font-semibold py-2.5 px-6 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center';

    const variantClasses = {
        primary: 'bg-primary-500 hover:bg-primary-600 active:bg-primary-700 text-white shadow-soft hover:shadow-md',
        secondary: 'bg-neutral-border hover:bg-gray-300 text-neutral-textPrimary shadow-sm hover:shadow',
        danger: 'bg-status-error hover:bg-red-700 text-white shadow-soft hover:shadow-md',
        success: 'bg-status-success hover:bg-green-700 text-white shadow-soft hover:shadow-md',
    };

    return (
        <button
            type={type}
            onClick={onClick}
            disabled={disabled}
            className={`${baseClasses} ${variantClasses[variant]} ${className}`}
        >
            {children}
        </button>
    );
};
