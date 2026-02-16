import React, { useState } from 'react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../components/ui/Table';
import { useWorkflow } from '../context/WorkflowContext';

export const DataEntryPage: React.FC = () => {
    const { crfs, getCRFsByStatus, addTestResult, updateCRFStatus } = useWorkflow();
    const [selectedCRFId, setSelectedCRFId] = useState<string>('');
    const [results, setResults] = useState<any[]>([]);
    const [isSubmitted, setIsSubmitted] = useState(false);

    // Get CRFs with status='assigned' (parameters locked, ready for testing)
    const assignedCRFs = getCRFsByStatus('assigned');
    const selectedCRF = crfs.find(c => c.id === selectedCRFId);

    const handleCRFChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const crfId = e.target.value;
        setSelectedCRFId(crfId);
        setIsSubmitted(false);

        if (crfId) {
            const crf = crfs.find(c => c.id === crfId);
            if (crf) {
                // Initialize results for each sample and parameter
                const newResults = crf.samples.flatMap(sample =>
                    crf.testParameters.map(paramName => ({
                        crfId: crf.id,
                        sampleId: sample.id,
                        sampleDescription: sample.description,
                        parameter: paramName,
                        testValue: '',
                        remarks: '',
                        testedBy: '',
                        testDate: new Date().toISOString().split('T')[0],
                    }))
                );
                setResults(newResults);
            }
        } else {
            setResults([]);
        }
    };

    const handleValueChange = (index: number, value: string) => {
        const updated = [...results];
        updated[index].testValue = value;
        setResults(updated);
    };

    const handleRemarksChange = (index: number, remarks: string) => {
        const updated = [...results];
        updated[index].remarks = remarks;
        setResults(updated);
    };

    const handleTestedByChange = (index: number, testedBy: string) => {
        const updated = [...results];
        updated[index].testedBy = testedBy;
        setResults(updated);
    };

    const handleSubmit = () => {
        if (!selectedCRFId) return;

        // Validate all results have values
        const incomplete = results.some(r => !r.testValue || !r.testedBy);
        if (incomplete) {
            alert('Please fill in all test values and tested by names');
            return;
        }

        // Save all results
        results.forEach(result => {
            addTestResult(result);
        });

        // Update CRF status to 'testing' then 'review'
        updateCRFStatus(selectedCRFId, 'testing');
        setTimeout(() => {
            updateCRFStatus(selectedCRFId, 'review');
        }, 100);

        setIsSubmitted(true);
        alert('Test results submitted successfully! CRF moved to Review status.');
    };

    if (assignedCRFs.length === 0) {
        return (
            <div>
                <h1 className="text-3xl font-bold text-gray-800 mb-8">Data Entry - Chemist Results</h1>
                <Card>
                    <p className="text-gray-500">No CRFs available for data entry. CRFs must be in "Assigned" status with locked parameters.</p>
                </Card>
            </div>
        );
    }

    return (
        <div>
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold text-gray-800">Data Entry - Chemist Results</h1>
                {isSubmitted && <Badge status="approved">Results Submitted</Badge>}
            </div>

            <Card className="mb-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Select CRF</h3>
                <Select
                    label="CRF ID"
                    value={selectedCRFId}
                    onChange={handleCRFChange}
                    options={[
                        { value: '', label: 'Select a CRF' },
                        ...assignedCRFs.map(crf => ({
                            value: crf.id,
                            label: `${crf.id} - ${crf.customer} (${crf.numberOfSamples} samples, ${crf.testParameters.length} parameters)`
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
                                <span className="text-gray-600">Status:</span>
                                <Badge status="pending">Assigned - Ready for Testing</Badge>
                            </div>
                        </div>
                    </div>
                )}
            </Card>

            {selectedCRF && results.length > 0 && (
                <Card>
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">Enter Test Results</h3>
                    <p className="text-sm text-gray-600 mb-4">Fill in test values for each sample and parameter combination.</p>
                    
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Sample ID</TableHead>
                                    <TableHead>Description</TableHead>
                                    <TableHead>Parameter</TableHead>
                                    <TableHead>Test Value</TableHead>
                                    <TableHead>Tested By</TableHead>
                                    <TableHead>Test Date</TableHead>
                                    <TableHead>Remarks</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {results.map((result, index) => (
                                    <TableRow key={`${result.sampleId}-${result.parameter}`}>
                                        <TableCell className="font-semibold">{result.sampleId}</TableCell>
                                        <TableCell>{result.sampleDescription}</TableCell>
                                        <TableCell className="font-medium">{result.parameter}</TableCell>
                                        <TableCell>
                                            <Input
                                                type="text"
                                                value={result.testValue}
                                                onChange={(e) => handleValueChange(index, e.target.value)}
                                                placeholder="Enter value"
                                                disabled={isSubmitted}
                                            />
                                        </TableCell>
                                        <TableCell>
                                            <Input
                                                type="text"
                                                value={result.testedBy}
                                                onChange={(e) => handleTestedByChange(index, e.target.value)}
                                                placeholder="Your name"
                                                disabled={isSubmitted}
                                            />
                                        </TableCell>
                                        <TableCell>
                                            <span className="text-sm">{new Date(result.testDate).toLocaleDateString()}</span>
                                        </TableCell>
                                        <TableCell>
                                            <Input
                                                type="text"
                                                value={result.remarks}
                                                onChange={(e) => handleRemarksChange(index, e.target.value)}
                                                placeholder="Optional remarks"
                                                disabled={isSubmitted}
                                            />
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>

                    <div className="mt-6 flex justify-end gap-3">
                        {!isSubmitted ? (
                            <Button
                                onClick={handleSubmit}
                                disabled={results.some((r) => !r.testValue || !r.testedBy)}
                            >
                                Submit All Results
                            </Button>
                        ) : (
                            <Badge status="approved">Results Submitted - Moved to Review</Badge>
                        )}
                    </div>
                </Card>
            )}
        </div>
    );
};
