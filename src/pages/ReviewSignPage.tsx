import React, { useState } from 'react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../components/ui/Table';
import { SignatureCanvas } from '../components/SignatureCanvas';
import { useWorkflow } from '../context/WorkflowContext';
import { CheckCircle, XCircle } from 'lucide-react';

export const ReviewSignPage: React.FC = () => {
    const { crfs, updateCRFStatus } = useWorkflow();
    const [selectedCRFId, setSelectedCRFId] = useState<string>('');
    const [reviewerName, setReviewerName] = useState('');
    const [reviewerSignature, setReviewerSignature] = useState('');
    const [comments, setComments] = useState('');

    // Get CRFs that are in 'review' status
    const reviewCRFs = crfs.filter(c => c.status === 'review');
    const selectedCRF = crfs.find(c => c.id === selectedCRFId);

    const handleCRFChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const crfId = e.target.value;
        setSelectedCRFId(crfId);
        setComments('');
    };

    const handleApprove = () => {
        if (!selectedCRFId) return;
        
        if (!reviewerName || !reviewerSignature) {
            alert('Please provide reviewer name and signature');
            return;
        }

        // TODO: Save reviewer name, signature, and comments to CRF
        updateCRFStatus(selectedCRFId, 'approved');
        alert('CRF approved successfully! Ready for report generation.');
        
        // Reset form
        setSelectedCRFId('');
        setReviewerName('');
        setReviewerSignature('');
        setComments('');
    };

    const handleReject = () => {
        if (!selectedCRFId) return;
        
        if (!reviewerName || !comments) {
            alert('Please provide reviewer name and rejection reason in comments');
            return;
        }

        // Return to testing status for corrections
        updateCRFStatus(selectedCRFId, 'testing');
        alert('CRF rejected and returned to testing. Please add corrections.');
        
        // Reset form
        setSelectedCRFId('');
        setReviewerName('');
        setReviewerSignature('');
        setComments('');
    };

    if (reviewCRFs.length === 0) {
        return (
            <div>
                <h1 className="text-3xl font-bold text-gray-800 mb-8">Review & Sign</h1>
                <Card>
                    <p className="text-gray-500">
                        No CRFs available for review. CRFs must be in "review" status after data entry or environmental sampling.
                    </p>
                </Card>
            </div>
        );
    }

    return (
        <div>
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-gray-800">Review & Sign</h1>
                    <p className="text-sm text-gray-600 mt-1">Supervisor approval for test results</p>
                </div>
                {selectedCRF && <Badge status={selectedCRF.status}>{selectedCRF.status}</Badge>}
            </div>

            {/* CRF Selection */}
            <Card className="mb-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Select CRF for Review</h3>
                <select
                    value={selectedCRFId}
                    onChange={handleCRFChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                    <option value="">-- Select a CRF in Review Status --</option>
                    {reviewCRFs.map(crf => (
                        <option key={crf.id} value={crf.id}>
                            {crf.id} - {crf.customer} - {crf.sampleType} ({crf.crfType})
                        </option>
                    ))}
                </select>
            </Card>

            {selectedCRF && (
                <>
                    {/* CRF Details */}
                    <Card className="mb-6">
                        <h3 className="text-lg font-semibold text-gray-800 mb-4 pb-3 border-b">CRF Information</h3>
                        <div className="grid grid-cols-3 gap-4">
                            <div>
                                <p className="text-sm text-gray-600">CRF ID</p>
                                <p className="font-medium">{selectedCRF.id}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-600">Customer</p>
                                <p className="font-medium">{selectedCRF.customer}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-600">Type</p>
                                <p className="font-medium">{selectedCRF.crfType === 'CS' ? 'Customer Submission' : 'Lab Service'}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-600">Sample Type</p>
                                <p className="font-medium">{selectedCRF.sampleType}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-600">Number of Samples</p>
                                <p className="font-medium">{selectedCRF.numberOfSamples}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-600">Status</p>
                                <Badge status={selectedCRF.status}>{selectedCRF.status}</Badge>
                            </div>
                        </div>
                    </Card>

                    {/* Test Results */}
                    <Card className="mb-6">
                        <h3 className="text-lg font-semibold text-gray-800 mb-4 pb-3 border-b">Test Results</h3>
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Sample</TableHead>
                                        <TableHead>Test Parameter</TableHead>
                                        <TableHead>Result/Value</TableHead>
                                        <TableHead>Unit</TableHead>
                                        <TableHead>Assigned Chemist</TableHead>
                                        <TableHead>Status</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {selectedCRF.testParameters.map((param, paramIndex) => 
                                        Array.from({ length: selectedCRF.numberOfSamples }, (_, sampleIndex) => (
                                            <TableRow key={`${paramIndex}-${sampleIndex}`}>
                                                <TableCell>Sample {sampleIndex + 1}</TableCell>
                                                <TableCell className="font-medium">{param}</TableCell>
                                                <TableCell>
                                                    <span className="text-primary-600 font-semibold">
                                                        {/* TODO: Get actual test values from context */}
                                                        [Test Value]
                                                    </span>
                                                </TableCell>
                                                <TableCell className="text-gray-600">
                                                    {/* TODO: Get actual units from parameter data */}
                                                    [Unit]
                                                </TableCell>
                                                <TableCell>
                                                    {/* TODO: Get assigned chemist from context */}
                                                    [Chemist Name]
                                                </TableCell>
                                                <TableCell>
                                                    <Badge status="approved">Completed</Badge>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </div>
                    </Card>

                    {/* Review Section */}
                    <Card className="mb-6">
                        <h3 className="text-lg font-semibold text-gray-800 mb-4 pb-3 border-b">Supervisor Review</h3>
                        
                        <div className="mb-6">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Reviewer Name <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                value={reviewerName}
                                onChange={(e) => setReviewerName(e.target.value)}
                                placeholder="Enter supervisor name"
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                            />
                        </div>

                        <div className="mb-6">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Comments / Remarks
                            </label>
                            <textarea
                                value={comments}
                                onChange={(e) => setComments(e.target.value)}
                                placeholder="Add any comments or notes about the review..."
                                rows={4}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                            />
                        </div>

                        <div className="mb-6">
                            <label className="block text-sm font-medium text-gray-700 mb-3">
                                E-Signature <span className="text-red-500">*</span>
                            </label>
                            <SignatureCanvas
                                onSave={setReviewerSignature}
                                savedSignature={reviewerSignature}
                            />
                        </div>

                        <div className="flex gap-4">
                            <Button
                                variant="primary"
                                onClick={handleApprove}
                                className="flex items-center gap-2"
                            >
                                <CheckCircle size={18} />
                                Approve & Sign
                            </Button>
                            <Button
                                variant="secondary"
                                onClick={handleReject}
                                className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white"
                            >
                                <XCircle size={18} />
                                Reject & Return
                            </Button>
                        </div>
                    </Card>
                </>
            )}
        </div>
    );
};
