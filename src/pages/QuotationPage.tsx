import React, { useState, useRef, useEffect } from 'react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Input } from '../components/ui/Input';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../components/ui/Table';
import { SignatureCanvas } from '../components/SignatureCanvas';
import { quotationService, requestService, type Quotation, type Request } from '../services';
import { mockParameters } from '../data/mockData';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export const QuotationPage: React.FC = () => {
    const [requests, setRequests] = useState<Request[]>([]);
    const [quotations, setQuotations] = useState<Quotation[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [selectedRequestId, setSelectedRequestId] = useState<string>('');
    const [signature, setSignature] = useState('');
    const [showPreview, setShowPreview] = useState(false);
    const [isCustomMode, setIsCustomMode] = useState(false);
    const quotationRef = useRef<HTMLDivElement>(null);

    // Load confirmed requests and quotations from backend
    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            setLoading(true);
            const [confirmedReqs, allQuotations] = await Promise.all([
                requestService.getByStatus('confirmed'),
                quotationService.getAll()
            ]);
            setRequests(confirmedReqs);
            setQuotations(allQuotations);
            setError('');
        } catch (err) {
            console.error('Failed to load data:', err);
            setError('Failed to load requests and quotations. Please try again.');
        } finally {
            setLoading(false);
        }
    };

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

    const selectedRequest = requests.find(req => req.id?.toString() === selectedRequestId);
    const existingQuotation = quotations.find(q => q.requestId?.toString() === selectedRequestId);

    const [parameters, setParameters] = useState<Array<{
        parameter: string;
        quantity: number;
        unitPrice: number;
        totalPrice: number;
    }>>(existingQuotation?.items || []);

    useEffect(() => {
        if (selectedRequest && !existingQuotation) {
            // Initialize parameters from selected request
            const initParams = selectedRequest.parameters.map(paramName => {
                const paramData = mockParameters.find(p => p.name === paramName);
                return {
                    parameter: paramName,
                    unitPrice: paramData?.defaultPrice || 0,
                    quantity: selectedRequest.numberOfSamples,
                    totalPrice: (paramData?.defaultPrice || 0) * selectedRequest.numberOfSamples,
                };
            });
            setParameters(initParams);
        } else if (existingQuotation) {
            setParameters(existingQuotation.items);
        }
    }, [selectedRequestId, selectedRequest, existingQuotation]);

    const handleParameterChange = (index: number, field: string, value: number) => {
        const updated = [...parameters];
        updated[index] = {
            ...updated[index],
            [field]: value,
            totalPrice: field === 'unitPrice' ? value * updated[index].quantity : updated[index].unitPrice * value,
        };
        setParameters(updated);
    };

    const handleAddParameter = () => {
        setParameters([...parameters, {
            parameter: '',
            unitPrice: 0,
            quantity: isCustomMode ? customQuotation.numberOfSamples : 1,
            totalPrice: 0,
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
            parameter: name,
            unitPrice: paramData?.defaultPrice || updated[index].unitPrice,
            totalPrice: (paramData?.defaultPrice || updated[index].unitPrice) * updated[index].quantity,
        };
        setParameters(updated);
    };

    const grandTotal = parameters.reduce((sum, param) => sum + param.totalPrice, 0);

    const handleSaveQuotation = async () => {
        try {
            if (isCustomMode) {
                // Validate custom quotation
                if (!customQuotation.customer || !customQuotation.contact || 
                    !customQuotation.email || parameters.length === 0) {
                    alert('Please fill all required fields and add at least one parameter');
                    return;
                }

                const tax = grandTotal * 0.1; // 10% tax
                const quotationData = {
                    customer: customQuotation.customer,
                    items: parameters,
                    subtotal: grandTotal,
                    tax: tax,
                    total: grandTotal + tax,
                    status: 'draft',
                    notes: `Sample Type: ${customQuotation.sampleType}, Samples: ${customQuotation.numberOfSamples}`,
                    preparedBy: 'Current User', // TODO: Get from auth context
                };

                await quotationService.create(quotationData);
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
                await loadData();
            } else {
                // From request mode
                if (!selectedRequest || !selectedRequest.id) return;

                const tax = grandTotal * 0.1; // 10% tax
                const quotationData = {
                    requestId: selectedRequest.id,
                    customer: selectedRequest.customer,
                    items: parameters,
                    subtotal: grandTotal,
                    tax: tax,
                    total: grandTotal + tax,
                    status: 'sent',
                    notes: selectedRequest.notes,
                    preparedBy: 'Current User', // TODO: Get from auth context
                };

                if (existingQuotation && existingQuotation.id) {
                    await quotationService.update(existingQuotation.id, quotationData);
                } else {
                    await quotationService.create(quotationData);
                }

                alert('Quotation saved successfully!');
                await loadData();
            }
        } catch (err) {
            console.error('Failed to save quotation:', err);
            alert('Failed to save quotation. Please try again.');
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
                                    {requests.map(req => (
                                        <option key={req.id} value={req.id}>
                                            Request #{req.requestId || req.id} - {req.customer} | {req.sampleType} | {req.parameters.slice(0, 3).join(', ')}{req.parameters.length > 3 ? ` +${req.parameters.length - 3} more` : ''}
                                        </option>
                                    ))}
                                </select>
                            </Card>

                            {selectedRequest && (
                                <Card className="mb-6">
                                    <h3 className="text-lg font-semibold text-gray-800 mb-4 pb-3 border-b">Request Details</h3>
                                    <div className="grid grid-cols-2 gap-4 text-sm">
                                        <div>
                                            <span className="font-medium text-gray-600">Customer:</span>
                                            <p className="text-gray-800 mt-1">{selectedRequest.customer}</p>
                                        </div>
                                        <div>
                                            <span className="font-medium text-gray-600">Contact:</span>
                                            <p className="text-gray-800 mt-1">{selectedRequest.contact}</p>
                                        </div>
                                        <div>
                                            <span className="font-medium text-gray-600">Email:</span>
                                            <p className="text-gray-800 mt-1">{selectedRequest.email}</p>
                                        </div>
                                        <div>
                                            <span className="font-medium text-gray-600">Sample Type:</span>
                                            <p className="text-gray-800 mt-1">{selectedRequest.sampleType}</p>
                                        </div>
                                        <div>
                                            <span className="font-medium text-gray-600">Number of Samples:</span>
                                            <p className="text-gray-800 mt-1">{selectedRequest.numberOfSamples}</p>
                                        </div>
                                        <div>
                                            <span className="font-medium text-gray-600">Priority:</span>
                                            <p className="text-gray-800 mt-1">
                                                <Badge status={selectedRequest.priority === 'Urgent' ? 'pending' : 'approved'}>
                                                    {selectedRequest.priority}
                                                </Badge>
                                            </p>
                                        </div>
                                        <div className="col-span-2">
                                            <span className="font-medium text-gray-600">Test Parameters:</span>
                                            <div className="flex flex-wrap gap-2 mt-2">
                                                {selectedRequest.parameters.map(param => (
                                                    <span key={param} className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs">
                                                        {param}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </Card>
                            )}
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
                                            <p className="font-medium">{selectedRequest.contact}</p>
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
                                                                value={param.parameter}
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
                                                            <span className="font-medium">{param.parameter}</span>
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
                                                    <td className="px-4 py-3 font-semibold text-primary-700">{param.totalPrice.toLocaleString()}</td>
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
                                            <td className="border-2 border-gray-900 px-4 py-3 text-sm font-medium">{param.parameter}</td>
                                            <td className="border-2 border-gray-900 px-4 py-3 text-sm text-center">{param.unitPrice.toLocaleString()}</td>
                                            <td className="border-2 border-gray-900 px-4 py-3 text-sm text-center">{param.quantity}</td>
                                            <td className="border-2 border-gray-900 px-4 py-3 text-sm text-right font-semibold">{param.totalPrice.toLocaleString()}</td>
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

            {/* Quotations History Table */}
            <Card className="mt-8">
                <h2 className="text-xl font-semibold text-gray-800 mb-6">Quotation History</h2>
                {loading ? (
                    <p className="text-gray-500 text-center py-8">Loading quotations...</p>
                ) : error ? (
                    <p className="text-red-500 text-center py-8">{error}</p>
                ) : quotations.length === 0 ? (
                    <p className="text-gray-500 text-center py-8">No quotations created yet.</p>
                ) : (
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Quotation ID</TableHead>
                                    <TableHead>Request ID</TableHead>
                                    <TableHead>Customer</TableHead>
                                    <TableHead>Items</TableHead>
                                    <TableHead>Total Amount</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Created Date</TableHead>
                                    <TableHead>Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {quotations.map((quotation) => {
                                    const relatedRequest = requests.find(r => r.id === quotation.requestId);
                                    return (
                                        <TableRow key={quotation.id}>
                                            <TableCell className="font-medium">
                                                {quotation.quotationId || `QT-${quotation.id}`}
                                            </TableCell>
                                            <TableCell>
                                                {relatedRequest?.requestId || quotation.requestId || 'Custom'}
                                            </TableCell>
                                            <TableCell>{quotation.customer}</TableCell>
                                            <TableCell>
                                                <div className="text-xs">
                                                    {quotation.items.slice(0, 2).map((item, idx) => (
                                                        <div key={idx}>{item.parameter}</div>
                                                    ))}
                                                    {quotation.items.length > 2 && (
                                                        <span className="text-gray-500">+{quotation.items.length - 2} more</span>
                                                    )}
                                                </div>
                                            </TableCell>
                                            <TableCell className="font-semibold">
                                                LKR {quotation.total.toLocaleString()}
                                            </TableCell>
                                            <TableCell>
                                                <Badge status={quotation.status === 'approved' ? 'approved' : 'pending'}>
                                                    {quotation.status}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                {quotation.createdAt ? new Date(quotation.createdAt).toLocaleDateString() : 'N/A'}
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex gap-2">
                                                    <Button
                                                        onClick={() => {
                                                            if (quotation.requestId) {
                                                                setSelectedRequestId(quotation.requestId.toString());
                                                            }
                                                            setParameters(quotation.items);
                                                            setShowPreview(true);
                                                        }}
                                                        className="text-xs px-3 py-1"
                                                    >
                                                        View
                                                    </Button>
                                                    <Button
                                                        onClick={async () => {
                                                            // Load quotation data
                                                            if (quotation.requestId) {
                                                                setSelectedRequestId(quotation.requestId.toString());
                                                            }
                                                            setParameters(quotation.items);
                                                            setShowPreview(true);
                                                            // Wait for preview to render
                                                            await new Promise(resolve => setTimeout(resolve, 500));
                                                            // Generate PDF
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
                                                            pdf.save(`Quotation_${quotation.quotationId || quotation.id}_${new Date().toISOString().split('T')[0]}.pdf`);
                                                            setShowPreview(false);
                                                        }}
                                                        className="text-xs px-3 py-1 bg-green-600 hover:bg-green-700"
                                                    >
                                                        Download
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    );
                                })}
                            </TableBody>
                        </Table>
                    </div>
                )}
            </Card>
        </div>
    );
};
