import React, { useState } from 'react';
import { Card } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../components/ui/Table';
import { useWorkflow } from '../context/WorkflowContext';
import { mockCustomers, sampleTypes, priorities, samplingTypes, mockParameters } from '../data/mockData';
import { Edit } from 'lucide-react';

export const RequestPage: React.FC = () => {
    const { requests, addRequest, updateRequestStatus } = useWorkflow();

    const [formData, setFormData] = useState({
        customer: '',
        address: '',
        contact: '',
        email: '',
        sampleType: '',
        testParameters: [] as string[],
        numberOfSamples: 1,
        samplingType: 'Customer Submission',
        date: new Date().toISOString().split('T')[0],
        priority: 'Normal',
    });

    const handleCustomerChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const customerId = e.target.value;
        const customer = mockCustomers.find(c => c.id === customerId);
        if (customer) {
            setFormData({
                ...formData,
                customer: customer.name,
                address: customer.address,
                contact: customer.contact,
                email: customer.email,
            });
        }
    };

    const handleParameterToggle = (paramName: string) => {
        setFormData(prev => ({
            ...prev,
            testParameters: prev.testParameters.includes(paramName)
                ? prev.testParameters.filter(p => p !== paramName)
                : [...prev.testParameters, paramName]
        }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        addRequest(formData);
        // Reset form
        setFormData({
            customer: '',
            address: '',
            contact: '',
            email: '',
            sampleType: '',
            testParameters: [],
            numberOfSamples: 1,
            samplingType: 'Customer Submission',
            date: new Date().toISOString().split('T')[0],
            priority: 'Normal',
        });
    };

    const handleStatusChange = (requestId: string, newStatus: 'pending' | 'confirmed') => {
        updateRequestStatus(requestId, newStatus);
    };

    return (
        <div>
            <h1 className="text-3xl font-bold text-gray-800 mb-8">Customer Sample Requests</h1>

            {/* Request Form */}
            <Card className="mb-8">
                <h2 className="text-xl font-semibold text-gray-800 mb-6">Create New Request</h2>
                <form onSubmit={handleSubmit}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Select
                            label="Customer"
                            value={formData.customer ? mockCustomers.find(c => c.name === formData.customer)?.id || '' : ''}
                            onChange={handleCustomerChange}
                            options={mockCustomers.map(c => ({ value: c.id, label: c.name }))}
                            required
                        />

                        <Input
                            label="Address"
                            value={formData.address}
                            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                            required
                        />

                        <Input
                            label="Contact Person"
                            value={formData.contact}
                            onChange={(e) => setFormData({ ...formData, contact: e.target.value })}
                            required
                        />

                        <Input
                            label="Email"
                            type="email"
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            required
                        />

                        <Select
                            label="Sample Type"
                            value={formData.sampleType}
                            onChange={(e) => setFormData({ ...formData, sampleType: e.target.value })}
                            options={sampleTypes.map(t => ({ value: t, label: t }))}
                            required
                        />

                        <Input
                            label="Number of Samples"
                            type="number"
                            value={formData.numberOfSamples.toString()}
                            onChange={(e) => setFormData({ ...formData, numberOfSamples: parseInt(e.target.value) || 1 })}
                            required
                        />

                        <div className="mb-4 md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Test Parameters <span className="text-red-500 ml-1">*</span>
                            </label>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                {mockParameters.map(param => (
                                    <label key={param.name} className="flex items-center gap-2 p-2 border border-gray-200 rounded hover:bg-gray-50 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={formData.testParameters.includes(param.name)}
                                            onChange={() => handleParameterToggle(param.name)}
                                            className="w-4 h-4 text-primary-600"
                                        />
                                        <span className="text-sm text-gray-700">{param.name}</span>
                                    </label>
                                ))}
                            </div>
                        </div>

                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Sampling Type <span className="text-red-500 ml-1">*</span>
                            </label>
                            <div className="flex gap-4">
                                {samplingTypes.map(type => (
                                    <label key={type} className="flex items-center gap-2">
                                        <input
                                            type="radio"
                                            name="samplingType"
                                            value={type}
                                            checked={formData.samplingType === type}
                                            onChange={(e) => setFormData({ ...formData, samplingType: e.target.value })}
                                            className="w-4 h-4 text-primary-600"
                                        />
                                        <span className="text-sm text-gray-700">{type}</span>
                                    </label>
                                ))}
                            </div>
                        </div>

                        <Input
                            label="Date"
                            type="date"
                            value={formData.date}
                            onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                            required
                        />

                        <Select
                            label="Priority"
                            value={formData.priority}
                            onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                            options={priorities.map(p => ({ value: p, label: p }))}
                            required
                        />
                    </div>

                    <div className="mt-6 flex justify-end">
                        <Button type="submit" disabled={formData.testParameters.length === 0}>
                            Add Request
                        </Button>
                    </div>
                </form>
            </Card>

            {/* Requests Table */}
            <Card>
                <h2 className="text-xl font-semibold text-gray-800 mb-6">All Requests</h2>
                {requests.length === 0 ? (
                    <p className="text-gray-500 text-center py-8">No requests yet. Create your first request above.</p>
                ) : (
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Request ID</TableHead>
                                    <TableHead>Customer</TableHead>
                                    <TableHead>Sample Type</TableHead>
                                    <TableHead>Parameters</TableHead>
                                    <TableHead>Samples</TableHead>
                                    <TableHead>Date</TableHead>
                                    <TableHead>Priority</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {requests.map((request) => (
                                    <TableRow key={request.id}>
                                        <TableCell className="font-medium">{request.id}</TableCell>
                                        <TableCell>{request.customer}</TableCell>
                                        <TableCell>{request.sampleType}</TableCell>
                                        <TableCell>
                                            <div className="flex flex-wrap gap-1">
                                                {request.testParameters.map(param => (
                                                    <span key={param} className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
                                                        {param}
                                                    </span>
                                                ))}
                                            </div>
                                        </TableCell>
                                        <TableCell>{request.numberOfSamples}</TableCell>
                                        <TableCell>{request.date}</TableCell>
                                        <TableCell>
                                            <Badge status={request.priority === 'Urgent' ? 'pending' : 'approved'}>
                                                {request.priority}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            <select
                                                value={request.status}
                                                onChange={(e) => handleStatusChange(request.id, e.target.value as 'pending' | 'confirmed')}
                                                className={`px-3 py-1 rounded text-sm font-medium ${
                                                    request.status === 'confirmed' 
                                                        ? 'bg-green-100 text-green-700 border-green-300' 
                                                        : 'bg-yellow-100 text-yellow-700 border-yellow-300'
                                                } border focus:outline-none focus:ring-2 focus:ring-primary-500`}
                                            >
                                                <option value="pending">Pending</option>
                                                <option value="confirmed">Confirmed</option>
                                            </select>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex gap-2">
                                                <button className="text-blue-600 hover:text-blue-800">
                                                    <Edit size={16} />
                                                </button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                )}
            </Card>
        </div>
    );
};
