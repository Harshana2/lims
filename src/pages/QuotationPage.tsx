import React, { useState, useRef } from 'react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Input } from '../components/ui/Input';
import { SignatureCanvas } from '../components/SignatureCanvas';
import { useWorkflow } from '../context/WorkflowContext';
import { mockParameters } from '../data/mockData';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export const QuotationPage: React.FC = () => {
    const { getConfirmedRequests, quotations, createQuotation, updateQuotation } = useWorkflow();
    const [selectedRequestId, setSelectedRequestId] = useState<string>('');
    const [signature, setSignature] = useState('');
    const [showPreview, setShowPreview] = useState(false);
    const [isCustomMode, setIsCustomMode] = useState(false);
    const quotationRef = useRef<HTMLDivElement>(null);

    // Custom quotation state
    const [customQuotation, setCustomQuotation] = useState({
        customer: '',
        address: '',
        contact: '',
        email: '',
        sampleType: '',
        numberOfSamples: 1,
        samplingType: 'One Time',
        priority: 'Normal',
    });

    const confirmedRequests = getConfirmedRequests();
    const selectedRequest = confirmedRequests.find(req => req.id === selectedRequestId);
    const existingQuotation = quotations.find(q => q.requestId === selectedRequestId);

    const [parameters, setParameters] = useState<Array<{
        name: string;
        unitPrice: number;
        quantity: number;
        total: number;
    }>>(existingQuotation?.parameters || []);

    React.useEffect(() => {
        if (selectedRequest && !existingQuotation) {
            // Initialize parameters from selected request
            const initParams = selectedRequest.testParameters.map(paramName => {
                const paramData = mockParameters.find(p => p.name === paramName);
                return {
                    name: paramName,
                    unitPrice: paramData?.defaultPrice || 0,
                    quantity: selectedRequest.numberOfSamples,
                    total: (paramData?.defaultPrice || 0) * selectedRequest.numberOfSamples,
                };
            });
            setParameters(initParams);
        } else if (existingQuotation) {
            setParameters(existingQuotation.parameters);
            setSignature(existingQuotation.signature);
        }
    }, [selectedRequestId, selectedRequest, existingQuotation]);

    const handleParameterChange = (index: number, field: string, value: number) => {
        const updated = [...parameters];
        updated[index] = {
            ...updated[index],
            [field]: value,
            total: field === 'unitPrice' ? value * updated[index].quantity : updated[index].unitPrice * value,
        };
        setParameters(updated);
    };

    const handleAddParameter = () => {
        setParameters([...parameters, {
            name: '',
            unitPrice: 0,
            quantity: isCustomMode ? customQuotation.numberOfSamples : 1,
            total: 0,
        }]);
    };

    const handleRemoveParameter = (index: number) => {
        setParameters(parameters.filter((_, i) => i !== index));
    };

    const handleParameterNameChange = (index: number, name: string) => {
        const updated = [...parameters];
        const paramData = mockParameters.find(p => p.name === name);
        updated[index] = {
            ...updated[index],
            name,
            unitPrice: paramData?.defaultPrice || updated[index].unitPrice,
            total: (paramData?.defaultPrice || updated[index].unitPrice) * updated[index].quantity,
        };
        setParameters(updated);
    };

    const grandTotal = parameters.reduce((sum, param) => sum + param.total, 0);

    const handleSaveQuotation = () => {
        if (isCustomMode) {
            // Validate custom quotation
            if (!customQuotation.customer || !customQuotation.address || !customQuotation.contact || 
                !customQuotation.email || !customQuotation.sampleType || parameters.length === 0) {
                alert('Please fill all required fields and add at least one parameter');
                return;
            }

            const customId = `CUSTOM-${Date.now()}`;
            const quotationData = {
                requestId: customId,
                customer: customQuotation.customer,
                address: customQuotation.address,
                contact: customQuotation.contact,
                email: customQuotation.email,
                sampleType: customQuotation.sampleType,
                numberOfSamples: customQuotation.numberOfSamples,
                samplingType: customQuotation.samplingType,
                priority: customQuotation.priority,
                parameters,
                grandTotal,
                signature,
                approved: true,
            };

            createQuotation(quotationData);
            alert('Custom quotation saved successfully!');
            
            // Reset form
            setCustomQuotation({
                customer: '',
                address: '',
                contact: '',
                email: '',
                sampleType: '',
                numberOfSamples: 1,
                samplingType: 'One Time',
                priority: 'Normal',
            });
            setParameters([]);
            setSignature('');
        } else {
            // From request mode
            if (!selectedRequest) return;

            const quotationData = {
                requestId: selectedRequest.id,
                customer: selectedRequest.customer,
                address: selectedRequest.address,
                contact: selectedRequest.contact,
                email: selectedRequest.email,
                sampleType: selectedRequest.sampleType,
                numberOfSamples: selectedRequest.numberOfSamples,
                samplingType: selectedRequest.samplingType,
                priority: selectedRequest.priority,
                parameters,
                grandTotal,
                signature,
                approved: true,
            };

            if (existingQuotation) {
                updateQuotation(selectedRequest.id, quotationData);
            } else {
                createQuotation(quotationData);
            }

            alert('Quotation saved successfully!');
        }
    };

    const handleGeneratePDF = async () => {
        if (!quotationRef.current) return;

        const canvas = await html2canvas(quotationRef.current, {
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
        pdf.save(`Quotation_${selectedRequest?.id}_${new Date().toISOString().split('T')[0]}.pdf`);
    };

    const handlePreview = () => {
        if (!signature) {
            alert('Please add a signature first');
            return;
        }
        setShowPreview(true);
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold text-gray-800">Quotation Management</h1>
                {existingQuotation && !isCustomMode && (
                    <Badge status="approved">Quotation Created</Badge>
                )}
            </div>

            {/* Mode Toggle */}
            <Card className="mb-6">
                <div className="flex gap-4">
                    <Button
                        variant={!isCustomMode ? 'primary' : 'secondary'}
                        onClick={() => {
                            setIsCustomMode(false);
                            setParameters([]);
                            setSignature('');
                        }}
                    >
                        From Request
                    </Button>
                    <Button
                        variant={isCustomMode ? 'primary' : 'secondary'}
                        onClick={() => {
                            setIsCustomMode(true);
                            setSelectedRequestId('');
                            setParameters([]);
                            setSignature('');
                        }}
                    >
                        + Custom Quotation
                    </Button>
                </div>
            </Card>

            {!showPreview ? (
                <>
                    {!isCustomMode ? (
                        /* From Request Mode */
                        <>
                            <Card className="mb-6">
                                <label className="block text-sm font-medium text-gray-700 mb-2">Select Confirmed Request</label>
                                <select
                                    value={selectedRequestId}
                                    onChange={(e) => setSelectedRequestId(e.target.value)}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                                >
                                    <option value="">-- Select a Request --</option>
                                    {confirmedRequests.map(req => (
                                        <option key={req.id} value={req.id}>
                                            {req.id} - {req.customer} ({req.testParameters.join(', ')})
                                        </option>
                                    ))}
                                </select>
                            </Card>
                        </>
                    ) : (
                        /* Custom Quotation Mode */
                        <Card className="mb-6">
                            <h3 className="text-lg font-semibold text-gray-800 mb-4 pb-3 border-b">Customer Information</h3>
                            <div className="grid grid-cols-2 gap-4">
                                <Input
                                    label="Customer Name"
                                    value={customQuotation.customer}
                                    onChange={(e) => setCustomQuotation({ ...customQuotation, customer: e.target.value })}
                                    required
                                />
                                <Input
                                    label="Address"
                                    value={customQuotation.address}
                                    onChange={(e) => setCustomQuotation({ ...customQuotation, address: e.target.value })}
                                    required
                                />
                                <Input
                                    label="Contact Person"
                                    value={customQuotation.contact}
                                    onChange={(e) => setCustomQuotation({ ...customQuotation, contact: e.target.value })}
                                    required
                                />
                                <Input
                                    label="Email"
                                    type="email"
                                    value={customQuotation.email}
                                    onChange={(e) => setCustomQuotation({ ...customQuotation, email: e.target.value })}
                                    required
                                />
                                <Input
                                    label="Sample Type"
                                    value={customQuotation.sampleType}
                                    onChange={(e) => setCustomQuotation({ ...customQuotation, sampleType: e.target.value })}
                                    placeholder="e.g., Water, Soil, Food"
                                    required
                                />
                                <Input
                                    label="Number of Samples"
                                    type="number"
                                    value={customQuotation.numberOfSamples.toString()}
                                    onChange={(e) => setCustomQuotation({ ...customQuotation, numberOfSamples: parseInt(e.target.value) || 1 })}
                                    required
                                />
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Sampling Type</label>
                                    <select
                                        value={customQuotation.samplingType}
                                        onChange={(e) => setCustomQuotation({ ...customQuotation, samplingType: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                                    >
                                        <option>One Time</option>
                                        <option>Monthly</option>
                                        <option>Quarterly</option>
                                        <option>Annually</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Priority</label>
                                    <select
                                        value={customQuotation.priority}
                                        onChange={(e) => setCustomQuotation({ ...customQuotation, priority: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                                    >
                                        <option>Normal</option>
                                        <option>Urgent</option>
                                        <option>Rush</option>
                                    </select>
                                </div>
                            </div>
                        </Card>
                    )}

                    {(selectedRequest || isCustomMode) && (
                        <>
                            {!isCustomMode && selectedRequest && (
                                <Card className="mb-6">
                                    <h3 className="text-lg font-semibold text-gray-800 mb-4 pb-3 border-b">Customer Details</h3>
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
                                    </div>
                                </Card>
                            )}

                            <Card className="mb-6">
                                <div className="flex justify-between items-center mb-4 pb-3 border-b">
                                    <h3 className="text-lg font-semibold text-gray-800">Quotation Details (Editable)</h3>
                                    {isCustomMode && (
                                        <Button variant="secondary" onClick={handleAddParameter}>
                                            + Add Parameter
                                        </Button>
                                    )}
                                </div>

                                <div className="overflow-x-auto mb-6">
                                    <table className="w-full">
                                        <thead className="bg-gray-50">
                                            <tr>
                                                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Test Parameter</th>
                                                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Unit Price (LKR)</th>
                                                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Quantity</th>
                                                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Total (LKR)</th>
                                                {isCustomMode && <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Action</th>}
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {parameters.map((param, index) => (
                                                <tr key={index} className="border-t">
                                                    <td className="px-4 py-3">
                                                        {isCustomMode ? (
                                                            <select
                                                                value={param.name}
                                                                onChange={(e) => handleParameterNameChange(index, e.target.value)}
                                                                className="w-full px-3 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-primary-500"
                                                            >
                                                                <option value="">Select Parameter</option>
                                                                {customQuotation.sampleType 
                                                                    ? mockParameters
                                                                        .filter(p => p.sampleTypes.includes(customQuotation.sampleType))
                                                                        .map(p => (
                                                                            <option key={p.name} value={p.name}>{p.name}</option>
                                                                        ))
                                                                    : mockParameters.map(p => (
                                                                        <option key={p.name} value={p.name}>{p.name}</option>
                                                                    ))
                                                                }
                                                            </select>
                                                        ) : (
                                                            <span className="font-medium">{param.name}</span>
                                                        )}
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        <input
                                                            type="number"
                                                            value={param.unitPrice}
                                                            onChange={(e) => handleParameterChange(index, 'unitPrice', parseFloat(e.target.value) || 0)}
                                                            className="w-full px-3 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-primary-500"
                                                        />
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        <input
                                                            type="number"
                                                            value={param.quantity}
                                                            onChange={(e) => handleParameterChange(index, 'quantity', parseInt(e.target.value) || 0)}
                                                            className="w-full px-3 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-primary-500"
                                                        />
                                                    </td>
                                                    <td className="px-4 py-3 font-semibold text-primary-700">{param.total.toLocaleString()}</td>
                                                    {isCustomMode && (
                                                        <td className="px-4 py-3">
                                                            <button
                                                                onClick={() => handleRemoveParameter(index)}
                                                                className="text-red-600 hover:text-red-800 font-medium"
                                                            >
                                                                Remove
                                                            </button>
                                                        </td>
                                                    )}
                                                </tr>
                                            ))}
                                            <tr className="border-t-2 border-gray-400 bg-primary-50">
                                                <td colSpan={3} className="px-4 py-3 text-right text-base font-bold text-gray-800">GRAND TOTAL:</td>
                                                <td className="px-4 py-3 text-lg font-bold text-primary-700">{grandTotal.toLocaleString()} LKR</td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>

                                <div className="mb-6">
                                    <h4 className="text-sm font-medium text-gray-700 mb-3">E-Signature</h4>
                                    <SignatureCanvas
                                        onSave={setSignature}
                                        savedSignature={signature}
                                    />
                                </div>

                                <div className="flex justify-end gap-3">
                                    <Button variant="secondary" onClick={handleSaveQuotation}>
                                        {existingQuotation ? 'Update Quotation' : 'Save Quotation'}
                                    </Button>
                                    <Button onClick={handlePreview} disabled={!signature}>
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

                    {/* Professional Quotation Template - Based on Lab Standards */}
                    <div ref={quotationRef} className="bg-white p-12 shadow-lg mx-auto" style={{ width: '210mm', minHeight: '297mm' }}>
                        {/* Header with Logo */}
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
                            <h2 className="text-2xl font-bold text-blue-900 uppercase tracking-wider">QUOTATION</h2>
                        </div>

                        {/* Quotation Info */}
                        <div className="grid grid-cols-2 gap-8 mb-8">
                            <div>
                                <h3 className="text-sm font-bold text-gray-800 mb-3 uppercase border-b border-gray-400 pb-1">To:</h3>
                                <div className="ml-2 space-y-1">
                                    <p className="font-bold text-gray-900">
                                        {isCustomMode ? customQuotation.customer : selectedRequest?.customer}
                                    </p>
                                    <p className="text-sm text-gray-700">
                                        {isCustomMode ? customQuotation.address : selectedRequest?.address}
                                    </p>
                                    <p className="text-sm text-gray-700 mt-3">
                                        <span className="font-semibold">Attention:</span> {isCustomMode ? customQuotation.contact : selectedRequest?.contact}
                                    </p>
                                    <p className="text-sm text-gray-700">
                                        <span className="font-semibold">Email:</span> {isCustomMode ? customQuotation.email : selectedRequest?.email}
                                    </p>
                                </div>
                            </div>
                            <div>
                                <div className="space-y-3 text-sm">
                                    <div className="flex">
                                        <span className="font-bold text-gray-800 w-32">Quotation No:</span>
                                        <span className="text-gray-900">
                                            {isCustomMode ? `CUSTOM-${Date.now()}` : selectedRequest?.id}
                                        </span>
                                    </div>
                                    <div className="flex">
                                        <span className="font-bold text-gray-800 w-32">Date:</span>
                                        <span className="text-gray-900">{new Date().toLocaleDateString('en-GB')}</span>
                                    </div>
                                    <div className="flex">
                                        <span className="font-bold text-gray-800 w-32">Valid Until:</span>
                                        <span className="text-gray-900">
                                            {new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString('en-GB')}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Introduction */}
                        <div className="mb-6">
                            <p className="text-sm text-gray-700">
                                We are pleased to submit our quotation for the testing services as requested. Please find the details below:
                            </p>
                        </div>

                        {/* Quotation Table */}
                        <div className="mb-8">
                            <table className="w-full border-2 border-gray-900">
                                <thead>
                                    <tr className="bg-blue-100">
                                        <th className="border-2 border-gray-900 px-4 py-3 text-left text-sm font-bold text-gray-900">No.</th>
                                        <th className="border-2 border-gray-900 px-4 py-3 text-left text-sm font-bold text-gray-900">Test Parameter</th>
                                        <th className="border-2 border-gray-900 px-4 py-3 text-center text-sm font-bold text-gray-900">Unit Price<br />(LKR)</th>
                                        <th className="border-2 border-gray-900 px-4 py-3 text-center text-sm font-bold text-gray-900">Quantity</th>
                                        <th className="border-2 border-gray-900 px-4 py-3 text-right text-sm font-bold text-gray-900">Total<br />(LKR)</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {parameters.map((param, index) => (
                                        <tr key={index} className="hover:bg-gray-50">
                                            <td className="border-2 border-gray-900 px-4 py-3 text-sm text-center">{index + 1}</td>
                                            <td className="border-2 border-gray-900 px-4 py-3 text-sm font-medium">{param.name}</td>
                                            <td className="border-2 border-gray-900 px-4 py-3 text-sm text-center">{param.unitPrice.toLocaleString()}</td>
                                            <td className="border-2 border-gray-900 px-4 py-3 text-sm text-center">{param.quantity}</td>
                                            <td className="border-2 border-gray-900 px-4 py-3 text-sm text-right font-semibold">{param.total.toLocaleString()}</td>
                                        </tr>
                                    ))}
                                    <tr className="bg-blue-100">
                                        <td colSpan={4} className="border-2 border-gray-900 px-4 py-3 text-right font-bold text-gray-900 uppercase">Grand Total:</td>
                                        <td className="border-2 border-gray-900 px-4 py-3 text-right font-bold text-lg text-gray-900">{grandTotal.toLocaleString()}</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>

                        {/* Terms & Conditions */}
                        <div className="mb-8 border border-gray-400 p-4 bg-gray-50">
                            <h3 className="text-sm font-bold text-gray-800 mb-3 uppercase">Terms & Conditions:</h3>
                            <ul className="list-disc ml-6 text-sm text-gray-700 space-y-1.5">
                                <li><span className="font-semibold">Payment Terms:</span> 50% advance payment, balance upon report delivery</li>
                                <li><span className="font-semibold">Validity:</span> This quotation is valid for 30 days from the date of issue</li>
                                <li><span className="font-semibold">Lead Time:</span> 7-10 working days from date of sample receipt</li>
                                <li><span className="font-semibold">Currency:</span> All prices are in Sri Lankan Rupees (LKR)</li>
                                <li><span className="font-semibold">Samples:</span> Samples should be delivered to our laboratory with proper labeling</li>
                                <li>Prices are subject to change without prior notice</li>
                                <li>Sample disposal will be carried out as per laboratory policy</li>
                            </ul>
                        </div>

                        {/* Footer / Signature */}
                        <div className="mt-12 pt-6 border-t-2 border-gray-900">
                            <div className="mb-8">
                                <p className="text-sm text-gray-700 mb-4">
                                    We thank you for considering our services and look forward to serving you.
                                </p>
                                <p className="text-sm font-semibold text-gray-900">
                                    For any clarifications, please contact us at the above mentioned details.
                                </p>
                            </div>

                            <div className="flex justify-between items-end">
                                <div className="w-64">
                                    <p className="text-sm font-bold text-gray-900 mb-4">Authorized Signature:</p>
                                    {signature && (
                                        <div className="mb-2">
                                            <img src={signature} alt="Signature" className="h-16 w-auto" />
                                        </div>
                                    )}
                                    <div className="border-t-2 border-gray-900 pt-2">
                                        <p className="text-sm text-gray-700">Manager - Commercial Division</p>
                                        <p className="text-xs text-gray-600 mt-1">Date: {new Date().toLocaleDateString('en-GB')}</p>
                                    </div>
                                </div>
                                <div className="text-right text-xs text-gray-600">
                                    <p>Page 1 of 1</p>
                                    <p className="mt-1">Ref: QT-{new Date().getFullYear()}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};
