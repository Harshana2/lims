import React, { useState, useEffect } from 'react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../components/ui/Table';
import { Select } from '../components/ui/Select';
import { Input } from '../components/ui/Input';
import { useWorkflow } from '../context/WorkflowContext';
import { mockSamples, mockChemists, mockParameters } from '../data/mockData';

export const ParameterAssignmentPage: React.FC = () => {
    const { assignments, assignmentsLocked, setAssignments, lockAssignments, crfStatus } = useWorkflow();

    const [localAssignments, setLocalAssignments] = useState(
        assignments.length > 0
            ? assignments
            : mockSamples.map((sample) => ({
                sampleRef: sample.ref,
                parameter: mockParameters[0].name,
                unit: mockParameters[0].unit,
                method: mockParameters[0].method,
                chemist: '',
                dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            }))
    );

    useEffect(() => {
        if (assignments.length > 0) {
            setLocalAssignments(assignments);
        }
    }, [assignments]);

    const handleChemistChange = (index: number, chemistId: string) => {
        const chemist = mockChemists.find((c) => c.id === chemistId);
        const updated = [...localAssignments];
        updated[index].chemist = chemist?.name || '';
        setLocalAssignments(updated);
    };

    const handleDueDateChange = (index: number, date: string) => {
        const updated = [...localAssignments];
        updated[index].dueDate = date;
        setLocalAssignments(updated);
    };

    const handleSave = () => {
        setAssignments(localAssignments);
    };

    const handleLock = () => {
        setAssignments(localAssignments);
        lockAssignments();
    };

    if (crfStatus !== 'CRF Approved') {
        return (
            <div>
                <h1 className="text-3xl font-bold text-gray-800 mb-8">Parameter Assignment</h1>
                <Card>
                    <p className="text-gray-500">Please complete the CRF first before assigning parameters.</p>
                </Card>
            </div>
        );
    }

    return (
        <div>
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold text-gray-800">Parameter Assignment</h1>
                <Badge status={assignmentsLocked ? 'locked' : 'pending'}>
                    {assignmentsLocked ? 'Parameters Locked' : 'Pending Assignment'}
                </Badge>
            </div>

            <Card>
                <div className="overflow-x-auto">
                    <table className="min-w-full">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Sample</th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Parameter</th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Unit</th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Method</th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Assigned Chemist</th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Due Date</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {localAssignments.map((assignment, index) => (
                                <tr key={assignment.sampleRef}>
                                    <td className="px-4 py-3 text-sm font-medium">{assignment.sampleRef}</td>
                                    <td className="px-4 py-3 text-sm">{assignment.parameter}</td>
                                    <td className="px-4 py-3 text-sm">{assignment.unit}</td>
                                    <td className="px-4 py-3 text-sm">{assignment.method}</td>
                                    <td className="px-4 py-3">
                                        <select
                                            value={mockChemists.find((c) => c.name === assignment.chemist)?.id || ''}
                                            onChange={(e) => handleChemistChange(index, e.target.value)}
                                            disabled={assignmentsLocked}
                                            className="w-full px-3 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:bg-gray-100"
                                        >
                                            <option value="">Select Chemist</option>
                                            {mockChemists.map((chemist) => (
                                                <option key={chemist.id} value={chemist.id}>
                                                    {chemist.name}
                                                </option>
                                            ))}
                                        </select>
                                    </td>
                                    <td className="px-4 py-3">
                                        <input
                                            type="date"
                                            value={assignment.dueDate}
                                            onChange={(e) => handleDueDateChange(index, e.target.value)}
                                            disabled={assignmentsLocked}
                                            className="w-full px-3 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:bg-gray-100"
                                        />
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                <div className="mt-6 flex justify-end gap-3">
                    {!assignmentsLocked && (
                        <>
                            <Button variant="secondary" onClick={handleSave}>
                                Save Assignments
                            </Button>
                            <Button
                                variant="primary"
                                onClick={handleLock}
                                disabled={localAssignments.some((a) => !a.chemist)}
                            >
                                Lock Parameters
                            </Button>
                        </>
                    )}
                    {assignmentsLocked && (
                        <Badge status="locked">Parameters Locked - Cannot Edit</Badge>
                    )}
                </div>
            </Card>
        </div>
    );
};
