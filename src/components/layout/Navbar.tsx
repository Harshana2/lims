import React from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut, User } from 'lucide-react';
import { Button } from '../ui/Button';

export const Navbar: React.FC = () => {
    const navigate = useNavigate();

    const handleLogout = () => {
        navigate('/');
    };

    return (
        <div className="h-16 bg-white border-b border-gray-200 fixed top-0 right-0 left-64 z-10">
            <div className="h-full px-6 flex items-center justify-between">
                <div className="text-lg font-semibold text-gray-800">
                    Customer Sample Workflow
                </div>

                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2 text-gray-700">
                        <User size={20} />
                        <span className="text-sm font-medium">Admin User</span>
                    </div>

                    <Button
                        variant="secondary"
                        onClick={handleLogout}
                        className="flex items-center gap-2"
                    >
                        <LogOut size={16} />
                        Logout
                    </Button>
                </div>
            </div>
        </div>
    );
};
