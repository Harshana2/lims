import React, { useState } from 'react';
import { Card } from '../components/ui/Card';
import { Select } from '../components/ui/Select';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../components/ui/Table';
import { Search, Download } from 'lucide-react';
import { Button } from '../components/ui/Button';

interface AuditLog {
    id: string;
    timestamp: string;
    user: string;
    action: string;
    module: string;
    details: string;
    ipAddress: string;
    status: 'Success' | 'Failed' | 'Warning';
}

const mockAuditLogs: AuditLog[] = [
    {
        id: 'LOG-001',
        timestamp: '2026-02-18 10:32:15',
        user: 'D.H.S. Costa',
        action: 'Data Entry Completed',
        module: 'Data Entry',
        details: 'Completed test data entry for CRF-001 (5 parameters)',
        ipAddress: '192.168.1.105',
        status: 'Success'
    },
    {
        id: 'LOG-002',
        timestamp: '2026-02-18 10:15:42',
        user: 'S.A.A.G. Senarathna',
        action: 'CRF Created',
        module: 'CRF',
        details: 'Created new CRF CRF-005 for customer Edinburgh Products',
        ipAddress: '192.168.1.102',
        status: 'Success'
    },
    {
        id: 'LOG-003',
        timestamp: '2026-02-18 09:58:23',
        user: 'K.M. Perera',
        action: 'Report Generated',
        module: 'Report Generation',
        details: 'Generated final report for CRF-003',
        ipAddress: '192.168.1.108',
        status: 'Success'
    },
    {
        id: 'LOG-004',
        timestamp: '2026-02-18 09:45:10',
        user: 'Admin',
        action: 'User Login',
        module: 'Authentication',
        details: 'Successful login',
        ipAddress: '192.168.1.100',
        status: 'Success'
    },
    {
        id: 'LOG-005',
        timestamp: '2026-02-18 09:30:55',
        user: 'A.B. Jayawardena',
        action: 'CRF Status Changed',
        module: 'CRF',
        details: 'Changed CRF-002 status from Draft to Submitted',
        ipAddress: '192.168.1.103',
        status: 'Success'
    },
    {
        id: 'LOG-006',
        timestamp: '2026-02-18 09:18:37',
        user: 'Unknown',
        action: 'Failed Login Attempt',
        module: 'Authentication',
        details: 'Failed login attempt with username: testuser',
        ipAddress: '192.168.1.200',
        status: 'Failed'
    },
    {
        id: 'LOG-007',
        timestamp: '2026-02-18 09:05:12',
        user: 'R.P. Silva',
        action: 'Parameter Assigned',
        module: 'Parameter Assignment',
        details: 'Assigned parameters to CRF-004 samples',
        ipAddress: '192.168.1.106',
        status: 'Success'
    },
    {
        id: 'LOG-008',
        timestamp: '2026-02-18 08:52:48',
        user: 'N.T. Fernando',
        action: 'Review Completed',
        module: 'Review & Sign',
        details: 'Reviewed and approved CRF-001',
        ipAddress: '192.168.1.107',
        status: 'Success'
    },
    {
        id: 'LOG-009',
        timestamp: '2026-02-18 08:40:20',
        user: 'D.H.S. Costa',
        action: 'Data Modification',
        module: 'Data Entry',
        details: 'Modified test results for Sample CS/25/887',
        ipAddress: '192.168.1.105',
        status: 'Warning'
    },
    {
        id: 'LOG-010',
        timestamp: '2026-02-18 08:25:33',
        user: 'S.A.A.G. Senarathna',
        action: 'Quotation Created',
        module: 'Quotation',
        details: 'Created quotation QT-2026-015 for Green Valley Industries',
        ipAddress: '192.168.1.102',
        status: 'Success'
    },
];

