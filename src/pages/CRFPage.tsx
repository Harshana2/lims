import React, { useState, useRef } from 'react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { SignatureCanvas } from '../components/SignatureCanvas';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../components/ui/Table';
import { useWorkflow } from '../context/WorkflowContext';
import { mockCustomers, sampleTypes, sampleTypeConfigs, priorities } from '../data/mockData';
import { Edit, Eye, Camera, Plus } from 'lucide-react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export const CRFPage: React.FC = () => {
    const { crfs, addCRF, updateCRF, updateCRFStatus, quotations } = useWorkflow();
    const [showForm, setShowForm] = useState(false);
    const [editingCRF, setEditingCRF] = useState<string | null>(null);
    const [showPreview, setShowPreview] = useState(false);
    const [previewCRFId, setPreviewCRFId] = useState<string | null>(null);
    const [showCamera, setShowCamera] = useState(false);
    const crfRef = useRef<HTMLDivElement>(null);
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const streamRef = useRef<MediaStream | null>(null);

    const [formData, setFormData] = useState({
        crfType: 'CS' as 'CS' | 'LS',
        customer: '',
        address: '',
        contact: '',
        email: '',
        sampleType: '',
        testParameters: [] as string[],
        availableParameters: [] as string[], // Parameters based on sample type
        numberOfSamples: 1,
        receptionDate: new Date().toISOString().slice(0, 16),
        receivedBy: '',
        signature: '',
        date: new Date().toISOString().split('T')[0],
        priority: 'Normal',
        quotationRef: '',
        sampleImages: [] as string[], // Array of base64 images
    });

    const handleSampleTypeChange = (sampleType: string) => {
        // Load parameters for the selected sample type
        const config = sampleTypeConfigs.find(c => c.name === sampleType);
        const availableParams = config ? config.parameters : [];
        
        setFormData(prev => ({
            ...prev,
            sampleType,
            availableParameters: availableParams,
            testParameters: [] // Reset selected parameters when sample type changes
        }));
    };

    const handleQuotationChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const quotationId = e.target.value;
        if (!quotationId) {
            setFormData(prev => ({ ...prev, quotationRef: '' }));
            return;
        }

        const quotation = quotations.find(q => q.requestId === quotationId);
        if (quotation) {
            // Get available parameters for the sample type
            const sampleType = quotation.sampleType || formData.sampleType;
            const config = sampleTypeConfigs.find(c => c.name === sampleType);
            const availableParams = config ? config.parameters : [];

            // Auto-fill form with quotation data
            setFormData({
                ...formData,
                quotationRef: quotationId,
                customer: quotation.customer,
                address: quotation.address,
                contact: quotation.contact,
                email: quotation.email,
                testParameters: quotation.parameters.map(p => p.name),
                sampleType: sampleType,
                availableParameters: availableParams,
                numberOfSamples: quotation.numberOfSamples || formData.numberOfSamples,
                priority: quotation.priority || formData.priority,
            });
        }
    };

    const handleCustomerChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const customerId = e.target.value;
        const customer = mockCustomers.find(c => c.id === customerId);
        if (customer) {
            setFormData({
                ...formData,
                customer: customer.name,
                address: customer.address,
                contact: customer.contact,
                email: customer.email,
            });
        }
    };

    const handleParameterToggle = (paramName: string) => {
        setFormData(prev => ({
            ...prev,
            testParameters: prev.testParameters.includes(paramName)
                ? prev.testParameters.filter(p => p !== paramName)
                : [...prev.testParameters, paramName]
        }));
    };

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files || files.length === 0) return;

        const newImages: string[] = [];
        const fileReaders: Promise<string>[] = [];

        Array.from(files).forEach(file => {
            const promise = new Promise<string>((resolve, reject) => {
                const reader = new FileReader();
                reader.onloadend = () => resolve(reader.result as string);
                reader.onerror = reject;
                reader.readAsDataURL(file);
            });
            fileReaders.push(promise);
        });

        Promise.all(fileReaders).then(results => {
            setFormData(prev => ({
                ...prev,
                sampleImages: [...prev.sampleImages, ...results]
            }));
        }).catch(error => {
            console.error('Error reading files:', error);
            alert('Error uploading images');
        });
    };

    const handleRemoveImage = (index: number) => {
        setFormData(prev => ({
            ...prev,
            sampleImages: prev.sampleImages.filter((_, i) => i !== index)
        }));
    };

    const startCamera = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ 
                video: { facingMode: 'environment' } // Use back camera on mobile
            });
            if (videoRef.current) {
                videoRef.current.srcObject = stream;
                streamRef.current = stream;
                setShowCamera(true);
            }
        } catch (error) {
            console.error('Error accessing camera:', error);
            alert('Unable to access camera. Please check permissions.');
        }
    };

    const stopCamera = () => {
        if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => track.stop());
            streamRef.current = null;
        }
        setShowCamera(false);
    };

    const capturePhoto = () => {
        if (videoRef.current && canvasRef.current) {
            const video = videoRef.current;
            const canvas = canvasRef.current;
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            const ctx = canvas.getContext('2d');
            if (ctx) {
                ctx.drawImage(video, 0, 0);
                const imageData = canvas.toDataURL('image/jpeg');
                setFormData(prev => ({
                    ...prev,
                    sampleImages: [...prev.sampleImages, imageData]
                }));
                stopCamera();
            }
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!formData.signature || !formData.receivedBy) {
            alert('Please add received by name and signature');
            return;
        }

        const crfData = {
            ...formData,
            samplingType: 'One Time' // Default value since we removed the field
        };

        if (editingCRF) {
            updateCRF(editingCRF, crfData);
            alert('CRF updated successfully!');
        } else {
            addCRF(crfData);
            alert('CRF created successfully!');
        }

        // Reset form
        resetForm();
    };

    const resetForm = () => {
        setFormData({
            crfType: 'CS',
            customer: '',
            address: '',
            contact: '',
            email: '',
            sampleType: '',
            testParameters: [],
            availableParameters: [],
            numberOfSamples: 1,
            receptionDate: new Date().toISOString().slice(0, 16),
            receivedBy: '',
            signature: '',
            date: new Date().toISOString().split('T')[0],
            priority: 'Normal',
            quotationRef: '',
            sampleImages: [],
        });
        setShowForm(false);
        setEditingCRF(null);
    };

    const handleEdit = (crf: any) => {
        const config = sampleTypeConfigs.find(c => c.name === crf.sampleType);
        const availableParams = config ? config.parameters : [];

        setFormData({
            crfType: crf.crfType,
            customer: crf.customer,
            address: crf.address,
            contact: crf.contact,
            email: crf.email,
            sampleType: crf.sampleType,
            testParameters: crf.testParameters,
            availableParameters: availableParams,
            numberOfSamples: crf.numberOfSamples,
            receptionDate: crf.receptionDate,
            receivedBy: crf.receivedBy,
            signature: crf.signature,
            date: crf.date,
            priority: crf.priority,
            quotationRef: crf.quotationRef || '',
            sampleImages: crf.sampleImages || [],
        });
        setEditingCRF(crf.id);
        setShowForm(true);
    };

    const handleStatusChange = (crfId: string, newStatus: any) => {
        updateCRFStatus(crfId, newStatus);
    };

    const handlePreview = (crfId: string) => {
        setPreviewCRFId(crfId);
        setShowPreview(true);
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

        // If content is taller than one page, add multiple pages
        if (pdfHeight > pdf.internal.pageSize.getHeight()) {
            const pageHeight = pdf.internal.pageSize.getHeight();
            let heightLeft = pdfHeight;
            let position = 0;

            pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, pdfHeight);
            heightLeft -= pageHeight;

            while (heightLeft > 0) {
                position = heightLeft - pdfHeight;
                pdf.addPage();
                pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, pdfHeight);
                heightLeft -= pageHeight;
            }
        } else {
            pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
        }

        const selectedCRF = crfs.find(c => c.id === previewCRFId);
        pdf.save(`CRF_${selectedCRF?.id}_${new Date().toISOString().split('T')[0]}.pdf`);
    };

    const getStatusBadge = (status: string) => {
        const statusMap: any = {
            draft: { label: 'Draft', class: 'bg-gray-100 text-gray-700' },
            submitted: { label: 'Submitted', class: 'bg-blue-100 text-blue-700' },
            assigned: { label: 'Assigned', class: 'bg-purple-100 text-purple-700' },
            testing: { label: 'Testing', class: 'bg-yellow-100 text-yellow-700' },
            review: { label: 'Review', class: 'bg-orange-100 text-orange-700' },
            approved: { label: 'Approved', class: 'bg-green-100 text-green-700' },
            completed: { label: 'Completed', class: 'bg-green-200 text-green-900' },
        };
        const config = statusMap[status] || statusMap.draft;
        return <span className={`px-3 py-1 rounded text-sm font-medium ${config.class}`}>{config.label}</span>;
    };

    const selectedCRF = crfs.find(c => c.id === previewCRFId);

    if (showPreview && selectedCRF) {
        return (
            <div>
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-3xl font-bold text-gray-800">CRF Preview</h1>
                    <div className="flex gap-3">
                        <Button variant="secondary" onClick={() => setShowPreview(false)}>
                            Back to List
                        </Button>
                        <Button onClick={handleGeneratePDF}>
                            Download PDF
                        </Button>
                    </div>
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
                        <p className="text-sm text-gray-700 mt-2">Sample Reception & Testing Request - {selectedCRF.crfType} Type</p>
                    </div>

                    {/* Form Reference */}
                    <div className="grid grid-cols-2 gap-8 mb-8 text-sm">
                        <div className="flex">
                            <span className="font-bold text-gray-800 w-32">CRF ID:</span>
                            <span className="text-gray-900">{selectedCRF.id}</span>
                        </div>
                        <div className="flex">
                            <span className="font-bold text-gray-800 w-32">CRF Type:</span>
                            <span className="text-gray-900 font-semibold">{selectedCRF.crfType === 'CS' ? 'Customer Sample' : 'Lab Sample'}</span>
                        </div>
                        <div className="flex">
                            <span className="font-bold text-gray-800 w-32">Date:</span>
                            <span className="text-gray-900">{new Date(selectedCRF.receptionDate).toLocaleDateString('en-GB')}</span>
                        </div>
                        <div className="flex">
                            <span className="font-bold text-gray-800 w-32">Time:</span>
                            <span className="text-gray-900">{new Date(selectedCRF.receptionDate).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}</span>
                        </div>
                        {selectedCRF.quotationRef && (
                            <div className="flex col-span-2">
                                <span className="font-bold text-gray-800 w-32">Quotation Ref:</span>
                                <span className="text-gray-900">{selectedCRF.quotationRef}</span>
                            </div>
                        )}
                    </div>

                    {/* Customer Details Section */}
                    <div className="mb-8 border-2 border-gray-800 p-4">
                        <h3 className="text-sm font-bold text-gray-900 mb-4 uppercase bg-blue-100 px-2 py-2 -mx-4 -mt-4">Section A: Customer Details</h3>
                        <table className="w-full text-sm">
                            <tbody>
                                <tr className="border-b border-gray-400">
                                    <td className="py-2 font-semibold text-gray-800 w-40">Customer Name:</td>
                                    <td className="py-2 text-gray-900">{selectedCRF.customer}</td>
                                </tr>
                                <tr className="border-b border-gray-400">
                                    <td className="py-2 font-semibold text-gray-800">Address:</td>
                                    <td className="py-2 text-gray-900">{selectedCRF.address}</td>
                                </tr>
                                <tr className="border-b border-gray-400">
                                    <td className="py-2 font-semibold text-gray-800">Contact Person:</td>
                                    <td className="py-2 text-gray-900">{selectedCRF.contact}</td>
                                </tr>
                                <tr>
                                    <td className="py-2 font-semibold text-gray-800">Email:</td>
                                    <td className="py-2 text-gray-900">{selectedCRF.email}</td>
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
                                    <td className="py-2 text-gray-900">{selectedCRF.sampleType}</td>
                                </tr>
                                <tr className="border-b border-gray-400">
                                    <td className="py-2 font-semibold text-gray-800">Number of Samples:</td>
                                    <td className="py-2 text-gray-900">{selectedCRF.numberOfSamples}</td>
                                </tr>
                                <tr>
                                    <td className="py-2 font-semibold text-gray-800">Sampling Type:</td>
                                    <td className="py-2 text-gray-900">{selectedCRF.samplingType}</td>
                                </tr>
                            </tbody>
                        </table>

                        <h4 className="text-sm font-semibold text-gray-800 mb-3 mt-4">Sample IDs:</h4>
                        <table className="w-full border border-gray-800">
                            <thead>
                                <tr className="bg-blue-50">
                                    <th className="border border-gray-800 px-3 py-2 text-left text-sm font-bold">Sample ID</th>
                                    <th className="border border-gray-800 px-3 py-2 text-left text-sm font-bold">Description</th>
                                    <th className="border border-gray-800 px-3 py-2 text-left text-sm font-bold">Submission Detail</th>
                                </tr>
                            </thead>
                            <tbody>
                                {selectedCRF.samples.map((sample) => (
                                    <tr key={sample.id}>
                                        <td className="border border-gray-800 px-3 py-2 text-sm font-semibold">{sample.id}</td>
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
                        <div className="grid grid-cols-3 gap-3">
                            {selectedCRF.testParameters.map((param, index) => (
                                <div key={index} className="border border-gray-400 px-3 py-2 bg-gray-50">
                                    <span className="text-sm font-medium">{param}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Signatures */}
                    <div className="mt-12 pt-6 border-t-2 border-gray-900">
                        <div className="grid grid-cols-2 gap-8">
                            <div>
                                <p className="text-sm font-bold text-gray-900 mb-4">Received By (Laboratory):</p>
                                {selectedCRF.signature && (
                                    <div className="mb-2">
                                        <img src={selectedCRF.signature} alt="Signature" className="h-16 w-auto border-b-2 border-gray-900" />
                                    </div>
                                )}
                                <div className="border-t-2 border-gray-900 pt-2 mt-2">
                                    <p className="text-sm text-gray-900 font-medium">{selectedCRF.receivedBy}</p>
                                    <p className="text-xs text-gray-600 mt-1">Sample Reception Officer</p>
                                    <p className="text-xs text-gray-600">Date: {new Date(selectedCRF.receptionDate).toLocaleDateString('en-GB')}</p>
                                </div>
                            </div>
                            <div>
                                <p className="text-sm font-bold text-gray-900 mb-4">Submitted By (Customer):</p>
                                <div className="border-b-2 border-gray-900 h-16 mb-2"></div>
                                <div className="border-t-2 border-gray-900 pt-2 mt-2">
                                    <p className="text-sm text-gray-900 font-medium">{selectedCRF.contact}</p>
                                    <p className="text-xs text-gray-600 mt-1">{selectedCRF.customer}</p>
                                    <p className="text-xs text-gray-600">Date: {new Date(selectedCRF.date).toLocaleDateString('en-GB')}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="mt-8 pt-4 border-t border-gray-400 text-center text-xs text-gray-600">
                        <p>This is a computer generated form. For internal laboratory use only.</p>
                        <p className="mt-1">Form Ref: QF-LAB-001-Rev02 | Status: {selectedCRF.status.toUpperCase()}</p>
                    </div>
                </div>
            </div>
        );
    }


    return (
        <div>
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold text-gray-800">Customer Request Forms (CRF)</h1>
                <Button onClick={() => setShowForm(!showForm)}>
                    {showForm ? 'Cancel' : '+ New CRF'}
                </Button>
            </div>

            {/* CRF Form */}
            {showForm && (
                <Card className="mb-8">
                    <h2 className="text-xl font-semibold text-gray-800 mb-6">
                        {editingCRF ? 'Edit CRF' : 'Create New CRF'}
                    </h2>
                    <form onSubmit={handleSubmit}>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* CRF Type */}
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    CRF Type <span className="text-red-500">*</span>
                                </label>
                                <div className="flex gap-4">
                                    <label className="flex items-center gap-2 p-3 border-2 border-gray-300 rounded cursor-pointer hover:bg-gray-50">
                                        <input
                                            type="radio"
                                            name="crfType"
                                            value="CS"
                                            checked={formData.crfType === 'CS'}
                                            onChange={(e) => setFormData({ ...formData, crfType: e.target.value as 'CS' })}
                                            className="w-4 h-4"
                                        />
                                        <div>
                                            <span className="font-semibold">CS - Customer Sample</span>
                                            <p className="text-xs text-gray-600">With quotation reference</p>
                                        </div>
                                    </label>
                                    <label className="flex items-center gap-2 p-3 border-2 border-gray-300 rounded cursor-pointer hover:bg-gray-50">
                                        <input
                                            type="radio"
                                            name="crfType"
                                            value="LS"
                                            checked={formData.crfType === 'LS'}
                                            onChange={(e) => setFormData({ ...formData, crfType: e.target.value as 'LS' })}
                                            className="w-4 h-4"
                                        />
                                        <div>
                                            <span className="font-semibold">LS - Lab Sample</span>
                                            <p className="text-xs text-gray-600">Walk-in customer</p>
                                        </div>
                                    </label>
                                </div>
                            </div>

                            {/* Quotation Reference (only for CS type) */}
                            {formData.crfType === 'CS' && (
                                <Select
                                    label="Quotation Reference (Optional)"
                                    value={formData.quotationRef}
                                    onChange={handleQuotationChange}
                                    options={[
                                        { value: '', label: 'No quotation reference' },
                                        ...quotations.filter(q => q.approved).map(q => ({ value: q.requestId, label: `${q.requestId} - ${q.customer}` }))
                                    ]}
                                />
                            )}

                            <Select
                                label="Customer"
                                value={formData.customer ? mockCustomers.find(c => c.name === formData.customer)?.id || '' : ''}
                                onChange={handleCustomerChange}
                                options={[
                                    { value: '', label: 'Select customer or enter manually' },
                                    ...mockCustomers.map(c => ({ value: c.id, label: c.name }))
                                ]}
                                required
                            />

                            <Input
                                label="Customer Name (or edit)"
                                value={formData.customer}
                                onChange={(e) => setFormData({ ...formData, customer: e.target.value })}
                                required
                            />

                            <Input
                                label="Address"
                                value={formData.address}
                                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                required
                            />

                            <Input
                                label="Contact Person"
                                value={formData.contact}
                                onChange={(e) => setFormData({ ...formData, contact: e.target.value })}
                                required
                            />

                            <Input
                                label="Email"
                                type="email"
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                required
                            />

                            <Select
                                label="Sample Type"
                                value={formData.sampleType}
                                onChange={(e) => handleSampleTypeChange(e.target.value)}
                                options={sampleTypes.map(t => ({ value: t, label: t }))}
                                required
                            />

                            <Input
                                label="Number of Samples"
                                type="number"
                                value={formData.numberOfSamples.toString()}
                                onChange={(e) => setFormData({ ...formData, numberOfSamples: parseInt(e.target.value) || 1 })}
                                required
                            />

                            <Input
                                label="Reception Date & Time"
                                type="datetime-local"
                                value={formData.receptionDate}
                                onChange={(e) => setFormData({ ...formData, receptionDate: e.target.value })}
                                required
                            />

                            <Input
                                label="Received By"
                                value={formData.receivedBy}
                                onChange={(e) => setFormData({ ...formData, receivedBy: e.target.value })}
                                placeholder="Your name"
                                required
                            />

                            <div className="mb-4 md:col-span-2">
                                <div className="flex justify-between items-center mb-2">
                                    <label className="block text-sm font-medium text-gray-700">
                                        Test Parameters <span className="text-red-500">*</span>
                                    </label>
                                    {formData.sampleType && formData.availableParameters.length > formData.testParameters.length && (
                                        <button
                                            type="button"
                                            onClick={() => {
                                                // Find first unselected parameter and add it
                                                const unselected = formData.availableParameters.find(p => !formData.testParameters.includes(p));
                                                if (unselected) handleParameterToggle(unselected);
                                            }}
                                            className="flex items-center gap-1 text-sm text-primary-600 hover:text-primary-700 font-medium"
                                        >
                                            <Plus size={16} />
                                            Add More Parameters
                                        </button>
                                    )}
                                </div>
                                {formData.sampleType ? (
                                    <>
                                        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-3">
                                            {formData.availableParameters.map(paramName => (
                                                <label key={paramName} className="flex items-center gap-2 p-2 border border-gray-200 rounded hover:bg-gray-50 cursor-pointer">
                                                    <input
                                                        type="checkbox"
                                                        checked={formData.testParameters.includes(paramName)}
                                                        onChange={() => handleParameterToggle(paramName)}
                                                        className="w-4 h-4 text-primary-600"
                                                    />
                                                    <span className="text-sm text-gray-700">{paramName}</span>
                                                </label>
                                            ))}
                                        </div>
                                        {formData.testParameters.length === 0 && (
                                            <p className="text-sm text-amber-600 italic">Please select at least one parameter</p>
                                        )}
                                    </>
                                ) : (
                                    <p className="text-sm text-gray-500 italic">Please select a sample type first</p>
                                )}
                            </div>

                            {/* Remove the Sampling Type section entirely */}

                            {/* Sample Images Upload (Optional) */}
                            <div className="mb-4 md:col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Sample Images (Optional)
                                </label>
                                <div className="flex gap-3 mb-3">
                                    <label className="flex-1 cursor-pointer">
                                        <input
                                            type="file"
                                            accept="image/*"
                                            multiple
                                            onChange={handleImageUpload}
                                            className="hidden"
                                            id="file-upload"
                                        />
                                        <div className="flex items-center justify-center gap-2 px-4 py-2 bg-primary-50 text-primary-700 rounded-lg border-2 border-primary-200 hover:bg-primary-100 transition-colors">
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                            </svg>
                                            <span className="text-sm font-semibold">Upload from Gallery</span>
                                        </div>
                                    </label>
                                    <button
                                        type="button"
                                        onClick={startCamera}
                                        className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-green-50 text-green-700 rounded-lg border-2 border-green-200 hover:bg-green-100 transition-colors"
                                    >
                                        <Camera className="w-5 h-5" />
                                        <span className="text-sm font-semibold">Take Photo</span>
                                    </button>
                                </div>

                                {/* Camera Modal */}
                                {showCamera && (
                                    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
                                        <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4">
                                            <h3 className="text-lg font-semibold mb-4">Capture Sample Image</h3>
                                            <video 
                                                ref={videoRef} 
                                                autoPlay 
                                                playsInline
                                                className="w-full rounded-lg mb-4 bg-black"
                                            />
                                            <canvas ref={canvasRef} className="hidden" />
                                            <div className="flex gap-3">
                                                <Button type="button" onClick={capturePhoto} className="flex-1">
                                                    <Camera className="w-4 h-4 mr-2" />
                                                    Capture
                                                </Button>
                                                <Button type="button" variant="secondary" onClick={stopCamera} className="flex-1">
                                                    Cancel
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {formData.sampleImages.length > 0 && (
                                    <div className="mt-3 grid grid-cols-4 gap-3">
                                        {formData.sampleImages.map((img, idx) => (
                                            <div key={idx} className="relative">
                                                <img src={img} alt={`Sample ${idx + 1}`} className="w-full h-24 object-cover rounded border" />
                                                <button
                                                    type="button"
                                                    onClick={() => handleRemoveImage(idx)}
                                                    className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-red-700"
                                                >
                                                    ×
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            <Select
                                label="Priority"
                                value={formData.priority}
                                onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                                options={priorities.map(p => ({ value: p, label: p }))}
                                required
                            />
                        </div>

                        <div className="mt-6 mb-6">
                            <h4 className="text-sm font-medium text-gray-700 mb-3">E-Signature <span className="text-red-500">*</span></h4>
                            <SignatureCanvas
                                onSave={(sig) => setFormData({ ...formData, signature: sig })}
                                savedSignature={formData.signature}
                            />
                        </div>

                        <div className="flex justify-end gap-3">
                            <Button type="button" variant="secondary" onClick={resetForm}>
                                Cancel
                            </Button>
                            <Button type="submit" disabled={!formData.signature || formData.testParameters.length === 0}>
                                {editingCRF ? 'Update CRF' : 'Create CRF'}
                            </Button>
                        </div>
                    </form>
                </Card>
            )}

            {/* CRF Table */}
            <Card>
                <h2 className="text-xl font-semibold text-gray-800 mb-6">All CRFs</h2>
                {crfs.length === 0 ? (
                    <p className="text-gray-500 text-center py-8">No CRFs yet. Create your first CRF above.</p>
                ) : (
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>CRF ID</TableHead>
                                    <TableHead>Type</TableHead>
                                    <TableHead>Customer</TableHead>
                                    <TableHead>Sample Type</TableHead>
                                    <TableHead>Samples</TableHead>
                                    <TableHead>Parameters</TableHead>
                                    <TableHead>Date</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {crfs.map((crf) => (
                                    <TableRow key={crf.id}>
                                        <TableCell className="font-semibold">{crf.id}</TableCell>
                                        <TableCell>
                                            <Badge status={crf.crfType === 'CS' ? 'approved' : 'pending'}>
                                                {crf.crfType}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>{crf.customer}</TableCell>
                                        <TableCell>{crf.sampleType}</TableCell>
                                        <TableCell>{crf.numberOfSamples}</TableCell>
                                        <TableCell>
                                            <div className="flex flex-wrap gap-1">
                                                {crf.testParameters.slice(0, 2).map(param => (
                                                    <span key={param} className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
                                                        {param}
                                                    </span>
                                                ))}
                                                {crf.testParameters.length > 2 && (
                                                    <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">
                                                        +{crf.testParameters.length - 2}
                                                    </span>
                                                )}
                                            </div>
                                        </TableCell>
                                        <TableCell>{new Date(crf.date).toLocaleDateString()}</TableCell>
                                        <TableCell>
                                            <select
                                                value={crf.status}
                                                onChange={(e) => handleStatusChange(crf.id, e.target.value)}
                                                className="px-3 py-1 rounded text-sm font-medium border focus:outline-none focus:ring-2 focus:ring-primary-500"
                                            >
                                                <option value="draft">Draft</option>
                                                <option value="submitted">Submitted</option>
                                                <option value="assigned">Assigned</option>
                                                <option value="testing">Testing</option>
                                                <option value="review">Review</option>
                                                <option value="approved">Approved</option>
                                                <option value="completed">Completed</option>
                                            </select>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex gap-2">
                                                <button 
                                                    onClick={() => handleEdit(crf)}
                                                    className="text-blue-600 hover:text-blue-800"
                                                    title="Edit"
                                                >
                                                    <Edit size={16} />
                                                </button>
                                                <button 
                                                    onClick={() => handlePreview(crf.id)}
                                                    className="text-green-600 hover:text-green-800"
                                                    title="Preview"
                                                >
                                                    <Eye size={16} />
                                                </button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                )}
            </Card>
        </div>
    );
};
