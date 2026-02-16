import React from 'react';

interface BadgeProps {
    children: React.ReactNode;
    status: 'created' | 'approved' | 'pending' | 'locked' | 'submitted';
}

export const Badge: React.FC<BadgeProps> = ({ children, status }) => {
    const statusClasses = {
        created: 'bg-gray-100 text-gray-800 border-gray-300',
        approved: 'bg-green-100 text-green-800 border-green-300',
        pending: 'bg-yellow-100 text-yellow-800 border-yellow-300',
        locked: 'bg-blue-100 text-blue-800 border-blue-300',
        submitted: 'bg-purple-100 text-purple-800 border-purple-300',
    };

    return (
        <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${statusClasses[status]}`}>
            {children}
        </span>
    );
};