export const AuditLogPage: React.FC = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [filterModule, setFilterModule] = useState('All');
    const [filterStatus, setFilterStatus] = useState('All');

    const modules = ['All', 'Authentication', 'CRF', 'Data Entry', 'Parameter Assignment', 'Review & Sign', 'Report Generation', 'Quotation'];
    const statuses = ['All', 'Success', 'Failed', 'Warning'];

    const filteredLogs = mockAuditLogs.filter(log => {
        const matchesSearch = log.user.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            log.details.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesModule = filterModule === 'All' || log.module === filterModule;
        const matchesStatus = filterStatus === 'All' || log.status === filterStatus;
        
        return matchesSearch && matchesModule && matchesStatus;
    });

    const getStatusBadge = (status: string) => {
        const colors = {
            Success: 'bg-green-100 text-green-700',
            Failed: 'bg-red-100 text-red-700',
            Warning: 'bg-yellow-100 text-yellow-700',
        };
        return <span className={`px-2 py-1 rounded text-xs font-medium ${colors[status as keyof typeof colors]}`}>{status}</span>;
    };

    const handleExport = () => {
        alert('Exporting audit logs to CSV...');
        // Implement export functionality
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-gray-800">Audit Log</h1>
                    <p className="text-sm text-gray-600 mt-1">Track all system activities and user actions</p>
                </div>
                <Button onClick={handleExport} variant="secondary">
                    <Download size={18} className="mr-2" />
                    Export Logs
                </Button>
            </div>

            {/* Filters */}
            <Card className="mb-6">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="md:col-span-2">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                            <input
                                type="text"
                                placeholder="Search by user, action, or details..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                            />
                        </div>
                    </div>
                    <Select
                        label=""
                        value={filterModule}
                        onChange={(e) => setFilterModule(e.target.value)}
                        options={modules.map(m => ({ value: m, label: `Module: ${m}` }))}
                    />
                    <Select
                        label=""
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value)}
                        options={statuses.map(s => ({ value: s, label: `Status: ${s}` }))}
                    />
                </div>
            </Card>

            {/* Summary Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
                <Card>
                    <p className="text-sm text-gray-600 mb-1">Total Activities</p>
                    <p className="text-2xl font-bold text-gray-800">{mockAuditLogs.length}</p>
                </Card>
                <Card>
                    <p className="text-sm text-gray-600 mb-1">Successful</p>
                    <p className="text-2xl font-bold text-green-600">{mockAuditLogs.filter(l => l.status === 'Success').length}</p>
                </Card>
                <Card>
                    <p className="text-sm text-gray-600 mb-1">Failed</p>
                    <p className="text-2xl font-bold text-red-600">{mockAuditLogs.filter(l => l.status === 'Failed').length}</p>
                </Card>
                <Card>
                    <p className="text-sm text-gray-600 mb-1">Warnings</p>
                    <p className="text-2xl font-bold text-yellow-600">{mockAuditLogs.filter(l => l.status === 'Warning').length}</p>
                </Card>
            </div>

            {/* Audit Log Table */}
            <Card>
                <div className="overflow-x-auto">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Timestamp</TableHead>
                                <TableHead>User</TableHead>
                                <TableHead>Action</TableHead>
                                <TableHead>Module</TableHead>
                                <TableHead>Details</TableHead>
                                <TableHead>IP Address</TableHead>
                                <TableHead>Status</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredLogs.length > 0 ? (
                                filteredLogs.map(log => (
                                    <TableRow key={log.id}>
                                        <TableCell className="text-sm font-mono">{log.timestamp}</TableCell>
                                        <TableCell className="font-medium">{log.user}</TableCell>
                                        <TableCell>{log.action}</TableCell>
                                        <TableCell>
                                            <span className="px-2 py-1 bg-blue-50 text-blue-700 rounded text-xs font-medium">
                                                {log.module}
                                            </span>
                                        </TableCell>
                                        <TableCell className="text-sm text-gray-600 max-w-xs truncate">
                                            <span title={log.details}>{log.details}</span>
                                        </TableCell>
                                        <TableCell className="text-sm font-mono text-gray-500">{log.ipAddress}</TableCell>
                                        <TableCell>{getStatusBadge(log.status)}</TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell className="text-center text-gray-500 py-8">
                                        <div className="col-span-7">No audit logs found matching your filters</div>
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>
            </Card>
        </div>
    );
};
