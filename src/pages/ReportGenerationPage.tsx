import React, { useRef, useState } from 'react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../components/ui/Table';
import { useWorkflow } from '../context/WorkflowContext';
import { FileDown, Eye } from 'lucide-react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export const ReportGenerationPage: React.FC = () => {
    const { crfs, updateCRFStatus } = useWorkflow();
    const [selectedCRFId, setSelectedCRFId] = useState<string>('');
    const [showPreview, setShowPreview] = useState(false);
    const reportRef = useRef<HTMLDivElement>(null);

    // Get CRFs that are in 'approved' status
    const approvedCRFs = crfs.filter(c => c.status === 'approved');
    const selectedCRF = crfs.find(c => c.id === selectedCRFId);

    const handleCRFChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const crfId = e.target.value;
        setSelectedCRFId(crfId);
        setShowPreview(false);
    };

    const handlePreview = () => {
        if (!selectedCRFId) {
            alert('Please select a CRF first');
            return;
        }
        setShowPreview(true);
    };

    const handleDownloadPDF = async () => {
        if (!reportRef.current || !selectedCRF) return;

        const canvas = await html2canvas(reportRef.current, {
            scale: 2,
            useCORS: true,
            logging: false,
            backgroundColor: '#ffffff',
        });

        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF('p', 'mm', 'a4');
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

        pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
        pdf.save(`LIMS_Report_${selectedCRF.id}_${new Date().toISOString().split('T')[0]}.pdf`);

        // Update CRF status to completed
        updateCRFStatus(selectedCRFId, 'completed');
        alert('Report downloaded! CRF marked as completed.');
        
        // Reset
        setSelectedCRFId('');
        setShowPreview(false);
    };

    if (approvedCRFs.length === 0) {
        return (
            <div>
                <h1 className="text-3xl font-bold text-gray-800 mb-8">Report Generation</h1>
                <Card>
                    <p className="text-gray-500">
                        No approved CRFs available. CRFs must be reviewed and approved before report generation.
                    </p>
                </Card>
            </div>
        );
    }

    return (
        <div>
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-gray-800">Report Generation</h1>
                    <p className="text-sm text-gray-600 mt-1">Generate final test reports for approved CRFs</p>
                </div>
                {selectedCRF && <Badge status={selectedCRF.status}>{selectedCRF.status}</Badge>}
            </div>

            {!showPreview ? (
                <>
                    {/* CRF Selection */}
                    <Card className="mb-6">
                        <h3 className="text-lg font-semibold text-gray-800 mb-4">Select Approved CRF</h3>
                        <select
                            value={selectedCRFId}
                            onChange={handleCRFChange}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                        >
                            <option value="">-- Select an Approved CRF --</option>
                            {approvedCRFs.map(crf => (
                                <option key={crf.id} value={crf.id}>
                                    {crf.id} - {crf.customer} - {crf.sampleType} ({crf.crfType})
                                </option>
                            ))}
                        </select>
                    </Card>

                    {selectedCRF && (
                        <>
                            {/* CRF Summary */}
                            <Card className="mb-6">
                                <h3 className="text-lg font-semibold text-gray-800 mb-4 pb-3 border-b">CRF Summary</h3>
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
                                        <p className="font-medium">
                                            {selectedCRF.crfType === 'CS' ? 'Customer Submission' : 'Lab Service'}
                                        </p>
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
                                        <p className="text-sm text-gray-600">Test Parameters</p>
                                        <p className="font-medium">{selectedCRF.testParameters.length}</p>
                                    </div>
                                </div>
                            </Card>

                            {/* Test Results Preview */}
                            <Card className="mb-6">
                                <h3 className="text-lg font-semibold text-gray-800 mb-4 pb-3 border-b">Test Results</h3>
                                <div className="overflow-x-auto">
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>Sample</TableHead>
                                                <TableHead>Parameter</TableHead>
                                                <TableHead>Result</TableHead>
                                                <TableHead>Unit</TableHead>
                                                <TableHead>Method</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {selectedCRF.testParameters.map((param, paramIndex) => 
                                                Array.from({ length: selectedCRF.numberOfSamples }, (_, sampleIndex) => (
                                                    <TableRow key={`${paramIndex}-${sampleIndex}`}>
                                                        <TableCell className="font-medium">Sample {sampleIndex + 1}</TableCell>
                                                        <TableCell>{param}</TableCell>
                                                        <TableCell className="text-primary-600 font-semibold">
                                                            {/* TODO: Get actual test values */}
                                                            [Value]
                                                        </TableCell>
                                                        <TableCell className="text-gray-600">
                                                            {/* TODO: Get units */}
                                                            [Unit]
                                                        </TableCell>
                                                        <TableCell className="text-sm text-gray-500">
                                                            {/* TODO: Get method */}
                                                            [Method]
                                                        </TableCell>
                                                    </TableRow>
                                                ))
                                            )}
                                        </TableBody>
                                    </Table>
                                </div>
                            </Card>

                            {/* Environmental Sampling Data Preview */}
                            {selectedCRF.environmentalData && (
                                <Card className="mb-6">
                                    <h3 className="text-lg font-semibold text-gray-800 mb-4 pb-3 border-b">Environmental Sampling Data</h3>
                                    <div className="mb-4 p-4 bg-blue-50 rounded-lg">
                                        <div className="grid grid-cols-2 gap-3">
                                            <p className="text-sm">
                                                <span className="font-semibold">Sampling Points:</span> {selectedCRF.environmentalData.samplingPoints.length}
                                            </p>
                                            <p className="text-sm">
                                                <span className="font-semibold">Map Type:</span> {selectedCRF.environmentalData.mapType === 'satellite' ? 'Satellite View' : 'Standard Map'}
                                            </p>
                                            <p className="text-sm">
                                                <span className="font-semibold">Submitted By:</span> {selectedCRF.environmentalData.submittedBy}
                                            </p>
                                            <p className="text-sm">
                                                <span className="font-semibold">Submitted At:</span> {new Date(selectedCRF.environmentalData.submittedAt).toLocaleString()}
                                            </p>
                                        </div>
                                    </div>

                                    {selectedCRF.environmentalData.samplingPoints.map((point) => (
                                        <div key={point.id} className="mb-4">
                                            <div className="bg-gray-50 p-3 rounded-t-lg">
                                                <h4 className="font-semibold text-primary-700">
                                                    Point {point.pointNumber}: {point.locationName}
                                                </h4>
                                                <p className="text-sm text-gray-600 mt-1">
                                                    GPS: {point.latitude.toFixed(6)}, {point.longitude.toFixed(6)}
                                                </p>
                                            </div>
                                            
                                            {point.measurements.length > 0 && (
                                                <div className="overflow-x-auto">
                                                    <Table>
                                                        <TableHeader>
                                                            <TableRow>
                                                                <TableHead>Parameter</TableHead>
                                                                <TableHead>Value</TableHead>
                                                                <TableHead>Unit</TableHead>
                                                                <TableHead>Measured By</TableHead>
                                                                <TableHead>Remarks</TableHead>
                                                            </TableRow>
                                                        </TableHeader>
                                                        <TableBody>
                                                            {point.measurements.map((measurement, index) => (
                                                                <TableRow key={index}>
                                                                    <TableCell>{measurement.parameter}</TableCell>
                                                                    <TableCell className="font-semibold text-primary-600">{measurement.value}</TableCell>
                                                                    <TableCell>{measurement.unit}</TableCell>
                                                                    <TableCell className="text-sm">{measurement.measuredBy}</TableCell>
                                                                    <TableCell className="text-sm text-gray-600">{measurement.remarks || '-'}</TableCell>
                                                                </TableRow>
                                                            ))}
                                                        </TableBody>
                                                    </Table>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </Card>
                            )}

                            <div className="flex justify-end">
                                <Button variant="primary" onClick={handlePreview}>
                                    <Eye size={18} className="mr-2" />
                                    Preview Report
                                </Button>
                            </div>
                        </>
                    )}
                </>
            ) : (
                <>
                    {/* PDF Preview */}
                    <div className="mb-6 flex justify-end gap-3">
                        <Button variant="secondary" onClick={() => setShowPreview(false)}>
                            Back to Selection
                        </Button>
                        <Button variant="primary" onClick={handleDownloadPDF}>
                            <FileDown size={18} className="mr-2" />
                            Download PDF & Complete
                        </Button>
                    </div>

                    {/* Report Document */}
                    <div ref={reportRef} className="bg-white p-12 shadow-2xl mx-auto" style={{ width: '210mm', minHeight: '297mm' }}>
                        {/* Header */}
                        <div className="border-b-4 border-primary-700 pb-6 mb-8">
                            <div className="flex justify-between items-start">
                                <div>
                                    <h1 className="text-3xl font-bold text-primary-800">LINDEL INDUSTRIAL LABORATORIES</h1>
                                    <p className="text-sm text-gray-600 mt-3">No. 123, Laboratory Road, Colombo 05, Sri Lanka</p>
                                    <p className="text-sm text-gray-600">Email: info@lindellabs.lk | Tel: +94 11 234 5678</p>
                                    <p className="text-sm text-gray-600">Accreditation: ISO/IEC 17025:2017</p>
                                </div>
                                <div className="w-28 h-28 border-4 border-primary-700 rounded flex items-center justify-center">
                                    <span className="text-lg font-bold text-primary-700">LOGO</span>
                                </div>
                            </div>
                        </div>

                        {/* Report Title */}
                        <div className="text-center mb-8 bg-primary-50 py-4 border-t-2 border-b-2 border-primary-900">
                            <h2 className="text-2xl font-bold text-primary-900 uppercase tracking-wider">
                                CERTIFICATE OF ANALYSIS
                            </h2>
                        </div>

                        {/* Report Details */}
                        <div className="grid grid-cols-2 gap-8 mb-8">
                            <div>
                                <h3 className="text-sm font-bold text-gray-800 mb-3 uppercase border-b border-gray-400 pb-1">
                                    Client Information:
                                </h3>
                                <div className="ml-2 space-y-2">
                                    <p className="text-sm">
                                        <span className="font-semibold">Name:</span> {selectedCRF?.customer}
                                    </p>
                                    <p className="text-sm">
                                        <span className="font-semibold">Address:</span> {selectedCRF?.address}
                                    </p>
                                    <p className="text-sm">
                                        <span className="font-semibold">Contact:</span> {selectedCRF?.contact}
                                    </p>
                                    <p className="text-sm">
                                        <span className="font-semibold">Email:</span> {selectedCRF?.email}
                                    </p>
                                </div>
                            </div>
                            <div>
                                <h3 className="text-sm font-bold text-gray-800 mb-3 uppercase border-b border-gray-400 pb-1">
                                    Report Details:
                                </h3>
                                <div className="space-y-2">
                                    <p className="text-sm">
                                        <span className="font-semibold">Report No:</span> {selectedCRF?.id}
                                    </p>
                                    <p className="text-sm">
                                        <span className="font-semibold">Date Issued:</span> {new Date().toLocaleDateString('en-GB')}
                                    </p>
                                    <p className="text-sm">
                                        <span className="font-semibold">Sample Type:</span> {selectedCRF?.sampleType}
                                    </p>
                                    <p className="text-sm">
                                        <span className="font-semibold">Type:</span> {selectedCRF?.crfType === 'CS' ? 'Customer Submission' : 'Lab Service'}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Sample Information */}
                        <div className="mb-8">
                            <h3 className="text-sm font-bold text-gray-800 mb-3 uppercase border-b border-gray-400 pb-1">
                                Sample Information:
                            </h3>
                            <div className="ml-2 grid grid-cols-2 gap-4">
                                <p className="text-sm">
                                    <span className="font-semibold">Number of Samples:</span> {selectedCRF?.numberOfSamples}
                                </p>
                                <p className="text-sm">
                                    <span className="font-semibold">Date Received:</span> {selectedCRF?.createdAt ? new Date(selectedCRF.createdAt).toLocaleDateString('en-GB') : 'N/A'}
                                </p>
                            </div>
                        </div>

                        {/* Test Results Table */}
                        <div className="mb-8">
                            <h3 className="text-sm font-bold text-gray-800 mb-3 uppercase border-b border-gray-400 pb-1">
                                Test Results:
                            </h3>
                            <table className="w-full border-collapse border border-gray-400 text-sm">
                                <thead>
                                    <tr className="bg-gray-100">
                                        <th className="border border-gray-400 px-3 py-2 text-left font-semibold">Sample ID</th>
                                        <th className="border border-gray-400 px-3 py-2 text-left font-semibold">Test Parameter</th>
                                        <th className="border border-gray-400 px-3 py-2 text-left font-semibold">Result</th>
                                        <th className="border border-gray-400 px-3 py-2 text-left font-semibold">Unit</th>
                                        <th className="border border-gray-400 px-3 py-2 text-left font-semibold">Method</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {selectedCRF?.testParameters.map((param, paramIndex) => 
                                        Array.from({ length: selectedCRF.numberOfSamples }, (_, sampleIndex) => (
                                            <tr key={`${paramIndex}-${sampleIndex}`}>
                                                <td className="border border-gray-400 px-3 py-2 font-medium">
                                                    {selectedCRF.id}-S{sampleIndex + 1}
                                                </td>
                                                <td className="border border-gray-400 px-3 py-2">{param}</td>
                                                <td className="border border-gray-400 px-3 py-2 font-semibold text-primary-700">
                                                    {/* TODO: Get actual values */}
                                                    [Result]
                                                </td>
                                                <td className="border border-gray-400 px-3 py-2 text-gray-600">
                                                    {/* TODO: Get units */}
                                                    [Unit]
                                                </td>
                                                <td className="border border-gray-400 px-3 py-2 text-xs text-gray-500">
                                                    {/* TODO: Get method */}
                                                    [Method]
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* Environmental Sampling Data (if available) */}
                        {selectedCRF?.environmentalData && (
                            <div className="mb-8">
                                <h3 className="text-sm font-bold text-gray-800 mb-3 uppercase border-b border-gray-400 pb-1">
                                    Environmental Sampling Data:
                                </h3>
                                <div className="ml-2 mb-4">
                                    <p className="text-sm mb-1">
                                        <span className="font-semibold">Map Type:</span> {selectedCRF.environmentalData.mapType === 'satellite' ? 'Satellite View' : 'Standard Map'}
                                    </p>
                                    <p className="text-sm mb-1">
                                        <span className="font-semibold">Total Sampling Points:</span> {selectedCRF.environmentalData.samplingPoints.length}
                                    </p>
                                    <p className="text-sm mb-1">
                                        <span className="font-semibold">Submitted By:</span> {selectedCRF.environmentalData.submittedBy}
                                    </p>
                                    <p className="text-sm">
                                        <span className="font-semibold">Submitted At:</span> {new Date(selectedCRF.environmentalData.submittedAt).toLocaleString('en-GB')}
                                    </p>
                                </div>

                                {/* Sampling Points */}
                                {selectedCRF.environmentalData.samplingPoints.map((point) => (
                                    <div key={point.id} className="mb-6">
                                        <h4 className="text-sm font-semibold text-primary-700 mb-2 bg-primary-50 px-2 py-1">
                                            Point {point.pointNumber}: {point.locationName}
                                        </h4>
                                        <p className="text-xs text-gray-600 mb-2 ml-2">
                                            GPS: {point.latitude.toFixed(6)}, {point.longitude.toFixed(6)}
                                        </p>
                                        
                                        {point.measurements.length > 0 && (
                                            <table className="w-full border-collapse border border-gray-400 text-xs mb-2">
                                                <thead>
                                                    <tr className="bg-gray-100">
                                                        <th className="border border-gray-400 px-2 py-1 text-left font-semibold">Parameter</th>
                                                        <th className="border border-gray-400 px-2 py-1 text-left font-semibold">Value</th>
                                                        <th className="border border-gray-400 px-2 py-1 text-left font-semibold">Unit</th>
                                                        <th className="border border-gray-400 px-2 py-1 text-left font-semibold">Measured By</th>
                                                        <th className="border border-gray-400 px-2 py-1 text-left font-semibold">Remarks</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {point.measurements.map((measurement, mIndex) => (
                                                        <tr key={mIndex}>
                                                            <td className="border border-gray-400 px-2 py-1">{measurement.parameter}</td>
                                                            <td className="border border-gray-400 px-2 py-1 font-semibold text-primary-700">{measurement.value}</td>
                                                            <td className="border border-gray-400 px-2 py-1">{measurement.unit}</td>
                                                            <td className="border border-gray-400 px-2 py-1">{measurement.measuredBy}</td>
                                                            <td className="border border-gray-400 px-2 py-1 text-gray-600">{measurement.remarks || '-'}</td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Notes */}
                        <div className="mb-8">
                            <h3 className="text-sm font-bold text-gray-800 mb-2">Notes:</h3>
                            <ul className="list-disc ml-6 text-xs text-gray-600 space-y-1">
                                <li>All tests were conducted in accordance with ISO/IEC 17025:2017 standards</li>
                                <li>Results relate only to the items tested</li>
                                <li>This report shall not be reproduced except in full without written approval</li>
                                <li>Uncertainty of measurement is available upon request</li>
                            </ul>
                        </div>

                        {/* Signatures */}
                        <div className="mt-12 grid grid-cols-3 gap-8">
                            <div className="text-center">
                                <div className="border-t-2 border-gray-400 pt-2 mt-16">
                                    <p className="text-sm font-semibold">Tested By</p>
                                    <p className="text-xs text-gray-600 mt-1">[Chemist Name]</p>
                                    <p className="text-xs text-gray-500">Date: {new Date().toLocaleDateString('en-GB')}</p>
                                </div>
                            </div>
                            <div className="text-center">
                                <div className="border-t-2 border-gray-400 pt-2 mt-16">
                                    <p className="text-sm font-semibold">Reviewed By</p>
                                    <p className="text-xs text-gray-600 mt-1">[Supervisor Name]</p>
                                    <p className="text-xs text-gray-500">Date: {new Date().toLocaleDateString('en-GB')}</p>
                                </div>
                            </div>
                            <div className="text-center">
                                <div className="border-t-2 border-gray-400 pt-2 mt-16">
                                    <p className="text-sm font-semibold">Authorized By</p>
                                    <p className="text-xs text-gray-600 mt-1">[Lab Manager]</p>
                                    <p className="text-xs text-gray-500">Date: {new Date().toLocaleDateString('en-GB')}</p>
                                </div>
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="mt-12 pt-6 border-t-2 border-gray-300 text-center">
                            <p className="text-xs text-gray-500">
                                This is a computer-generated report and is valid without signature
                            </p>
                            <p className="text-xs text-gray-500 mt-1">
                                Page 1 of 1 | Report No: {selectedCRF?.id} | Generated: {new Date().toLocaleString('en-GB')}
                            </p>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};
