import React from 'react';

interface CardProps {
    children: React.ReactNode;
    className?: string;
}

export const Card: React.FC<CardProps> = ({ children, className = '' }) => {
    return (
        <div className={`bg-neutral-card rounded-card shadow-soft hover:shadow-card-hover transition-shadow duration-200 p-6 border border-neutral-border/50 ${className}`}>
            {children}
        </div>
    );
};
