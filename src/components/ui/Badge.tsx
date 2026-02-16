import React from 'react';

interface BadgeProps {
    children: React.ReactNode;
    status: 'draft' | 'created' | 'approved' | 'pending' | 'locked' | 'submitted' | 'assigned' | 'testing' | 'review' | 'completed';
}

export const Badge: React.FC<BadgeProps> = ({ children, status }) => {
    const statusClasses = {
        draft: 'bg-gray-100 text-gray-800 border-gray-300',
        created: 'bg-gray-100 text-gray-800 border-gray-300',
        approved: 'bg-green-100 text-green-800 border-green-300',
        pending: 'bg-yellow-100 text-yellow-800 border-yellow-300',
        locked: 'bg-blue-100 text-blue-800 border-blue-300',
        submitted: 'bg-purple-100 text-purple-800 border-purple-300',
        assigned: 'bg-indigo-100 text-indigo-800 border-indigo-300',
        testing: 'bg-orange-100 text-orange-800 border-orange-300',
        review: 'bg-cyan-100 text-cyan-800 border-cyan-300',
        completed: 'bg-emerald-100 text-emerald-800 border-emerald-300',
    };

    return (
        <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${statusClasses[status]}`}>
            {children}
        </span>
    );
};
