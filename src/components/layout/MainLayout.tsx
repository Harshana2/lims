import React from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Navbar } from './Navbar';

export const MainLayout: React.FC = () => {
    return (
        <div className="min-h-screen bg-gray-50">
            <Sidebar />
            <Navbar />

            <main className="ml-64 pt-16">
                <div className="p-8">
                    <Outlet />
                </div>
            </main>
        </div>
    );
};
