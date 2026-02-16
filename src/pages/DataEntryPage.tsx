import React, { useState } from 'react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Input } from '../components/ui/Input';
import { useWorkflow } from '../context/WorkflowContext';

export const DataEntryPage: React.FC = () => {
    const { samples, assignmentsLocked, resultsStatus, updateSampleResult, submitResults } = useWorkflow();

    const [localResults, setLocalResults] = useState(
        samples.map((s) => ({
            ref: s.ref,
            value: s.testValue || '',
            remarks: s.remarks || '',
        }))
    );

    const handleValueChange = (ref: string, value: string) => {
        setLocalResults((prev) =>
            prev.map((r) => (r.ref === ref ? { ...r, value } : r))
        );
    };

    const handleRemarksChange = (ref: string, remarks: string) => {
        setLocalResults((prev) =>
            prev.map((r) => (r.ref === ref ? { ...r, remarks } : r))
        );
    };

    const handleSubmit = () => {
        localResults.forEach((result) => {
            updateSampleResult(result.ref, result.value, result.remarks);
        });
        submitResults();
    };

    if (!assignmentsLocked) {
        return (
            <div>
                <h1 className="text-3xl font-bold text-gray-800 mb-8">Data Entry</h1>
                <Card>
                    <p className="text-gray-500">Please lock parameter assignments first before entering results.</p>
                </Card>
            </div>
        );
    }

    return (
        <div>
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold text-gray-800">Data Entry - Chemist Results</h1>
                <Badge status={resultsStatus === 'Results Submitted' ? 'submitted' : 'pending'}>
                    {resultsStatus}
                </Badge>
            </div>

            <div className="grid grid-cols-1 gap-6">
                {samples.map((sample, index) => (
                    <Card key={sample.ref}>
                        <div className="flex items-center justify-between mb-4 pb-3 border-b">
                            <div>
                                <h3 className="text-lg font-semibold text-gray-800">{sample.ref}</h3>
                                <p className="text-sm text-gray-600">{sample.description}</p>
                            </div>
                            <Badge status="pending">COD Testing</Badge>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <Input
                                label="Test Value (mg/L)"
                                value={localResults[index]?.value || ''}
                                onChange={(e) => handleValueChange(sample.ref, e.target.value)}
                                placeholder="Enter test value"
                                disabled={resultsStatus === 'Results Submitted'}
                                required
                            />

                            <Input
                                label="Remarks"
                                value={localResults[index]?.remarks || ''}
                                onChange={(e) => handleRemarksChange(sample.ref, e.target.value)}
                                placeholder="Optional remarks"
                                disabled={resultsStatus === 'Results Submitted'}
                            />
                        </div>

                        <div className="mt-3 text-sm text-gray-600">
                            <p><span className="font-medium">Method:</span> APHA 5220 D</p>
                            <p><span className="font-medium">Parameter:</span> COD (Chemical Oxygen Demand)</p>
                        </div>
                    </Card>
                ))}
            </div>

            <div className="mt-6 flex justify-end">
                <Button
                    onClick={handleSubmit}
                    disabled={
                        resultsStatus === 'Results Submitted' ||
                        localResults.some((r) => !r.value)
                    }
                >
                    {resultsStatus === 'Results Submitted' ? 'Results Submitted' : 'Submit All Results'}
                </Button>
            </div>
        </div>
    );
};
