import React, { useState } from 'react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../components/ui/Table';
import { Select } from '../components/ui/Select';
import { Input } from '../components/ui/Input';
import { useWorkflow } from '../context/WorkflowContext';
import { mockChemists, mockParameters } from '../data/mockData';

export const ParameterAssignmentPage: React.FC = () => {
    const { crfs, getCRFsByStatus, updateCRFStatus } = useWorkflow();
    const [selectedCRFId, setSelectedCRFId] = useState<string>('');
    const [assignments, setAssignments] = useState<any[]>([]);
    const [isLocked, setIsLocked] = useState(false);

    // Get CRFs with status='submitted' (ready for parameter assignment)
    const submittedCRFs = getCRFsByStatus('submitted');
    const selectedCRF = crfs.find(c => c.id === selectedCRFId);

    const handleCRFChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const crfId = e.target.value;
        setSelectedCRFId(crfId);
        setIsLocked(false);

        if (crfId) {
            const crf = crfs.find(c => c.id === crfId);
            if (crf) {
                // Initialize assignments for each sample and parameter
                const newAssignments = crf.samples.flatMap(sample =>
                    crf.testParameters.map(paramName => {
                        const param = mockParameters.find(p => p.name === paramName);
                        return {
                            sampleId: sample.id,
                            sampleDescription: sample.description,
                            parameter: paramName,
                            unit: param?.unit || '',
                            method: param?.method || '',
                            chemist: '',
                            dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                        };
                    })
                );
                setAssignments(newAssignments);
            }
        } else {
            setAssignments([]);
        }
    };

    const handleChemistChange = (index: number, chemistId: string) => {
        const chemist = mockChemists.find((c) => c.id === chemistId);
        const updated = [...assignments];
        updated[index].chemist = chemist?.name || '';
        setAssignments(updated);
    };

    const handleDueDateChange = (index: number, date: string) => {
        const updated = [...assignments];
        updated[index].dueDate = date;
        setAssignments(updated);
    };

    const handleLock = () => {
        if (!selectedCRFId) return;
        
        // Update CRF status to 'assigned'
        updateCRFStatus(selectedCRFId, 'assigned');
        setIsLocked(true);
        alert('Parameters locked! CRF status updated to "Assigned". Chemists can now start testing.');
    };

    if (submittedCRFs.length === 0) {
        return (
            <div>
                <h1 className="text-3xl font-bold text-gray-800 mb-8">Parameter Assignment</h1>
                <Card>
                    <p className="text-gray-500">No CRFs available for parameter assignment. CRFs must be in "Submitted" status.</p>
                </Card>
            </div>
        );
    }

    return (
        <div>
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold text-gray-800">Parameter Assignment</h1>
                {isLocked && <Badge status="approved">Parameters Locked</Badge>}
            </div>

            <Card className="mb-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Select CRF</h3>
                <Select
                    label="CRF ID"
                    value={selectedCRFId}
                    onChange={handleCRFChange}
                    options={[
                        { value: '', label: 'Select a CRF' },
                        ...submittedCRFs.map(crf => ({
                            value: crf.id,
                            label: `${crf.id} - ${crf.customer} (${crf.numberOfSamples} samples)`
                        }))
                    ]}
                    required
                />

                {selectedCRF && (
                    <div className="mt-6 p-4 bg-gray-50 rounded">
                        <h4 className="font-semibold text-gray-800 mb-3">CRF Details</h4>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                                <span className="text-gray-600">Customer:</span>
                                <span className="ml-2 font-medium">{selectedCRF.customer}</span>
                            </div>
                            <div>
                                <span className="text-gray-600">Type:</span>
                                <span className="ml-2 font-medium">{selectedCRF.crfType}</span>
                            </div>
                            <div>
                                <span className="text-gray-600">Sample Type:</span>
                                <span className="ml-2 font-medium">{selectedCRF.sampleType}</span>
                            </div>
                            <div>
                                <span className="text-gray-600">Number of Samples:</span>
                                <span className="ml-2 font-medium">{selectedCRF.numberOfSamples}</span>
                            </div>
                        </div>
                        <div className="mt-3">
                            <span className="text-gray-600 text-sm">Test Parameters:</span>
                            <div className="flex flex-wrap gap-2 mt-2">
                                {selectedCRF.testParameters.map(param => (
                                    <span key={param} className="px-3 py-1 bg-blue-100 text-blue-700 rounded text-sm">
                                        {param}
                                    </span>
                                ))}
                            </div>
                        </div>
                    </div>
                )}
            </Card>

            {selectedCRF && assignments.length > 0 && (
                <Card>
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">Assign Chemists to Test Parameters</h3>
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Sample ID</TableHead>
                                    <TableHead>Description</TableHead>
                                    <TableHead>Parameter</TableHead>
                                    <TableHead>Unit</TableHead>
                                    <TableHead>Method</TableHead>
                                    <TableHead>Assigned Chemist</TableHead>
                                    <TableHead>Due Date</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {assignments.map((assignment, index) => (
                                    <TableRow key={`${assignment.sampleId}-${assignment.parameter}`}>
                                        <TableCell className="font-semibold">{assignment.sampleId}</TableCell>
                                        <TableCell>{assignment.sampleDescription}</TableCell>
                                        <TableCell>{assignment.parameter}</TableCell>
                                        <TableCell>{assignment.unit}</TableCell>
                                        <TableCell className="text-xs">{assignment.method}</TableCell>
                                        <TableCell>
                                            <select
                                                value={mockChemists.find((c) => c.name === assignment.chemist)?.id || ''}
                                                onChange={(e) => handleChemistChange(index, e.target.value)}
                                                disabled={isLocked}
                                                className="w-full px-3 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:bg-gray-100"
                                            >
                                                <option value="">Select Chemist</option>
                                                {mockChemists.map((chemist) => (
                                                    <option key={chemist.id} value={chemist.id}>
                                                        {chemist.name}
                                                    </option>
                                                ))}
                                            </select>
                                        </TableCell>
                                        <TableCell>
                                            <Input
                                                type="date"
                                                value={assignment.dueDate}
                                                onChange={(e) => handleDueDateChange(index, e.target.value)}
                                                disabled={isLocked}
                                            />
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>

                    <div className="mt-6 flex justify-end gap-3">
                        {!isLocked ? (
                            <Button
                                onClick={handleLock}
                                disabled={assignments.some((a) => !a.chemist)}
                            >
                                Lock Parameters & Proceed
                            </Button>
                        ) : (
                            <Badge status="approved">Parameters Locked - Cannot Edit</Badge>
                        )}
                    </div>
                </Card>
            )}
        </div>
    );
};
