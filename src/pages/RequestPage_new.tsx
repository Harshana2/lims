import React, { useState, useEffect } from 'react';
import { Card } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../components/ui/Table';
import { requestService, type Request } from '../services';
import { mockCustomers, sampleTypeConfigs, priorities } from '../data/mockData';
import { Plus, X } from 'lucide-react';

export const RequestPage: React.FC = () => {
    const [requests, setRequests] = useState<Request[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [availableParameters, setAvailableParameters] = useState<string[]>([]);

    // Load requests from backend
    useEffect(() => {
        loadRequests();
    }, []);

    const loadRequests = async () => {
        try {
            setLoading(true);
            const data = await requestService.getAll();
            setRequests(data);
            setError('');
        } catch (err) {
            console.error('Failed to load requests:', err);
            setError('Failed to load requests. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const [formData, setFormData] = useState({
        customer: '',
        address: '',
        contact: '',
        email: '',
        sampleType: '',
        testParameters: [] as string[],
        numberOfSamples: 1,
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

    const handleSampleTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const sampleType = e.target.value;
        const config = sampleTypeConfigs.find(c => c.name === sampleType);
        const params = config ? config.parameters : [];
        
        setFormData({
            ...formData,
            sampleType,
            testParameters: [] 
        });
        setAvailableParameters(params);
    };

    const handleParameterToggle = (paramName: string) => {
        setFormData(prev => ({
            ...prev,
            testParameters: prev.testParameters.includes(paramName)
                ? prev.testParameters.filter(p => p !== paramName)
                : [...prev.testParameters, paramName]
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (formData.testParameters.length === 0) {
            alert('Please select at least one test parameter');
            return;
        }
        
        try {
            await requestService.create({
                customer: formData.customer,
                contact: formData.contact,
                email: formData.email,
                sampleType: formData.sampleType,
                parameters: formData.testParameters,
                numberOfSamples: formData.numberOfSamples,
                priority: formData.priority,
                status: 'pending',
                notes: ''
            });
            
            alert('Request submitted successfully!');
            
            setFormData({
                customer: '',
                address: '',
                contact: '',
                email: '',
                sampleType: '',
                testParameters: [],
                numberOfSamples: 1,
                priority: 'Normal',
            });
            setAvailableParameters([]);
            setShowModal(false);
            await loadRequests();
        } catch (err) {
            console.error('Failed to submit request:', err);
            alert('Failed to submit request. Please try again.');
        }
    };

    const handleStatusChange = async (requestId: number | undefined, newStatus: 'pending' | 'confirmed') => {
        if (!requestId) return;
        
        try {
            await requestService.updateStatus(requestId, newStatus);
            await loadRequests();
        } catch (err) {
            console.error('Failed to update status:', err);
            alert('Failed to update status.');
        }
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold text-gray-800">Customer Sample Requests</h1>
                <Button 
                    onClick={() => setShowModal(true)}
                    className="flex items-center gap-2"
                >
                    <Plus className="w-5 h-5" />
                    New Request
                </Button>
            </div>

            <Card>
                <h2 className="text-xl font-semibold text-gray-800 mb-6">All Requests</h2>
                {loading ? (
                    <p className="text-gray-500 text-center py-8">Loading requests...</p>
                ) : error ? (
                    <p className="text-red-500 text-center py-8">{error}</p>
                ) : requests.length === 0 ? (
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
                                    <TableHead>Created</TableHead>
                                    <TableHead>Priority</TableHead>
                                    <TableHead>Status</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {requests.map((request) => (
                                    <TableRow key={request.id}>
                                        <TableCell className="font-medium">{request.requestId || request.id}</TableCell>
                                        <TableCell>{request.customer}</TableCell>
                                        <TableCell>{request.sampleType}</TableCell>
                                        <TableCell>
                                            <div className="flex flex-wrap gap-1">
                                                {request.parameters.slice(0, 3).map(param => (
                                                    <span key={param} className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
                                                        {param}
                                                    </span>
                                                ))}
                                                {request.parameters.length > 3 && (
                                                    <span className="text-xs text-gray-500">+{request.parameters.length - 3} more</span>
                                                )}
                                            </div>
                                        </TableCell>
                                        <TableCell>{request.numberOfSamples}</TableCell>
                                        <TableCell>{request.createdAt ? new Date(request.createdAt).toLocaleDateString() : 'N/A'}</TableCell>
                                        <TableCell>
                                            <Badge status={request.priority === 'Urgent' ? 'pending' : 'approved'}>
                                                {request.priority}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            <select
                                                value={request.status}
                                                onChange={(e) => handleStatusChange(request.id, e.target.value as 'pending' | 'confirmed')}
                                                className="px-3 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-primary-500"
                                            >
                                                <option value="pending">Pending</option>
                                                <option value="confirmed">Confirmed</option>
                                            </select>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                )}
            </Card>

            {showModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center">
                            <h2 className="text-2xl font-semibold text-gray-800">Create New Request</h2>
                            <button
                                onClick={() => setShowModal(false)}
                                className="text-gray-400 hover:text-gray-600 transition-colors"
                            >
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <Select
                                    label="Customer"
                                    value={formData.customer ? mockCustomers.find(c => c.name === formData.customer)?.id || '' : ''}
                                    onChange={handleCustomerChange}
                                    options={[
                                        { value: '', label: 'Select Customer' },
                                        ...mockCustomers.map(c => ({ value: c.id, label: c.name }))
                                    ]}
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

                                <Input
                                    label="Address"
                                    value={formData.address}
                                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                    required
                                />

                                <Select
                                    label="Sample Type"
                                    value={formData.sampleType}
                                    onChange={handleSampleTypeChange}
                                    options={[
                                        { value: '', label: 'Select Sample Type' },
                                        ...sampleTypeConfigs.map(t => ({ value: t.name, label: t.name }))
                                    ]}
                                    required
                                />

                                <Input
                                    label="Number of Samples"
                                    type="number"
                                    min="1"
                                    value={formData.numberOfSamples.toString()}
                                    onChange={(e) => setFormData({ ...formData, numberOfSamples: parseInt(e.target.value) || 1 })}
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

                            {formData.sampleType && availableParameters.length > 0 && (
                                <div className="mt-6">
                                    <label className="block text-sm font-medium text-gray-700 mb-3">
                                        Test Parameters <span className="text-red-500 ml-1">*</span>
                                    </label>
                                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3 p-4 bg-gray-50 rounded-lg">
                                        {availableParameters.map(param => (
                                            <label 
                                                key={param} 
                                                className="flex items-center gap-2 p-3 bg-white border border-gray-200 rounded hover:bg-primary-50 hover:border-primary-300 cursor-pointer transition-colors"
                                            >
                                                <input
                                                    type="checkbox"
                                                    checked={formData.testParameters.includes(param)}
                                                    onChange={() => handleParameterToggle(param)}
                                                    className="w-4 h-4 text-primary-600 rounded focus:ring-2 focus:ring-primary-500"
                                                />
                                                <span className="text-sm text-gray-700">{param}</span>
                                            </label>
                                        ))}
                                    </div>
                                    {formData.testParameters.length > 0 && (
                                        <p className="text-sm text-gray-600 mt-2">
                                            {formData.testParameters.length} parameter(s) selected
                                        </p>
                                    )}
                                </div>
                            )}

                            {formData.sampleType && availableParameters.length === 0 && (
                                <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded">
                                    <p className="text-sm text-yellow-800">
                                        No parameters configured for this sample type. Please contact administrator.
                                    </p>
                                </div>
                            )}

                            <div className="mt-8 flex justify-end gap-3">
                                <Button
                                    type="button"
                                    onClick={() => setShowModal(false)}
                                    className="bg-gray-200 text-gray-700 hover:bg-gray-300"
                                >
                                    Cancel
                                </Button>
                                <Button 
                                    type="submit" 
                                    disabled={formData.testParameters.length === 0}
                                    className="disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Submit Request
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};
