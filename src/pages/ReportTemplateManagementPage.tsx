import React, { useState, useEffect } from 'react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../components/ui/Table';
import reportTemplateService from '../services/reportTemplateService';
import type { ReportTemplate } from '../services/reportTemplateService';
import { Plus, Edit2, Trash2, Star, Copy } from 'lucide-react';

export const ReportTemplateManagementPage: React.FC = () => {
    const [templates, setTemplates] = useState<ReportTemplate[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadTemplates();
    }, []);

    const loadTemplates = async () => {
        try {
            setLoading(true);
            const data = await reportTemplateService.getAll();
            setTemplates(data);
        } catch (error) {
            console.error('Error loading templates:', error);
            alert('Failed to load templates');
        } finally {
            setLoading(false);
        }
    };

    const handleSetDefault = async (id: number) => {
        try {
            await reportTemplateService.setAsDefault(id);
            alert('Template set as default!');
            loadTemplates();
        } catch (error) {
            console.error('Error setting default template:', error);
            alert('Failed to set default template');
        }
    };

    const handleToggleActive = async (id: number) => {
        try {
            await reportTemplateService.toggleActive(id);
            loadTemplates();
        } catch (error) {
            console.error('Error toggling template status:', error);
            alert('Failed to toggle template status');
        }
    };

    const handleDelete = async (id: number) => {
        if (!window.confirm('Are you sure you want to delete this template?')) return;
        
        try {
            await reportTemplateService.delete(id);
            alert('Template deleted successfully!');
            loadTemplates();
        } catch (error: any) {
            console.error('Error deleting template:', error);
            alert(error.response?.data?.message || 'Failed to delete template');
        }
    };

    if (loading) {
        return <div className="text-center py-8">Loading templates...</div>;
    }

    return (
        <div>
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-gray-800">Report Templates</h1>
                    <p className="text-sm text-gray-600 mt-1">Manage report templates for generating test reports</p>
                </div>
                <Button className="flex items-center gap-2">
                    <Plus className="w-4 h-4" />
                    New Template
                </Button>
            </div>

            {/* Templates Table */}
            <Card>
                <div className="overflow-x-auto">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Name</TableHead>
                                <TableHead>Type</TableHead>
                                <TableHead>Description</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Default</TableHead>
                                <TableHead>Created</TableHead>
                                <TableHead>Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {templates.length === 0 ? (
                                <TableRow>
                                    <TableCell className="text-center text-gray-500">No templates found</TableCell>
                                    <TableCell>-</TableCell>
                                    <TableCell>-</TableCell>
                                    <TableCell>-</TableCell>
                                    <TableCell>-</TableCell>
                                    <TableCell>-</TableCell>
                                    <TableCell>-</TableCell>
                                </TableRow>
                            ) : (
                                templates.map((template) => (
                                    <TableRow key={template.id}>
                                        <TableCell className="font-medium">{template.name}</TableCell>
                                        <TableCell>
                                            <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800">
                                                {template.templateType}
                                            </span>
                                        </TableCell>
                                        <TableCell className="max-w-xs truncate">
                                            {template.description || '-'}
                                        </TableCell>
                                        <TableCell>
                                            <button
                                                onClick={() => template.id && handleToggleActive(template.id)}
                                                className={`px-2 py-1 text-xs rounded-full ${
                                                    template.isActive
                                                        ? 'bg-green-100 text-green-800'
                                                        : 'bg-gray-100 text-gray-800'
                                                }`}
                                            >
                                                {template.isActive ? 'Active' : 'Inactive'}
                                            </button>
                                        </TableCell>
                                        <TableCell>
                                            {template.isDefault ? (
                                                <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                                            ) : (
                                                <button
                                                    onClick={() => template.id && handleSetDefault(template.id)}
                                                    className="text-gray-400 hover:text-yellow-500"
                                                    title="Set as default"
                                                >
                                                    <Star className="w-4 h-4" />
                                                </button>
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            {template.createdAt
                                                ? new Date(template.createdAt).toLocaleDateString()
                                                : '-'}
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex gap-2">
                                                <button
                                                    className="text-blue-600 hover:text-blue-800"
                                                    title="Edit"
                                                >
                                                    <Edit2 className="w-4 h-4" />
                                                </button>
                                                <button
                                                    className="text-green-600 hover:text-green-800"
                                                    title="Duplicate"
                                                >
                                                    <Copy className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => template.id && handleDelete(template.id)}
                                                    className="text-red-600 hover:text-red-800 disabled:opacity-50"
                                                    title="Delete"
                                                    disabled={template.isDefault}
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </div>
            </Card>
        </div>
    );
};
