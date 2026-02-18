import React from 'react';
import { NavLink } from 'react-router-dom';
import {
    LayoutDashboard,
    FileText,
    DollarSign,
    ClipboardList,
    FlaskConical,
    Database,
    CheckCircle,
    FileBarChart,
    MapPin,
    Calendar,
    Settings,
    FileSearch,
} from 'lucide-react';

const menuItems = [
    { path: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { path: '/requests', icon: FileText, label: 'Requests' },
    { path: '/quotations', icon: DollarSign, label: 'Quotations' },
    { path: '/crf', icon: ClipboardList, label: 'CRF' },
    { path: '/parameter-assignment', icon: FlaskConical, label: 'Parameter Assignment' },
    { path: '/data-entry', icon: Database, label: 'Data Entry' },
    { path: '/environmental-sampling', icon: MapPin, label: 'Environmental Sampling' },
    { path: '/review-sign', icon: CheckCircle, label: 'Review & Sign' },
    { path: '/report-generation', icon: FileBarChart, label: 'Report Generation' },
    { path: '/sample-collection', icon: Calendar, label: 'Sample Collection' },
    { path: '/audit-log', icon: FileSearch, label: 'Audit Log' },
    { path: '/configuration', icon: Settings, label: 'Configuration' },
];

export const Sidebar: React.FC = () => {
    return (
        <div className="w-64 bg-white h-screen border-r border-gray-200 fixed left-0 top-0 overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
                <h1 className="text-2xl font-bold text-primary-700">LIMS</h1>
                <p className="text-sm text-gray-500 mt-1">Laboratory Management</p>
            </div>

            <nav className="p-4">
                {menuItems.map((item) => (
                    <NavLink
                        key={item.path}
                        to={item.path}
                        className={({ isActive }) =>
                            `flex items-center gap-3 px-4 py-3 rounded-lg mb-2 transition-all ${isActive
                                ? 'bg-primary-50 text-primary-700 font-medium'
                                : 'text-gray-600 hover:bg-gray-50'
                            }`
                        }
                    >
                        <item.icon size={20} />
                        <span className="text-sm">{item.label}</span>
                    </NavLink>
                ))}
            </nav>
        </div>
    );
};
