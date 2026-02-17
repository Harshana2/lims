import React, { useState } from 'react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../components/ui/Table';
import { Settings, Users, Building2, Beaker, Plus, Edit, Trash2 } from 'lucide-react';
import { mockCustomers, mockParameters, sampleTypeConfigs } from '../data/mockData';

type TabType = 'users' | 'roles' | 'customers' | 'parameters';

interface User {
    id: string;
    name: string;
    email: string;
    role: string;
    status: 'active' | 'inactive';
}

interface UserRole {
    id: string;
    name: string;
    permissions: string[];
}

export const ConfigurationPage: React.FC = () => {
    const [activeTab, setActiveTab] = useState<TabType>('users');
    
    // Mock data
    const [users] = useState<User[]>([
        { id: '1', name: 'Admin User', email: 'admin@lims.lk', role: 'Administrator', status: 'active' },
        { id: '2', name: 'D.H.S. Costa', email: 'costa@lims.lk', role: 'Chemist', status: 'active' },
        { id: '3', name: 'Intake Officer', email: 'intake@lims.lk', role: 'Intake Officer', status: 'active' },
        { id: '4', name: 'Supervisor', email: 'supervisor@lims.lk', role: 'Supervisor', status: 'active' },
    ]);

    const [roles] = useState<UserRole[]>([
        { id: '1', name: 'Administrator', permissions: ['All Access'] },
        { id: '2', name: 'Intake Officer', permissions: ['Create Request', 'Create Quotation', 'Create CRF', 'Schedule Collection'] },
        { id: '3', name: 'Chemist', permissions: ['View Assignments', 'Enter Test Data'] },
        { id: '4', name: 'Supervisor', permissions: ['Review Results', 'Approve CRF'] },
        { id: '5', name: 'Manager', permissions: ['Generate Reports', 'View Dashboard', 'All Access'] },
    ]);

    const tabs = [
        { id: 'users' as TabType, label: 'Users', icon: Users },
        { id: 'roles' as TabType, label: 'User Roles', icon: Settings },
        { id: 'customers' as TabType, label: 'Customers', icon: Building2 },
        { id: 'parameters' as TabType, label: 'Test Parameters', icon: Beaker },
    ];

    return (
        <div>
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-gray-800">Configuration</h1>
                    <p className="text-sm text-gray-600 mt-1">Manage system settings, users, and test parameters</p>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-2 mb-6 border-b border-gray-200">
                {tabs.map(tab => {
                    const Icon = tab.icon;
                    return (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex items-center gap-2 px-4 py-3 font-medium transition-colors border-b-2 ${
                                activeTab === tab.id
                                    ? 'border-primary-600 text-primary-600'
                                    : 'border-transparent text-gray-600 hover:text-gray-800'
                            }`}
                        >
                            <Icon size={18} />
                            {tab.label}
                        </button>
                    );
                })}
            </div>

            {/* Users Tab */}
            {activeTab === 'users' && (
                <Card>
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-lg font-semibold text-gray-800">User Management</h3>
                        <Button variant="primary">
                            <Plus size={18} className="mr-2" />
                            Add User
                        </Button>
                    </div>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Name</TableHead>
                                <TableHead>Email</TableHead>
                                <TableHead>Role</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {users.map(user => (
                                <TableRow key={user.id}>
                                    <TableCell className="font-medium">{user.name}</TableCell>
                                    <TableCell>{user.email}</TableCell>
                                    <TableCell>{user.role}</TableCell>
                                    <TableCell>
                                        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                                            user.status === 'active'
                                                ? 'bg-green-100 text-green-800'
                                                : 'bg-red-100 text-red-800'
                                        }`}>
                                            {user.status}
                                        </span>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex gap-2">
                                            <button className="text-blue-600 hover:text-blue-800">
                                                <Edit size={16} />
                                            </button>
                                            <button className="text-red-600 hover:text-red-800">
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </Card>
            )}

            {/* User Roles Tab */}
            {activeTab === 'roles' && (
                <Card>
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-lg font-semibold text-gray-800">User Roles & Permissions</h3>
                        <Button variant="primary">
                            <Plus size={18} className="mr-2" />
                            Add Role
                        </Button>
                    </div>
                    <div className="space-y-4">
                        {roles.map(role => (
                            <div key={role.id} className="border border-gray-200 rounded-lg p-4">
                                <div className="flex justify-between items-start mb-3">
                                    <div>
                                        <h4 className="font-semibold text-gray-800">{role.name}</h4>
                                        <p className="text-sm text-gray-600 mt-1">
                                            {role.permissions.length} permissions assigned
                                        </p>
                                    </div>
                                    <div className="flex gap-2">
                                        <button className="text-blue-600 hover:text-blue-800">
                                            <Edit size={16} />
                                        </button>
                                        <button className="text-red-600 hover:text-red-800">
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    {role.permissions.map((permission, idx) => (
                                        <span
                                            key={idx}
                                            className="inline-flex px-3 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full"
                                        >
                                            {permission}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </Card>
            )}

            {/* Customers Tab */}
            {activeTab === 'customers' && (
                <Card>
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-lg font-semibold text-gray-800">Customer Management</h3>
                        <Button variant="primary">
                            <Plus size={18} className="mr-2" />
                            Add Customer
                        </Button>
                    </div>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Customer ID</TableHead>
                                <TableHead>Name</TableHead>
                                <TableHead>Address</TableHead>
                                <TableHead>Contact Person</TableHead>
                                <TableHead>Email</TableHead>
                                <TableHead>Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {mockCustomers.map(customer => (
                                <TableRow key={customer.id}>
                                    <TableCell className="font-medium">{customer.id}</TableCell>
                                    <TableCell>{customer.name}</TableCell>
                                    <TableCell>{customer.address}</TableCell>
                                    <TableCell>{customer.contact}</TableCell>
                                    <TableCell>{customer.email}</TableCell>
                                    <TableCell>
                                        <div className="flex gap-2">
                                            <button className="text-blue-600 hover:text-blue-800">
                                                <Edit size={16} />
                                            </button>
                                            <button className="text-red-600 hover:text-red-800">
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </Card>
            )}

            {/* Test Parameters Tab */}
            {activeTab === 'parameters' && (
                <div className="space-y-6">
                    {/* Sample Type Configuration */}
                    <Card>
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-lg font-semibold text-gray-800">Sample Types & Parameters</h3>
                        </div>
                        <div className="space-y-6">
                            {sampleTypeConfigs.map(config => (
                                <div key={config.name} className="border border-gray-200 rounded-lg p-4">
                                    <div className="flex justify-between items-center mb-3">
                                        <h4 className="font-semibold text-gray-800">{config.name}</h4>
                                        <button className="text-blue-600 hover:text-blue-800">
                                            <Edit size={16} />
                                        </button>
                                    </div>
                                    <div className="flex flex-wrap gap-2">
                                        {config.parameters.map((param, idx) => (
                                            <span
                                                key={idx}
                                                className="inline-flex px-3 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full"
                                            >
                                                {param}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </Card>

                    {/* All Parameters */}
                    <Card>
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-lg font-semibold text-gray-800">All Test Parameters</h3>
                            <Button variant="primary">
                                <Plus size={18} className="mr-2" />
                                Add Parameter
                            </Button>
                        </div>
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Parameter Name</TableHead>
                                        <TableHead>Unit</TableHead>
                                        <TableHead>Method</TableHead>
                                        <TableHead>Price (LKR)</TableHead>
                                        <TableHead>Sample Types</TableHead>
                                        <TableHead>Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {mockParameters.map((param, idx) => (
                                        <TableRow key={idx}>
                                            <TableCell className="font-medium">{param.name}</TableCell>
                                            <TableCell>{param.unit}</TableCell>
                                            <TableCell className="text-sm text-gray-600">{param.method}</TableCell>
                                            <TableCell>{param.defaultPrice.toLocaleString()}</TableCell>
                                            <TableCell>
                                                <div className="flex flex-wrap gap-1">
                                                    {param.sampleTypes.map((type, typeIdx) => (
                                                        <span
                                                            key={typeIdx}
                                                            className="inline-flex px-2 py-0.5 text-xs bg-blue-50 text-blue-700 rounded"
                                                        >
                                                            {type}
                                                        </span>
                                                    ))}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex gap-2">
                                                    <button className="text-blue-600 hover:text-blue-800">
                                                        <Edit size={16} />
                                                    </button>
                                                    <button className="text-red-600 hover:text-red-800">
                                                        <Trash2 size={16} />
                                                    </button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    </Card>
                </div>
            )}
        </div>
    );
};
