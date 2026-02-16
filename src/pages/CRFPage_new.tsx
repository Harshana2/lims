import React, { useState, useRef } from 'react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Input } from '../components/ui/Input';
import { SignatureCanvas } from '../components/SignatureCanvas';
import { useWorkflow } from '../context/WorkflowContext';
import { mockSamples } from '../data/mockData';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export const CRFPage: React.FC = () => {
    const { getConfirmedRequests, quotations, crf, crfStatus, saveCRF } = useWorkflow();
    const [selectedRequestId, setSelectedRequestId] = useState('');
    const [receptionDate, setReceptionDate] = useState(new Date().toISOString().slice(0, 16));
    const [receivedBy, setReceivedBy] = useState('');
    const [signature, setSignature] = useState('');
    const [showPreview, setShowPreview] = useState(false);
    const crfRef = useRef<HTMLDivElement>(null);

    const confirmedRequests = getConfirmedRequests();
    const approvedQuotations = quotations.filter(q => q.approved);
    
    const selectedRequest = confirmedRequests.find(req => req.id === selectedRequestId);
    const selectedQuotation = approvedQuotations.find(q => q.requestId === selectedRequestId);

    const handleSaveCRF = () => {
        if (!signature || !receivedBy) {
            alert('Please add received by name and signature');
            return;
        }

        saveCRF({
            receptionDate,
            signature,
            approved: true,
        });

        alert('CRF saved successfully!');
    };

    const handleGeneratePDF = async () => {
        if (!crfRef.current) return;

        const canvas = await html2canvas(crfRef.current, {
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
        pdf.save(`CRF_${selectedRequest?.id}_${new Date().toISOString().split('T')[0]}.pdf`);
    };

    const handlePreview = () => {
        if (!signature || !receivedBy) {
            alert('Please add received by name and signature first');
            return;
        }
        setShowPreview(true);
    };

    const requestsWithQuotations = confirmedRequests.filter(req => 
        approvedQuotations.some(q => q.requestId === req.id)
    );

    if (requestsWithQuotations.length === 0) {
        return (
            <div>
                <h1 className="text-3xl font-bold text-gray-800 mb-8">Customer Request Form (CRF)</h1>
                <Card>
                    <p className="text-gray-500">No requests with approved quotations available. Please create and approve a quotation first.</p>
                </Card>
            </div>
        );
    }

    return (
        <div>
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold text-gray-800">Customer Request Form (CRF)</h1>
                {crfStatus === 'CRF Approved' && (
                    <Badge status="approved">CRF Approved</Badge>
                )}
            </div>

            {!showPreview ? (
                <>
                    <Card className="mb-6">
                        <label className="block text-sm font-medium text-gray-700 mb-2">Select Request</label>
                        <select
                            value={selectedRequestId}
                            onChange={(e) => setSelectedRequestId(e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                        >
                            <option value="">-- Select a Request --</option>
                            {requestsWithQuotations.map(req => (
                                <option key={req.id} value={req.id}>
                                    {req.id} - {req.customer}
                                </option>
                            ))}
                        </select>
                    </Card>

                    {selectedRequest && selectedQuotation && (
                        <>
                            <Card className="mb-6">
                                <h3 className="text-lg font-semibold text-gray-800 mb-4 pb-3 border-b">Customer Information</h3>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <p className="text-sm text-gray-600">Customer Name</p>
                                        <p className="font-medium">{selectedRequest.customer}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-600">Address</p>
                                        <p className="font-medium">{selectedRequest.address}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-600">Contact Person</p>
                                        <p className="font-medium">{selectedRequest.contact}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-600">Email</p>
                                        <p className="font-medium">{selectedRequest.email}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-600">Sample Type</p>
                                        <p className="font-medium">{selectedRequest.sampleType}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-600">Number of Samples</p>
                                        <p className="font-medium">{selectedRequest.numberOfSamples}</p>
                                    </div>
                                </div>
                            </Card>

                            <Card className="mb-6">
                                <h3 className="text-lg font-semibold text-gray-800 mb-4 pb-3 border-b">Test Parameters</h3>
                                <div className="space-y-2">
                                    {selectedQuotation.parameters.map((param, index) => (
                                        <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded">
                                            <span className="font-medium">{param.name}</span>
                                            <span className="text-sm text-gray-600">Quantity: {param.quantity}</span>
                                        </div>
                                    ))}
                                </div>
                            </Card>

                            <Card className="mb-6">
                                <h3 className="text-lg font-semibold text-gray-800 mb-4 pb-3 border-b">Reception Details</h3>
                                
                                <div className="grid grid-cols-2 gap-6 mb-6">
                                    <Input
                                        label="Reception Date & Time"
                                        type="datetime-local"
                                        value={receptionDate}
                                        onChange={(e) => setReceptionDate(e.target.value)}
                                        disabled={crfStatus === 'CRF Approved'}
                                    />
                                    <Input
                                        label="Received By"
                                        value={receivedBy}
                                        onChange={(e) => setReceivedBy(e.target.value)}
                                        placeholder="Enter your name"
                                        disabled={crfStatus === 'CRF Approved'}
                                    />
                                </div>

                                <div className="mb-6">
                                    <p className="text-sm text-gray-600 mb-2">Sampling Type</p>
                                    <p className="font-medium">{selectedRequest.samplingType}</p>
                                </div>

                                <div className="mb-6">
                                    <h4 className="text-sm font-medium text-gray-700 mb-3">E-Signature</h4>
                                    <SignatureCanvas
                                        onSave={setSignature}
                                        savedSignature={signature}
                                    />
                                </div>

                                <div className="flex justify-end gap-3">
                                    <Button variant="secondary" onClick={handleSaveCRF} disabled={crfStatus === 'CRF Approved'}>
                                        {crfStatus === 'CRF Approved' ? 'CRF Saved' : 'Save CRF'}
                                    </Button>
                                    <Button onClick={handlePreview} disabled={!signature || !receivedBy}>
                                        Preview & Generate PDF
                                    </Button>
                                </div>
                            </Card>
                        </>
                    )}
                </>
            ) : (
                <>
                    <div className="flex justify-end gap-3 mb-6">
                        <Button variant="secondary" onClick={() => setShowPreview(false)}>
                            Back to Edit
                        </Button>
                        <Button onClick={handleGeneratePDF}>
                            Download PDF
                        </Button>
                    </div>

                    {/* Professional CRF Template */}
                    <div ref={crfRef} className="bg-white p-12 shadow-lg mx-auto" style={{ width: '210mm', minHeight: '297mm' }}>
                        {/* Header */}
                        <div className="border-b-4 border-blue-900 pb-6 mb-8">
                            <div className="flex justify-between items-start">
                                <div>
                                    <h1 className="text-3xl font-bold text-blue-900 mb-3">LINDEL INDUSTRIAL LABORATORIES LTD</h1>
                                    <div className="text-sm text-gray-700 space-y-1">
                                        <p>No. 123, Laboratory Road, Colombo 05, Sri Lanka</p>
                                        <p>Tel: +94 11 234 5678 | Fax: +94 11 234 5679</p>
                                        <p>Email: info@lindellabs.lk | Web: www.lindellabs.lk</p>
                                        <p className="font-semibold mt-2">ISO/IEC 17025:2017 Accredited Laboratory</p>
                                    </div>
                                </div>
                                <div className="w-28 h-28 bg-blue-100 border-2 border-blue-900 rounded flex items-center justify-center">
                                    <span className="text-sm text-gray-600 font-semibold">LOGO</span>
                                </div>
                            </div>
                        </div>

                        {/* Document Title */}
                        <div className="text-center mb-8 bg-blue-50 py-4 border-t-2 border-b-2 border-blue-900">
                            <h2 className="text-2xl font-bold text-blue-900 uppercase tracking-wider">CUSTOMER REQUEST FORM</h2>
                            <p className="text-sm text-gray-700 mt-2">Sample Reception & Testing Request</p>
                        </div>

                        {/* Form Reference */}
                        <div className="grid grid-cols-2 gap-8 mb-8 text-sm">
                            <div className="flex">
                                <span className="font-bold text-gray-800 w-32">Form No:</span>
                                <span className="text-gray-900">QF-LAB-001</span>
                            </div>
                            <div className="flex">
                                <span className="font-bold text-gray-800 w-32">Request ID:</span>
                                <span className="text-gray-900">{selectedRequest?.id}</span>
                            </div>
                            <div className="flex">
                                <span className="font-bold text-gray-800 w-32">Date:</span>
                                <span className="text-gray-900">{new Date(receptionDate).toLocaleDateString('en-GB')}</span>
                            </div>
                            <div className="flex">
                                <span className="font-bold text-gray-800 w-32">Time:</span>
                                <span className="text-gray-900">{new Date(receptionDate).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}</span>
                            </div>
                        </div>

                        {/* Customer Details Section */}
                        <div className="mb-8 border-2 border-gray-800 p-4">
                            <h3 className="text-sm font-bold text-gray-900 mb-4 uppercase bg-blue-100 px-2 py-2 -mx-4 -mt-4">Section A: Customer Details</h3>
                            <table className="w-full text-sm">
                                <tbody>
                                    <tr className="border-b border-gray-400">
                                        <td className="py-2 font-semibold text-gray-800 w-40">Customer Name:</td>
                                        <td className="py-2 text-gray-900">{selectedRequest?.customer}</td>
                                    </tr>
                                    <tr className="border-b border-gray-400">
                                        <td className="py-2 font-semibold text-gray-800">Address:</td>
                                        <td className="py-2 text-gray-900">{selectedRequest?.address}</td>
                                    </tr>
                                    <tr className="border-b border-gray-400">
                                        <td className="py-2 font-semibold text-gray-800">Contact Person:</td>
                                        <td className="py-2 text-gray-900">{selectedRequest?.contact}</td>
                                    </tr>
                                    <tr className="border-b border-gray-400">
                                        <td className="py-2 font-semibold text-gray-800">Email:</td>
                                        <td className="py-2 text-gray-900">{selectedRequest?.email}</td>
                                    </tr>
                                    <tr>
                                        <td className="py-2 font-semibold text-gray-800">Quotation Ref:</td>
                                        <td className="py-2 text-gray-900">{selectedRequest?.id}</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>

                        {/* Sample Details Section */}
                        <div className="mb-8 border-2 border-gray-800 p-4">
                            <h3 className="text-sm font-bold text-gray-900 mb-4 uppercase bg-blue-100 px-2 py-2 -mx-4 -mt-4">Section B: Sample Details</h3>
                            <table className="w-full text-sm mb-4">
                                <tbody>
                                    <tr className="border-b border-gray-400">
                                        <td className="py-2 font-semibold text-gray-800 w-40">Sample Type:</td>
                                        <td className="py-2 text-gray-900">{selectedRequest?.sampleType}</td>
                                    </tr>
                                    <tr className="border-b border-gray-400">
                                        <td className="py-2 font-semibold text-gray-800">Number of Samples:</td>
                                        <td className="py-2 text-gray-900">{selectedRequest?.numberOfSamples}</td>
                                    </tr>
                                    <tr>
                                        <td className="py-2 font-semibold text-gray-800">Sampling Type:</td>
                                        <td className="py-2 text-gray-900">{selectedRequest?.samplingType}</td>
                                    </tr>
                                </tbody>
                            </table>

                            <h4 className="text-sm font-semibold text-gray-800 mb-3 mt-4">Sample References:</h4>
                            <table className="w-full border border-gray-800">
                                <thead>
                                    <tr className="bg-blue-50">
                                        <th className="border border-gray-800 px-3 py-2 text-left text-sm font-bold">Sample Ref</th>
                                        <th className="border border-gray-800 px-3 py-2 text-left text-sm font-bold">Description</th>
                                        <th className="border border-gray-800 px-3 py-2 text-left text-sm font-bold">Submission Detail</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {mockSamples.slice(0, selectedRequest?.numberOfSamples).map((sample) => (
                                        <tr key={sample.ref}>
                                            <td className="border border-gray-800 px-3 py-2 text-sm font-medium">{sample.ref}</td>
                                            <td className="border border-gray-800 px-3 py-2 text-sm">{sample.description}</td>
                                            <td className="border border-gray-800 px-3 py-2 text-sm">{sample.submissionDetail}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Test Parameters Section */}
                        <div className="mb-8 border-2 border-gray-800 p-4">
                            <h3 className="text-sm font-bold text-gray-900 mb-4 uppercase bg-blue-100 px-2 py-2 -mx-4 -mt-4">Section C: Test Parameters Requested</h3>
                            <table className="w-full border border-gray-800">
                                <thead>
                                    <tr className="bg-blue-50">
                                        <th className="border border-gray-800 px-3 py-2 text-left text-sm font-bold">No.</th>
                                        <th className="border border-gray-800 px-3 py-2 text-left text-sm font-bold">Test Parameter</th>
                                        <th className="border border-gray-800 px-3 py-2 text-center text-sm font-bold">Quantity</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {selectedQuotation?.parameters.map((param, index) => (
                                        <tr key={index}>
                                            <td className="border border-gray-800 px-3 py-2 text-sm text-center">{index + 1}</td>
                                            <td className="border border-gray-800 px-3 py-2 text-sm font-medium">{param.name}</td>
                                            <td className="border border-gray-800 px-3 py-2 text-sm text-center">{param.quantity}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Sample Condition & Remarks */}
                        <div className="mb-8 border-2 border-gray-800 p-4">
                            <h3 className="text-sm font-bold text-gray-900 mb-4 uppercase bg-blue-100 px-2 py-2 -mx-4 -mt-4">Section D: Sample Condition & Special Instructions</h3>
                            <div className="space-y-3 text-sm">
                                <div className="flex items-center gap-4">
                                    <span className="font-semibold text-gray-800">Sample Condition:</span>
                                    <label className="flex items-center gap-2">
                                        <input type="checkbox" checked readOnly className="w-4 h-4" />
                                        <span>Good</span>
                                    </label>
                                    <label className="flex items-center gap-2">
                                        <input type="checkbox" className="w-4 h-4" />
                                        <span>Damaged</span>
                                    </label>
                                </div>
                                <div>
                                    <span className="font-semibold text-gray-800">Special Instructions / Remarks:</span>
                                    <div className="border border-gray-400 p-3 mt-2 min-h-20 bg-gray-50">
                                        <p className="text-sm text-gray-700">Handle with care. Refrigerate if required.</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Signatures */}
                        <div className="mt-12 pt-6 border-t-2 border-gray-900">
                            <div className="grid grid-cols-2 gap-8">
                                <div>
                                    <p className="text-sm font-bold text-gray-900 mb-4">Received By (Laboratory):</p>
                                    {signature && (
                                        <div className="mb-2">
                                            <img src={signature} alt="Signature" className="h-16 w-auto border-b-2 border-gray-900" />
                                        </div>
                                    )}
                                    <div className="border-t-2 border-gray-900 pt-2 mt-2">
                                        <p className="text-sm text-gray-900 font-medium">{receivedBy}</p>
                                        <p className="text-xs text-gray-600 mt-1">Sample Reception Officer</p>
                                        <p className="text-xs text-gray-600">Date: {new Date(receptionDate).toLocaleDateString('en-GB')}</p>
                                    </div>
                                </div>
                                <div>
                                    <p className="text-sm font-bold text-gray-900 mb-4">Submitted By (Customer):</p>
                                    <div className="border-b-2 border-gray-900 h-16 mb-2"></div>
                                    <div className="border-t-2 border-gray-900 pt-2 mt-2">
                                        <p className="text-sm text-gray-900 font-medium">{selectedRequest?.contact}</p>
                                        <p className="text-xs text-gray-600 mt-1">{selectedRequest?.customer}</p>
                                        <p className="text-xs text-gray-600">Date: {new Date().toLocaleDateString('en-GB')}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="mt-8 pt-4 border-t border-gray-400 text-center text-xs text-gray-600">
                            <p>This is a computer generated form. For internal laboratory use only.</p>
                            <p className="mt-1">Page 1 of 1 | Form Ref: QF-LAB-001-Rev02</p>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};
