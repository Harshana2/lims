import React, { useState, useEffect } from 'react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../components/ui/Table';
import { sampleService, crfService, type Sample, type CRF } from '../services';

export const DataEntryPage: React.FC = () => {
    const [crfs, setCrfs] = useState<CRF[]>([]);
    const [samples, setSamples] = useState<Sample[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [selectedCRFId, setSelectedCRFId] = useState<string>('');
    const [results, setResults] = useState<any[]>([]);
    const [isSubmitted, setIsSubmitted] = useState(false);

    // Load CRFs with status='assigned'
    useEffect(() => {
        loadcrfs();
    }, []);

    const loadcrfs = async () => {
        try {
            setLoading(true);
            const data = await crfService.getByStatus('assigned');
            setCrfs(data);
            setError('');
        } catch (err) {
            console.error('Failed to load CRFs:', err);
            setError('Failed to load CRFs. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const selectedCRF = crfs.find(c => c.id?.toString() === selectedCRFId);

    const handleCRFChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
        const crfId = e.target.value;
        setSelectedCRFId(crfId);
        setIsSubmitted(false);

        if (crfId) {
            const crf = crfs.find(c => c.id?.toString() === crfId);
            if (crf) {
                try {
                    // Load samples for this CRF using numeric ID
                    const crfSamples = await sampleService.getByCrfId(crf.id || 0);
                    setSamples(crfSamples);
                    
                    // Initialize results for each sample and parameter
                    const newResults = crfSamples.flatMap(sample =>
                        crf.testParameters.map(paramName => ({
                            sampleNumericId: sample.id, // Keep numeric ID for API calls
                            sampleId: sample.sampleId, // Formatted ID for display (e.g., CS/26/1)
                            sampleDescription: sample.description || `Sample ${sample.sampleId}`,
                            assignedChemist: sample.assignedTo || 'Unassigned',
                            parameter: paramName,
                            testValue: '',
                            remarks: '',
                            testedBy: sample.assignedTo || '', // Pre-fill with assigned chemist
                            testDate: new Date().toISOString().split('T')[0],
                        }))
                    );
                    setResults(newResults);
                } catch (err) {
                    console.error('Failed to load samples:', err);
                    alert('Failed to load samples for this CRF.');
                }
            }
        } else {
            setResults([]);
            setSamples([]);
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

    const handleSubmit = async () => {
        if (!selectedCRFId) return;

        // Validate all results have values
        const incomplete = results.some(r => !r.testValue || !r.testedBy);
        if (incomplete) {
            alert('Please fill in all test values and tested by names');
            return;
        }

        try {
            // Update each sample with test values
            for (const result of results) {
                if (result.sampleNumericId) {
                    await sampleService.updateTestValues(result.sampleNumericId, {
                        [result.parameter]: result.testValue
                    });
                }
            }

            // Update CRF status to 'review'
            await crfService.updateStatus(parseInt(selectedCRFId), 'review');

            setIsSubmitted(true);
            alert('Test results submitted successfully! CRF moved to Review status.');
            await loadcrfs();
        } catch (err) {
            console.error('Failed to submit results:', err);
            alert('Failed to submit test results. Please try again.');
        }
    };

    if (loading) {
        return (
            <div>
                <h1 className="text-3xl font-bold text-gray-800 mb-8">Data Entry - Chemist Results</h1>
                <Card>
                    <p className="text-gray-500">Loading...</p>
                </Card>
            </div>
        );
    }

    if (error) {
        return (
            <div>
                <h1 className="text-3xl font-bold text-gray-800 mb-8">Data Entry - Chemist Results</h1>
                <Card>
                    <p className="text-red-500">{error}</p>
                </Card>
            </div>
        );
    }

    if (crfs.length === 0) {
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
                        ...crfs.map(crf => ({
                            value: crf.id?.toString() || '',
                            label: `${crf.crfId} - ${crf.customer} (${crf.numberOfSamples} samples, ${crf.testParameters.length} parameters)`
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
                                    <TableHead>Assigned Chemist</TableHead>
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
                                        <TableCell className="text-gray-700 font-medium">{result.assignedChemist}</TableCell>
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
