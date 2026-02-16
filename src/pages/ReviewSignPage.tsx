import React, { useState } from 'react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../components/ui/Table';
import { Input } from '../components/ui/Input';
import { useWorkflow } from '../context/WorkflowContext';

export const ReviewSignPage: React.FC = () => {
    const { samples, resultsStatus, reviewStatus, approveResults, supervisorName: savedSupervisorName, supervisorSignature: savedSignature } = useWorkflow();
    const [supervisorName, setSupervisorName] = useState(savedSupervisorName || '');
    const [signatureText, setSignatureText] = useState(savedSignature || '');

    const handleApprove = () => {
        approveResults(supervisorName, signatureText);
    };

    if (resultsStatus !== 'Results Submitted') {
        return (
            <div>
                <h1 className="text-3xl font-bold text-gray-800 mb-8">Review & Sign</h1>
                <Card>
                    <p className="text-gray-500">Please submit test results first before reviewing.</p>
                </Card>
            </div>
        );
    }

    return (
        <div>
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold text-gray-800">Review & Sign - Supervisor Approval</h1>
                <Badge status={reviewStatus === 'Approved' ? 'approved' : 'pending'}>
                    {reviewStatus}
                </Badge>
            </div>

            <Card className="mb-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Test Results Review</h3>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Sample</TableHead>
                            <TableHead>Parameter</TableHead>
                            <TableHead>Result</TableHead>
                            <TableHead>Unit</TableHead>
                            <TableHead>Method</TableHead>
                            <TableHead>Remarks</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {samples.map((sample) => (
                            <TableRow key={sample.ref}>
                                <TableCell className="font-medium">{sample.ref}</TableCell>
                                <TableCell>COD</TableCell>
                                <TableCell className="font-semibold text-primary-700">{sample.testValue}</TableCell>
                                <TableCell>mg/L</TableCell>
                                <TableCell>APHA 5220 D</TableCell>
                                <TableCell className="text-gray-600">{sample.remarks || '-'}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </Card>

            {reviewStatus !== 'Approved' ? (
                <Card>
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">Supervisor Approval</h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                        <Input
                            label="Supervisor Name"
                            value={supervisorName}
                            onChange={(e) => setSupervisorName(e.target.value)}
                            placeholder="Enter supervisor name"
                            required
                        />
                        <Input
                            label="Digital Signature"
                            value={signatureText}
                            onChange={(e) => setSignatureText(e.target.value)}
                            placeholder="Enter signature text"
                            required
                        />
                    </div>

                    <div className="flex justify-end gap-3">
                        <Button variant="danger">
                            Reject
                        </Button>
                        <Button
                            variant="success"
                            onClick={handleApprove}
                            disabled={!supervisorName || !signatureText}
                        >
                            Approve Results
                        </Button>
                    </div>
                </Card>
            ) : (
                <Card>
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">Approval Details</h3>
                    <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <p className="text-sm text-gray-600">Supervisor Name</p>
                                <p className="font-semibold text-gray-800">{savedSupervisorName}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-600">Digital Signature</p>
                                <p className="font-semibold text-gray-800">{savedSignature}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-600">Approval Date</p>
                                <p className="font-semibold text-gray-800">{new Date().toLocaleDateString()}</p>
                            </div>
                        </div>
                    </div>
                </Card>
            )}
        </div>
    );
};
