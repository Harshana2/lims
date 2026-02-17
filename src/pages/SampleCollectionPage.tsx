import React, { useState } from 'react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { Badge } from '../components/ui/Badge';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../components/ui/Table';
import { Calendar, Plus, Edit, Trash2, CheckCircle, XCircle } from 'lucide-react';
import { mockCustomers, mockScheduledCollections, sampleTypes, type ScheduledCollection } from '../data/mockData';

export const SampleCollectionPage: React.FC = () => {
    const [collections, setCollections] = useState<ScheduledCollection[]>(mockScheduledCollections);
    const [showForm, setShowForm] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);

    const [formData, setFormData] = useState({
        customerId: '',
        customerName: '',
        sampleType: '',
        collectionDate: '',
        collectionTime: '10:00',
        address: '',
        contact: '',
        notes: '',
    });

    const handleCustomerChange = (customerId: string) => {
        const customer = mockCustomers.find(c => c.id === customerId);
        if (customer) {
            setFormData({
                ...formData,
                customerId,
                customerName: customer.name,
                address: customer.address,
                contact: customer.contact,
            });
        }
    };

    const handleSubmit = () => {
        if (!formData.customerId || !formData.sampleType || !formData.collectionDate) {
            alert('Please fill in all required fields');
            return;
        }

        const collectionDateTime = `${formData.collectionDate}T${formData.collectionTime}:00`;

        if (editingId) {
            // Update existing collection
            setCollections(collections.map(c => 
                c.id === editingId
                    ? {
                        ...c,
                        customerId: formData.customerId,
                        customerName: formData.customerName,
                        sampleType: formData.sampleType,
                        collectionDate: collectionDateTime,
                        address: formData.address,
                        contact: formData.contact,
                        notes: formData.notes,
                    }
                    : c
            ));
        } else {
            // Add new collection
            const newCollection: ScheduledCollection = {
                id: `SC-${String(collections.length + 1).padStart(3, '0')}`,
                customerId: formData.customerId,
                customerName: formData.customerName,
                sampleType: formData.sampleType,
                collectionDate: collectionDateTime,
                address: formData.address,
                contact: formData.contact,
                notes: formData.notes,
                status: 'scheduled',
            };
            setCollections([...collections, newCollection]);
        }

        // Reset form
        setFormData({
            customerId: '',
            customerName: '',
            sampleType: '',
            collectionDate: '',
            collectionTime: '10:00',
            address: '',
            contact: '',
            notes: '',
        });
        setShowForm(false);
        setEditingId(null);
        alert(editingId ? 'Collection updated successfully!' : 'Collection scheduled successfully!');
    };

    const handleEdit = (collection: ScheduledCollection) => {
        const dateTime = new Date(collection.collectionDate);
        const date = dateTime.toISOString().split('T')[0];
        const time = dateTime.toTimeString().slice(0, 5);

        setFormData({
            customerId: collection.customerId,
            customerName: collection.customerName,
            sampleType: collection.sampleType,
            collectionDate: date,
            collectionTime: time,
            address: collection.address,
            contact: collection.contact,
            notes: collection.notes,
        });
        setEditingId(collection.id);
        setShowForm(true);
    };

    const handleDelete = (id: string) => {
        if (confirm('Are you sure you want to delete this collection schedule?')) {
            setCollections(collections.filter(c => c.id !== id));
        }
    };

    const handleStatusChange = (id: string, status: 'collected' | 'cancelled') => {
        setCollections(collections.map(c => 
            c.id === id ? { ...c, status } : c
        ));
        alert(`Collection marked as ${status}`);
    };

    const getStatusBadge = (status: string) => {
        const statusMap: { [key: string]: 'pending' | 'approved' | 'created' } = {
            scheduled: 'pending',
            collected: 'approved',
            cancelled: 'created',
        };
        return statusMap[status] || 'created';
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-gray-800">Sample Collection Scheduling</h1>
                    <p className="text-sm text-gray-600 mt-1">Schedule and manage sample collections from customer locations</p>
                </div>
                <Button variant="primary" onClick={() => { setShowForm(true); setEditingId(null); }}>
                    <Plus size={18} className="mr-2" />
                    Schedule Collection
                </Button>
            </div>

            {/* Collection Form */}
            {showForm && (
                <Card className="mb-6">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4 pb-3 border-b">
                        {editingId ? 'Edit Collection Schedule' : 'Schedule New Collection'}
                    </h3>
                    <div className="grid grid-cols-2 gap-4 mb-6">
                        <Select
                            label="Customer"
                            value={formData.customerId}
                            onChange={(e) => handleCustomerChange(e.target.value)}
                            options={[
                                { value: '', label: 'Select Customer' },
                                ...mockCustomers.map(c => ({ value: c.id, label: c.name }))
                            ]}
                            required
                        />
                        <Select
                            label="Sample Type"
                            value={formData.sampleType}
                            onChange={(e) => setFormData({ ...formData, sampleType: e.target.value })}
                            options={[
                                { value: '', label: 'Select Sample Type' },
                                ...sampleTypes.map(s => ({ value: s, label: s }))
                            ]}
                            required
                        />
                        <Input
                            label="Collection Date"
                            type="date"
                            value={formData.collectionDate}
                            onChange={(e) => setFormData({ ...formData, collectionDate: e.target.value })}
                            required
                        />
                        <Input
                            label="Collection Time"
                            type="time"
                            value={formData.collectionTime}
                            onChange={(e) => setFormData({ ...formData, collectionTime: e.target.value })}
                            required
                        />
                        <Input
                            label="Address"
                            value={formData.address}
                            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                            placeholder="Collection address"
                            required
                        />
                        <Input
                            label="Contact Person"
                            value={formData.contact}
                            onChange={(e) => setFormData({ ...formData, contact: e.target.value })}
                            placeholder="Contact person at location"
                            required
                        />
                    </div>
                    <div className="mb-6">
                        <label className="block text-sm font-medium text-gray-700 mb-2">Notes</label>
                        <textarea
                            value={formData.notes}
                            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                            placeholder="Additional instructions or notes..."
                            rows={3}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                        />
                    </div>
                    <div className="flex justify-end gap-3">
                        <Button
                            variant="secondary"
                            onClick={() => {
                                setShowForm(false);
                                setEditingId(null);
                                setFormData({
                                    customerId: '',
                                    customerName: '',
                                    sampleType: '',
                                    collectionDate: '',
                                    collectionTime: '10:00',
                                    address: '',
                                    contact: '',
                                    notes: '',
                                });
                            }}
                        >
                            Cancel
                        </Button>
                        <Button variant="primary" onClick={handleSubmit}>
                            {editingId ? 'Update' : 'Schedule'} Collection
                        </Button>
                    </div>
                </Card>
            )}

            {/* Scheduled Collections Table */}
            <Card>
                <h3 className="text-lg font-semibold text-gray-800 mb-4 pb-3 border-b">
                    <Calendar size={20} className="inline mr-2" />
                    Scheduled Collections
                </h3>
                <div className="overflow-x-auto">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Collection ID</TableHead>
                                <TableHead>Customer</TableHead>
                                <TableHead>Sample Type</TableHead>
                                <TableHead>Collection Date & Time</TableHead>
                                <TableHead>Contact</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {collections
                                .sort((a, b) => new Date(a.collectionDate).getTime() - new Date(b.collectionDate).getTime())
                                .map(collection => (
                                    <TableRow key={collection.id}>
                                        <TableCell className="font-medium">{collection.id}</TableCell>
                                        <TableCell>
                                            <div>
                                                <p className="font-medium">{collection.customerName}</p>
                                                <p className="text-xs text-gray-500">{collection.address}</p>
                                            </div>
                                        </TableCell>
                                        <TableCell>{collection.sampleType}</TableCell>
                                        <TableCell>
                                            <div>
                                                <p className="font-medium">
                                                    {new Date(collection.collectionDate).toLocaleDateString('en-GB')}
                                                </p>
                                                <p className="text-xs text-gray-500">
                                                    {new Date(collection.collectionDate).toLocaleTimeString('en-GB', { 
                                                        hour: '2-digit', 
                                                        minute: '2-digit' 
                                                    })}
                                                </p>
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-sm">{collection.contact}</TableCell>
                                        <TableCell>
                                            <Badge status={getStatusBadge(collection.status)}>
                                                {collection.status}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex gap-2">
                                                {collection.status === 'scheduled' && (
                                                    <>
                                                        <button
                                                            onClick={() => handleEdit(collection)}
                                                            className="text-blue-600 hover:text-blue-800"
                                                            title="Edit"
                                                        >
                                                            <Edit size={16} />
                                                        </button>
                                                        <button
                                                            onClick={() => handleStatusChange(collection.id, 'collected')}
                                                            className="text-green-600 hover:text-green-800"
                                                            title="Mark as Collected"
                                                        >
                                                            <CheckCircle size={16} />
                                                        </button>
                                                        <button
                                                            onClick={() => handleStatusChange(collection.id, 'cancelled')}
                                                            className="text-red-600 hover:text-red-800"
                                                            title="Cancel"
                                                        >
                                                            <XCircle size={16} />
                                                        </button>
                                                    </>
                                                )}
                                                <button
                                                    onClick={() => handleDelete(collection.id)}
                                                    className="text-red-600 hover:text-red-800"
                                                    title="Delete"
                                                >
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

            {/* Summary Stats */}
            <div className="grid grid-cols-3 gap-6 mt-6">
                <Card>
                    <div className="text-center">
                        <p className="text-3xl font-bold text-yellow-600">
                            {collections.filter(c => c.status === 'scheduled').length}
                        </p>
                        <p className="text-sm text-gray-600 mt-1">Scheduled</p>
                    </div>
                </Card>
                <Card>
                    <div className="text-center">
                        <p className="text-3xl font-bold text-green-600">
                            {collections.filter(c => c.status === 'collected').length}
                        </p>
                        <p className="text-sm text-gray-600 mt-1">Collected</p>
                    </div>
                </Card>
                <Card>
                    <div className="text-center">
                        <p className="text-3xl font-bold text-red-600">
                            {collections.filter(c => c.status === 'cancelled').length}
                        </p>
                        <p className="text-sm text-gray-600 mt-1">Cancelled</p>
                    </div>
                </Card>
            </div>
        </div>
    );
};
