import React, { useRef } from 'react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { useWorkflow } from '../context/WorkflowContext';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export const ReportGenerationPage: React.FC = () => {
    const { request, samples, reviewStatus, supervisorName, supervisorSignature } = useWorkflow();
    const reportRef = useRef<HTMLDivElement>(null);

    const handleDownloadPDF = async () => {
        if (!reportRef.current) return;

        const canvas = await html2canvas(reportRef.current, {
            scale: 2,
            useCORS: true,
            logging: false,
        });

        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF('p', 'mm', 'a4');
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

        pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
        pdf.save(`LIMS_Report_${new Date().toISOString().split('T')[0]}.pdf`);
    };

    if (reviewStatus !== 'Approved') {
        return (
            <div>
                <h1 className="text-3xl font-bold text-gray-800 mb-8">Report Generation</h1>
                <Card>
                    <p className="text-gray-500">Please complete the review and approval process first.</p>
                </Card>
            </div>
        );
    }

    return (
        <div>
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold text-gray-800">Report Generation</h1>
                <div className="flex items-center gap-3">
                    <Badge status="approved">Approved</Badge>
                    <Button onClick={handleDownloadPDF}>
                        Download PDF
                    </Button>
                </div>
            </div>

            {/* Report Preview */}
            <div ref={reportRef} className="bg-white p-12 shadow-lg" style={{ minHeight: '297mm' }}>
                {/* Header */}
                <div className="border-b-2 border-primary-700 pb-6 mb-6">
                    <div className="flex justify-between items-start">
                        <div>
                            <h1 className="text-2xl font-bold text-primary-800">LINDEL INDUSTRIAL LABORATORIES LTD</h1>
                            <p className="text-sm text-gray-600 mt-2">No. 123, Laboratory Road, Colombo 05, Sri Lanka</p>
                            <p className="text-sm text-gray-600">Email: info@lindellabs.lk | Tel: +94 11 234 5678</p>
                        </div>
                        <div className="w-24 h-24 bg-gray-200 rounded flex items-center justify-center">
                            <span className="text-xs text-gray-500">LOGO</span>
                        </div>
                    </div>
                </div>

                {/* Report Title */}
                <div className="text-center mb-8">
                    <h2 className="text-xl font-bold text-gray-800 uppercase tracking-wide">Analysis Report</h2>
                </div>

                {/* Report Details */}
                <div className="grid grid-cols-2 gap-6 mb-8">
                    <div>
                        <p className="text-sm font-semibold text-gray-700 mb-2">REFERENCE NO:</p>
                        <p className="text-sm text-gray-800">{samples.map(s => s.ref).join(', ')}</p>
                    </div>
                    <div>
                        <p className="text-sm font-semibold text-gray-700 mb-2">DATE:</p>
                        <p className="text-sm text-gray-800">{new Date().toLocaleDateString('en-GB')}</p>
                    </div>
                    <div>
                        <p className="text-sm font-semibold text-gray-700 mb-2">CUSTOMER:</p>
                        <p className="text-sm text-gray-800">{request?.customer}</p>
                        <p className="text-sm text-gray-600">{request?.address}</p>
                    </div>
                    <div>
                        <p className="text-sm font-semibold text-gray-700 mb-2">SPECIMEN:</p>
                        <p className="text-sm text-gray-800">{request?.sampleType} Samples</p>
                    </div>
                </div>

                {/* Results Tables */}
                <div className="space-y-8">
                    {samples.map((sample, index) => (
                        <div key={sample.ref} className="border border-gray-300 rounded-lg overflow-hidden">
                            <div className="bg-gray-100 px-4 py-2 border-b border-gray-300">
                                <p className="font-semibold text-gray-800">REFERENCE NO: {sample.ref}</p>
                            </div>
                            <table className="w-full">
                                <thead>
                                    <tr className="bg-gray-50">
                                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 border-b border-r border-gray-300">Parameter</th>
                                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 border-b border-r border-gray-300">Unit</th>
                                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 border-b border-r border-gray-300">Test Value</th>
                                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 border-b border-gray-300">Test Method</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr>
                                        <td className="px-4 py-3 text-sm text-gray-800 border-r border-gray-300">COD</td>
                                        <td className="px-4 py-3 text-sm text-gray-800 border-r border-gray-300">mg/L</td>
                                        <td className="px-4 py-3 text-sm font-semibold text-gray-900 border-r border-gray-300">{sample.testValue}</td>
                                        <td className="px-4 py-3 text-sm text-gray-800">APHA 5220 D</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    ))}
                </div>

                {/* Footer / Signatures */}
                <div className="mt-12 pt-8 border-t border-gray-300">
                    <div className="grid grid-cols-2 gap-8 mb-6">
                        <div>
                            <p className="text-sm font-semibold text-gray-700 mb-3">Technical & Quality Manager</p>
                            <div className="border-b border-gray-400 w-48 mb-2"></div>
                            <p className="text-xs text-gray-600">{supervisorName}</p>
                        </div>
                        <div>
                            <p className="text-sm font-semibold text-gray-700 mb-3">Senior Analytical Chemist</p>
                            <div className="border-b border-gray-400 w-48 mb-2"></div>
                            <p className="text-xs text-gray-600">{supervisorSignature}</p>
                        </div>
                    </div>

                    <div className="flex justify-between items-center text-xs text-gray-600">
                        <p>Date: {new Date().toLocaleDateString('en-GB')}</p>
                        <p>Pg 01 of 01</p>
                    </div>
                </div>
            </div>
        </div>
    );
};
