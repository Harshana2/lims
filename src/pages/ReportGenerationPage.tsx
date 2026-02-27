import React, { useRef, useState, useEffect } from 'react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../components/ui/Table';
import crfService from '../services/crfService';
import sampleService from '../services/sampleService';
import type { CRF } from '../services/crfService';
import type { Sample } from '../services/sampleService';
import { FileDown, Eye } from 'lucide-react';

export const ReportGenerationPage: React.FC = () => {
    const [approvedCRFs, setApprovedCRFs] = useState<CRF[]>([]);
    const [selectedCRF, setSelectedCRF] = useState<CRF | null>(null);
    const [samples, setSamples] = useState<Sample[]>([]);
    const [loading, setLoading] = useState(true);
    const [showPreview, setShowPreview] = useState(false);
    const page1Ref = useRef<HTMLDivElement>(null);
    const page2Ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        loadApprovedCRFs();
    }, []);

    const loadApprovedCRFs = async () => {
        try {
            setLoading(true);
            const allCRFs = await crfService.getAll();
            const approved = allCRFs.filter((crf: CRF) => crf.status === 'approved');
            setApprovedCRFs(approved);
        } catch (error) {
            console.error('Error loading approved CRFs:', error);
            alert('Failed to load approved CRFs');
        } finally {
            setLoading(false);
        }
    };

    const handleSelectCRF = async (crf: CRF) => {
        setSelectedCRF(crf);
        setShowPreview(false);
        if (crf.id) {
            try {
                const crfSamples = await sampleService.getByCrfId(crf.id);
                setSamples(crfSamples);
            } catch (error) {
                console.error('Error loading samples:', error);
                setSamples([]);
            }
        }
    };

    const handlePreview = () => {
        if (!selectedCRF) {
            alert('Please select a CRF first');
            return;
        }
        setShowPreview(true);
    };

    const handleDownloadPDF = async () => {
        if (!selectedCRF) return;

        try {
            const { default: jsPDF } = await import('jspdf');

            // Native jsPDF drawing — vector PDF, perfect quality, tiny file, zero alignment issues.
            const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
            const W = 210; // page width mm
            const H = 297; // page height mm
            const ml = 20; // margin left
            const mr = 20; // margin right
            const cw = W - ml - mr; // content width

            const setFont = (style: 'normal' | 'bold', size: number) => {
                pdf.setFont('helvetica', style);
                pdf.setFontSize(size);
            };
            const text = (str: string, x: number, y: number, opts?: any) => {
                pdf.text(str, x, y, opts);
            };
            const line = (x1: number, y1: number, x2: number, y2: number) => {
                pdf.line(x1, y1, x2, y2);
            };
            const rect = (x: number, y: number, w: number, h: number, style: 'S' | 'F' | 'FD' = 'S') => {
                pdf.rect(x, y, w, h, style);
            };
            const fmtDate = (d: Date) =>
                d.toLocaleDateString('en-GB').replace(/\//g, '/');

            // ─── PAGE 1 ───────────────────────────────────────────────
            let y = 18;

            // LILL logo box
            pdf.setDrawColor(0);
            pdf.setLineWidth(0.5);
            rect(ml, y - 5, 20, 16);
            setFont('bold', 10);
            text('LILL', ml + 10, y + 3, { align: 'center' });
            setFont('normal', 5);
            text('Lindel Industrial', ml + 10, y + 6, { align: 'center' });
            text('Laboratories Ltd', ml + 10, y + 9, { align: 'center' });

            // Company name & address
            setFont('bold', 13);
            text('LINDEL INDUSTRIAL LABORATORIES LTD.', ml + 24, y);
            setFont('normal', 8);
            text('Pattiwila Road, Sapugaskanda,', ml + 24, y + 5);
            text('Makola, Sri Lanka.', ml + 24, y + 9);
            text('Company Reg. No: P.B. 550', ml + 24, y + 13);
            text('Tel : +94 11 2401675', ml + 24, y + 17);
            text('Fax : +94 11 2400321', ml + 24, y + 21);
            text('E-mail : lill@itmin.net', ml + 80, y + 17);
            text('Web : www.lill.lk', ml + 80, y + 21);

            // SLAB circle (top right)
            const cx1 = W - mr - 14;
            const cx2 = W - mr - 28;
            pdf.circle(cx1, y + 5, 7);
            setFont('bold', 5);
            text('SLAB', cx1, y + 4, { align: 'center' });
            setFont('normal', 4);
            text('ACCREDITED', cx1, y + 7, { align: 'center' });
            text('ISO/IEC 17025', cx1, y + 9.5, { align: 'center' });
            pdf.circle(cx2, y + 5, 7);
            setFont('bold', 5);
            text('ILAC', cx2, y + 4, { align: 'center' });
            text('MRA', cx2, y + 7, { align: 'center' });

            y += 27;
            pdf.setLineWidth(0.3);
            line(ml, y, W - mr, y);
            y += 10;

            // ANALYSIS REPORT title
            setFont('bold', 14);
            text('ANALYSIS REPORT', W / 2, y, { align: 'center' });
            // underline
            const titleW = pdf.getTextWidth('ANALYSIS REPORT');
            line(W / 2 - titleW / 2, y + 1, W / 2 + titleW / 2, y + 1);
            y += 12;

            // Reference / Customer / Specimen
            const labelX = ml;
            const valueX = ml + 45;
            setFont('bold', 9);
            text('REFERENCE NO', labelX, y);
            setFont('normal', 9);
            text(': ' + samples.map(s => s.sampleId).join(', '), valueX, y);
            y += 8;

            setFont('bold', 9);
            text('CUSTOMER', labelX, y);
            setFont('normal', 9);
            text(': ' + (selectedCRF.customer || ''), valueX, y);
            if (selectedCRF.address) {
                y += 5;
                text('  ' + selectedCRF.address, valueX, y);
            }
            y += 8;

            setFont('bold', 9);
            text('SPECIMEN', labelX, y);
            setFont('normal', 9);
            text(': ' + (selectedCRF.sampleType || '') + ' samples', valueX, y);
            y += 10;

            // Specimens table
            const cols = [30, 80, 40]; // col widths
            const tableX = ml;
            pdf.setLineWidth(0.3);
            // header
            pdf.setFillColor(240, 240, 240);
            rect(tableX, y, cw, 8, 'FD');
            setFont('bold', 8);
            text('Sample Reference', tableX + cols[0] / 2, y + 5.5, { align: 'center' });
            text('Description', tableX + cols[0] + cols[1] / 2, y + 5.5, { align: 'center' });
            text('Submission Details', tableX + cols[0] + cols[1] + cols[2] / 2, y + 5.5, { align: 'center' });
            y += 8;
            samples.forEach((s, i) => {
                const rh = 8;
                rect(tableX, y, cw, rh);
                // vertical dividers
                line(tableX + cols[0], y, tableX + cols[0], y + rh);
                line(tableX + cols[0] + cols[1], y, tableX + cols[0] + cols[1], y + rh);
                setFont('normal', 8);
                text(s.sampleId, tableX + cols[0] / 2, y + 5.5, { align: 'center' });
                // truncate description
                const desc = (s.description || '-').substring(0, 35);
                text(desc, tableX + cols[0] + 2, y + 5.5);
                text(i === 0 ? '2 L in a plastic container' : '1 L in a plastic container',
                    tableX + cols[0] + cols[1] + cols[2] / 2, y + 5.5, { align: 'center' });
                y += rh;
            });
            y += 8;

            // Particulars
            setFont('bold', 9);
            text('PARTICULARS OF THE SPECIMEN :', labelX, y);
            y += 7;
            const pLabelX = ml + 5;
            const pValueX = ml + 65;

            const createdDate = selectedCRF.createdAt ? new Date(selectedCRF.createdAt) : new Date();
            const particulars = [
                ['Sampling Carried Out By', ':- The customer (' + (selectedCRF.customer || '') + ')'],
                ['Reception at the Laboratory', ':- ' + fmtDate(createdDate) + ' at ' +
                    createdDate.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }) + ' a.m.'],
                ['Duration of Analysis', ':- ' + fmtDate(createdDate) + ' \u2013 ' + fmtDate(new Date())],
                ['Date of Issue', ':- ' + fmtDate(new Date())],
            ];
            particulars.forEach(([label, value]) => {
                setFont('bold', 8);
                text(label, pLabelX, y);
                setFont('normal', 8);
                text(value, pValueX, y);
                y += 7;
            });
            y += 4;

            // Test required
            setFont('bold', 9);
            text('TEST REQUIRED :', labelX, y);
            setFont('normal', 9);
            const reqDate = selectedCRF.createdAt ? new Date(selectedCRF.createdAt) : new Date();
            text('As per the customer\'s request on ' + reqDate.getDate() + 'th ' +
                reqDate.toLocaleDateString('en-GB', { month: 'long', year: 'numeric' }) + '.',
                valueX, y);
            y += 8;

            // Method
            setFont('bold', 9);
            text('METHOD OF ANALYSIS :', labelX, y);
            setFont('normal', 9);
            text('Standard Methods for the Examination of Water & Wastewater,', valueX, y);
            y += 5;
            text('APHA 24th Edition.', valueX, y);
            y += 8;

            // Conditions
            setFont('bold', 9);
            text('CONDITIONS :', labelX, y);
            setFont('normal', 9);
            const conds = [
                'The results given in this report relate only to the sample tested.',
                'This report shall not be reproduced except in full without the written approval of the laboratory.',
            ];
            conds.forEach(c => {
                text('\u2022 ' + c, valueX, y);
                y += 6;
            });

            // Pg 01 of 02
            setFont('normal', 9);
            pdf.setFont('helvetica', 'italic');
            text('Pg. 01 of 02', W - mr, H - 12, { align: 'right' });

            // ─── PAGE 2 ───────────────────────────────────────────────
            pdf.addPage();
            y = 18;

            // SLAB logos top right
            pdf.circle(W - mr - 14, y, 7);
            setFont('bold', 5);
            text('SLAB', W - mr - 14, y - 1, { align: 'center' });
            setFont('normal', 4);
            text('ACCREDITED', W - mr - 14, y + 2, { align: 'center' });
            text('ISO/IEC 17025', W - mr - 14, y + 4.5, { align: 'center' });
            pdf.circle(W - mr - 28, y, 7);
            setFont('bold', 5);
            text('ILAC', W - mr - 28, y - 1, { align: 'center' });
            text('MRA', W - mr - 28, y + 2, { align: 'center' });
            y += 14;

            // Test results per sample
            samples.forEach(sample => {
                // Reference title
                setFont('bold', 9);
                const refLabel = 'REFERENCE NO : ' + sample.sampleId;
                text(refLabel, W / 2, y, { align: 'center' });
                const rw = pdf.getTextWidth(refLabel);
                line(W / 2 - rw / 2, y + 1, W / 2 + rw / 2, y + 1);
                y += 8;

                // Table header
                const tcols = [60, 25, 35, 50];
                pdf.setFillColor(240, 240, 240);
                rect(ml, y, cw, 8, 'FD');
                setFont('bold', 8);
                let tx = ml;
                ['PARAMETER', 'UNIT', 'TEST VALUE', 'TEST METHOD'].forEach((h, i) => {
                    text(h, tx + tcols[i] / 2, y + 5.5, { align: 'center' });
                    tx += tcols[i];
                });
                y += 8;

                // Rows
                if (sample.testValues) {
                    Object.entries(sample.testValues).forEach(([param, value]) => {
                        const rh = 8;
                        rect(ml, y, cw, rh);
                        let vx = ml;
                        tcols.forEach((tw, i) => {
                            if (i > 0) line(vx, y, vx, y + rh);
                            vx += tw;
                        });
                        setFont('normal', 8);
                        text(param, ml + 2, y + 5.5);
                        text('mg/L', ml + tcols[0] + tcols[1] / 2, y + 5.5, { align: 'center' });
                        setFont('bold', 8);
                        text(String(value), ml + tcols[0] + tcols[1] + tcols[2] / 2, y + 5.5, { align: 'center' });
                        setFont('normal', 8);
                        text('APHA : 5220 D', ml + tcols[0] + tcols[1] + tcols[2] + tcols[3] / 2, y + 5.5, { align: 'center' });
                        y += rh;
                    });
                } else {
                    rect(ml, y, cw, 8);
                    setFont('normal', 8);
                    text('No test data available', W / 2, y + 5.5, { align: 'center' });
                    y += 8;
                }
                y += 6;
            });

            // Accreditation note
            setFont('normal', 8);
            text('~ Test is not accredited by SLAB', ml, y);
            y += 10;

            // Company
            setFont('bold', 9);
            text('Lindel Industrial Laboratories Limited', ml, y);
            setFont('normal', 8);
            y += 5;
            text('Reg. No. P.B. 550', ml, y);
            y += 16;

            // Signature lines
            const sig1X = ml;
            const sig2X = W / 2 + 5;
            const sigW = 70;
            pdf.setLineWidth(0.4);
            line(sig1X, y, sig1X + sigW, y);
            line(sig2X, y, sig2X + sigW, y);
            y += 5;
            setFont('normal', 8);
            text('...............................................................', sig1X, y);
            text('...............................................................', sig2X, y);
            y += 5;
            setFont('bold', 8);
            text('S.A.A.G.Senarathna', sig1X, y);
            text('D.H.S.Costa', sig2X, y);
            y += 5;
            setFont('normal', 7);
            text('Technical & Quality Manager', sig1X, y);
            text('Senior Analytical Chemist', sig2X, y);
            y += 4;
            text('LINDEL INDUSTRIAL LABORATORIES LTD', sig1X, y);
            y += 10;

            // Date
            setFont('normal', 9);
            const today = new Date();
            text(today.getDate() + 'th ' + today.toLocaleDateString('en-GB', { month: 'long', year: 'numeric' }), ml, y);
            y += 6;

            // Pg 02 of 02
            pdf.setFont('helvetica', 'italic');
            text('Pg. 02 of 02', W - mr, H - 12, { align: 'right' });

            // LILL logo bottom left
            pdf.setFont('helvetica', 'normal');
            pdf.setLineWidth(0.5);
            rect(ml, H - 22, 20, 16);
            setFont('bold', 10);
            text('LILL', ml + 10, H - 14, { align: 'center' });
            setFont('normal', 5);
            text('Lindel Industrial Laboratories Ltd', ml + 10, H - 10, { align: 'center' });
            text('QUALITY for SUSTAINABILITY', ml + 10, H - 7, { align: 'center' });
            pdf.setFont('helvetica', 'italic');
            pdf.setFontSize(9);
            const contText = 'LILL Continuation Sheet...........';
            text(contText, ml + 24, H - 12);
            // underline continuation text
            line(ml + 24, H - 11, ml + 24 + pdf.getTextWidth(contText), H - 11);

            pdf.save(`LIMS_Report_${selectedCRF.crfId}_${new Date().toISOString().split('T')[0]}.pdf`);

            if (selectedCRF.id) {
                await crfService.updateStatus(selectedCRF.id, 'completed');
                alert('Report downloaded! CRF marked as completed.');
                loadApprovedCRFs();
            }
        } catch (error) {
            console.error('Error generating PDF:', error);
            alert('Failed to generate PDF. Please try again.');
        }

        setSelectedCRF(null);
        setSamples([]);
        setShowPreview(false);
    };

    if (loading) {
        return <div className="text-center py-8">Loading approved CRFs...</div>;
    }

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
            </div>

            {!showPreview ? (
                <>
                    {/* Approved CRFs Table */}
                    <Card className="mb-6">
                        <h3 className="text-lg font-semibold text-gray-800 mb-4">Approved CRFs Ready for Report Generation</h3>
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>CRF ID</TableHead>
                                        <TableHead>Customer</TableHead>
                                        <TableHead>Sample Type</TableHead>
                                        <TableHead>Type</TableHead>
                                        <TableHead>Samples</TableHead>
                                        <TableHead>Parameters</TableHead>
                                        <TableHead>Reception Date</TableHead>
                                        <TableHead>Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {approvedCRFs.map((crf) => (
                                        <TableRow key={crf.id}>
                                            <TableCell className="font-semibold">{crf.crfId}</TableCell>
                                            <TableCell>{crf.customer}</TableCell>
                                            <TableCell>{crf.sampleType}</TableCell>
                                            <TableCell>
                                                <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800">
                                                    {crf.crfType === 'CS' ? 'Customer Submission' : 'Lab Service'}
                                                </span>
                                            </TableCell>
                                            <TableCell>{crf.numberOfSamples}</TableCell>
                                            <TableCell>{crf.testParameters?.length || 0}</TableCell>
                                            <TableCell>
                                                {new Date(crf.receptionDate).toLocaleDateString()}
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex gap-2">
                                                    <Button
                                                        onClick={() => handleSelectCRF(crf)}
                                                        className="flex items-center gap-1 text-sm px-3 py-1"
                                                    >
                                                        <Eye className="w-4 h-4" />
                                                        View & Generate
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    </Card>

                    {selectedCRF && (
                        <>
                            <Card className="mb-6">
                                <h3 className="text-lg font-semibold text-gray-800 mb-4 pb-3 border-b">CRF Summary</h3>
                                <div className="grid grid-cols-3 gap-4">
                                    <div>
                                        <p className="text-sm text-gray-600">CRF ID</p>
                                        <p className="font-medium">{selectedCRF.crfId}</p>
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
                                        <p className="font-medium">{selectedCRF.testParameters?.length || 0}</p>
                                    </div>
                                </div>
                            </Card>

                            <Card className="mb-6">
                                <h3 className="text-lg font-semibold text-gray-800 mb-4 pb-3 border-b">Test Results</h3>
                                <div className="overflow-x-auto">
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>Sample ID</TableHead>
                                                <TableHead>Description</TableHead>
                                                <TableHead>Assigned Chemist</TableHead>
                                                <TableHead>Test Values</TableHead>
                                                <TableHead>Status</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {samples.length > 0 ? (
                                                samples.map((sample) => (
                                                    <TableRow key={sample.id}>
                                                        <TableCell className="font-semibold">{sample.sampleId}</TableCell>
                                                        <TableCell>{sample.description || '-'}</TableCell>
                                                        <TableCell>{sample.assignedTo || 'Unassigned'}</TableCell>
                                                        <TableCell>
                                                            {sample.testValues ? (
                                                                <div className="text-sm">
                                                                    {Object.entries(sample.testValues).map(([param, value]) => (
                                                                        <div key={param} className="mb-1">
                                                                            <span className="font-medium">{param}:</span> {value as string}
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                            ) : (
                                                                <span className="text-gray-400">No test data</span>
                                                            )}
                                                        </TableCell>
                                                        <TableCell>
                                                            <span className={`px-2 py-1 text-xs rounded-full ${
                                                                sample.testValues ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                                                            }`}>
                                                                {sample.testValues ? 'Tested' : 'Pending'}
                                                            </span>
                                                        </TableCell>
                                                    </TableRow>
                                                ))
                                            ) : (
                                                <TableRow>
                                                    <TableCell className="text-center text-gray-500">No samples found</TableCell>
                                                    <TableCell>-</TableCell>
                                                    <TableCell>-</TableCell>
                                                    <TableCell>-</TableCell>
                                                    <TableCell>-</TableCell>
                                                </TableRow>
                                            )}
                                        </TableBody>
                                    </Table>
                                </div>
                            </Card>

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
                    {/* Actions */}
                    <div className="mb-6 flex justify-end gap-3">
                        <Button variant="secondary" onClick={() => setShowPreview(false)}>
                            Back to Selection
                        </Button>
                        <Button variant="primary" onClick={handleDownloadPDF}>
                            <FileDown size={18} className="mr-2" />
                            Download PDF & Complete
                        </Button>
                    </div>

                    {/* ── PAGE 1 ── */}
                    <div
                        ref={page1Ref}
                        className="bg-white mx-auto mb-4"
                        style={{ width: '210mm', minHeight: '297mm', padding: '20mm 20mm 16mm 20mm', boxSizing: 'border-box' }}
                    >
                        {/* Header */}
                        <div className="flex justify-between items-start mb-4">
                            <div className="flex items-start gap-3">
                                {/* LILL logo box */}
                                <div className="border-2 border-gray-800 p-2 flex items-center justify-center" style={{ width: '60px', height: '60px' }}>
                                    <div className="text-center">
                                        <p className="text-lg font-black leading-none">LILL</p>
                                        <p className="text-gray-600 leading-none" style={{ fontSize: '5px' }}>Lindel Industrial Laboratories Ltd</p>
                                        <p className="text-gray-600 leading-none" style={{ fontSize: '4.5px' }}>QUALITY for SUSTAINABILITY</p>
                                    </div>
                                </div>
                                <div>
                                    <h1 className="text-xl font-bold text-gray-900 mb-1">LINDEL INDUSTRIAL LABORATORIES LTD.</h1>
                                    <p className="text-xs text-gray-700">Pattiwila Road, Sapugaskanda,</p>
                                    <p className="text-xs text-gray-700">Makola, Sri Lanka.</p>
                                    <p className="text-xs text-gray-600">Company Reg. No: P.B. 550</p>
                                    <div className="flex gap-6 mt-1">
                                        <div>
                                            <p className="text-xs text-gray-600">Tel : +94 11 2401675</p>
                                            <p className="text-xs text-gray-600">Fax : +94 11 2400321</p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-600">E-mail : lill@itmin.net</p>
                                            <p className="text-xs text-gray-600">Web : www.lill.lk</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            {/* Accreditation logos */}
                            <div className="flex gap-2 items-center">
                                <div className="border-2 border-gray-500 rounded-full flex flex-col items-center justify-center" style={{ width: '54px', height: '54px' }}>
                                    <p className="font-bold text-gray-700" style={{ fontSize: '7px' }}>ILAC</p>
                                    <p className="font-bold text-gray-700" style={{ fontSize: '7px' }}>MRA</p>
                                </div>
                                <div className="border-2 border-gray-500 rounded-full flex flex-col items-center justify-center" style={{ width: '54px', height: '54px' }}>
                                    <p className="font-black text-gray-800" style={{ fontSize: '9px' }}>SLAB</p>
                                    <p className="text-gray-600" style={{ fontSize: '5px' }}>ACCREDITED</p>
                                    <p className="text-gray-600" style={{ fontSize: '4.5px' }}>ISO/IEC 17025</p>
                                    <p className="text-gray-600" style={{ fontSize: '4.5px' }}>TL 005-01</p>
                                </div>
                            </div>
                        </div>

                        {/* Divider */}
                        <hr className="border-gray-400 mb-5" />

                        {/* Report Title */}
                        <div className="text-center mb-5">
                            <h2 className="text-lg font-bold text-gray-900 uppercase tracking-wider underline">
                                ANALYSIS REPORT
                            </h2>
                        </div>

                        {/* Reference No & Customer */}
                        <div className="mb-4 space-y-3">
                            <div className="flex gap-4">
                                <div className="font-bold uppercase text-sm w-44 flex-shrink-0">REFERENCE NO</div>
                                <div className="text-sm">: {samples.map(s => s.sampleId).join(', ')}</div>
                            </div>
                            <div className="flex gap-4">
                                <div className="font-bold uppercase text-sm w-44 flex-shrink-0">CUSTOMER</div>
                                <div className="text-sm">
                                    : {selectedCRF?.customer}
                                    {selectedCRF?.address && <><br />&nbsp;&nbsp;{selectedCRF.address}</>}
                                </div>
                            </div>
                            <div className="flex gap-4">
                                <div className="font-bold uppercase text-sm w-44 flex-shrink-0">SPECIMEN</div>
                                <div className="text-sm">: {selectedCRF?.sampleType} samples</div>
                            </div>
                        </div>

                        {/* Specimens Table */}
                        <div className="mb-5">
                            <table className="w-full border-collapse border border-gray-800 text-sm">
                                <thead>
                                    <tr className="bg-gray-50">
                                        <th className="border border-gray-800 px-3 py-2 text-center font-bold text-xs">Sample<br />Reference</th>
                                        <th className="border border-gray-800 px-3 py-2 text-center font-bold text-xs">Description</th>
                                        <th className="border border-gray-800 px-3 py-2 text-center font-bold text-xs">Submission Details</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {samples.map((sample, index) => (
                                        <tr key={sample.id}>
                                            <td className="border border-gray-800 px-3 py-2 text-center text-xs">{sample.sampleId}</td>
                                            <td className="border border-gray-800 px-3 py-2 text-xs">{sample.description || '-'}</td>
                                            {/* First sample may be 2L, rest 1L — adjust if your data has this field */}
                                            <td className="border border-gray-800 px-3 py-2 text-xs">
                                                {index === 0 ? '2 L in a plastic container' : '1 L in a plastic container'}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Particulars of Specimen */}
                        <div className="mb-5">
                            <div className="font-bold uppercase text-sm mb-3">PARTICULARS OF THE SPECIMEN :</div>
                            <div className="ml-4 space-y-2 text-sm">
                                <div className="flex gap-2">
                                    <span className="font-semibold w-56 flex-shrink-0">Sampling Carried Out By</span>
                                    <span>:- The customer ({selectedCRF?.customer})</span>
                                </div>
                                <div className="flex gap-2">
                                    <span className="font-semibold w-56 flex-shrink-0">Reception at the Laboratory</span>
                                    <span>
                                        :- {selectedCRF?.createdAt
                                            ? new Date(selectedCRF.createdAt).toLocaleDateString('en-GB').replace(/\//g, '/') +
                                              ' at ' +
                                              new Date(selectedCRF.createdAt).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }) +
                                              ' a.m.'
                                            : 'N/A'}
                                    </span>
                                </div>
                                <div className="flex gap-2">
                                    <span className="font-semibold w-56 flex-shrink-0">Duration of Analysis</span>
                                    <span>
                                        :- {selectedCRF?.createdAt ? new Date(selectedCRF.createdAt).toLocaleDateString('en-GB') : 'N/A'} – {new Date().toLocaleDateString('en-GB')}
                                    </span>
                                </div>
                                <div className="flex gap-2">
                                    <span className="font-semibold w-56 flex-shrink-0">Date of Issue</span>
                                    <span>:- {new Date().toLocaleDateString('en-GB')}</span>
                                </div>
                            </div>
                        </div>

                        {/* Test Required */}
                        <div className="mb-3 flex gap-4">
                            <div className="font-bold uppercase text-sm w-44 flex-shrink-0">TEST REQUIRED :</div>
                            <div className="text-sm">
                                As per the customer's request on{' '}
                                {selectedCRF?.createdAt
                                    ? new Date(selectedCRF.createdAt).getDate() + 'th ' +
                                      new Date(selectedCRF.createdAt).toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })
                                    : 'N/A'}.
                            </div>
                        </div>

                        {/* Method of Analysis */}
                        <div className="mb-3 flex gap-4">
                            <div className="font-bold uppercase text-sm w-44 flex-shrink-0">METHOD OF ANALYSIS :</div>
                            <div className="text-sm">
                                Standard Methods for the Examination of Water & Wastewater,<br />
                                APHA 24<sup>th</sup> Edition.
                            </div>
                        </div>

                        {/* Conditions */}
                        <div className="mb-5 flex gap-4">
                            <div className="font-bold uppercase text-sm w-44 flex-shrink-0">CONDITIONS :</div>
                            <div className="text-sm">
                                <ul className="list-disc ml-4 space-y-1">
                                    <li>The results given in this report relate only to the sample tested.</li>
                                    <li>This report shall not be reproduced except in full without the written approval of the laboratory.</li>
                                </ul>
                            </div>
                        </div>

                        {/* Page Number */}
                        <div className="text-right text-sm italic mt-auto pt-4">
                            Pg. 01 of 02
                        </div>
                    </div>

                    {/* ── PAGE 2 ── */}
                    <div
                        ref={page2Ref}
                        className="bg-white mx-auto"
                        style={{ width: '210mm', minHeight: '297mm', padding: '16mm 20mm 16mm 20mm', boxSizing: 'border-box' }}
                    >
                        {/* Accreditation Logos top-right */}
                        <div className="flex justify-end gap-2 mb-5">
                            <div className="border-2 border-gray-500 rounded-full flex flex-col items-center justify-center" style={{ width: '54px', height: '54px' }}>
                                <p className="font-bold text-gray-700" style={{ fontSize: '7px' }}>ILAC</p>
                                <p className="font-bold text-gray-700" style={{ fontSize: '7px' }}>MRA</p>
                            </div>
                            <div className="border-2 border-gray-500 rounded-full flex flex-col items-center justify-center" style={{ width: '54px', height: '54px' }}>
                                <p className="font-black text-gray-800" style={{ fontSize: '9px' }}>SLAB</p>
                                <p className="text-gray-600" style={{ fontSize: '5px' }}>ACCREDITED</p>
                                <p className="text-gray-600" style={{ fontSize: '4.5px' }}>ISO/IEC 17025</p>
                                <p className="text-gray-600" style={{ fontSize: '4.5px' }}>TL 005-01</p>
                            </div>
                        </div>

                        {/* Test Results by Sample */}
                        {samples.map((sample) => (
                            <div key={sample.id} className="mb-6">
                                <h3 className="text-center font-bold text-sm mb-3 underline">
                                    REFERENCE NO : {sample.sampleId}
                                </h3>
                                <table className="w-full border-collapse border border-gray-800 text-sm">
                                    <thead>
                                        <tr className="bg-gray-50">
                                            <th className="border border-gray-800 px-3 py-2 text-center font-bold text-xs">PARAMETER</th>
                                            <th className="border border-gray-800 px-3 py-2 text-center font-bold text-xs">UNIT</th>
                                            <th className="border border-gray-800 px-3 py-2 text-center font-bold text-xs">TEST VALUE</th>
                                            <th className="border border-gray-800 px-3 py-2 text-center font-bold text-xs">TEST METHOD</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {sample.testValues ? (
                                            Object.entries(sample.testValues).map(([param, value]) => (
                                                <tr key={param}>
                                                    <td className="border border-gray-800 px-3 py-2 text-xs">
                                                        {/* Mark non-accredited with ~ prefix */}
                                                        {param}
                                                    </td>
                                                    <td className="border border-gray-800 px-3 py-2 text-center text-xs">mg/L</td>
                                                    <td className="border border-gray-800 px-3 py-2 text-center font-semibold text-xs">{value as string}</td>
                                                    <td className="border border-gray-800 px-3 py-2 text-center text-xs">APHA : 5220 D</td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td colSpan={4} className="border border-gray-800 px-3 py-2 text-center text-gray-500 text-xs">
                                                    No test data available
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        ))}

                        {/* Accreditation Note */}
                        <p className="text-xs mb-5">~ Test is not accredited by SLAB</p>

                        {/* Company Name */}
                        <div className="mb-5">
                            <p className="text-sm font-semibold">Lindel Industrial Laboratories Limited</p>
                            <p className="text-xs">Reg. No. P.B. 550</p>
                        </div>

                        {/* Signatures */}
                        <div className="grid grid-cols-2 gap-12 mb-6">
                            <div>
                                <div style={{ height: '48px' }}></div>
                                <p className="text-xs border-t border-gray-400 pt-1">...............................................................</p>
                                <p className="text-xs font-semibold mt-1">S.A.A.G.Senarathna</p>
                                <p className="text-xs">Technical & Quality Manager</p>
                                <p className="text-xs">LINDEL INDUSTRIAL LABORATORIES LTD</p>
                            </div>
                            <div>
                                <div style={{ height: '48px' }}></div>
                                <p className="text-xs border-t border-gray-400 pt-1">...............................................................</p>
                                <p className="text-xs font-semibold mt-1">D.H.S.Costa</p>
                                <p className="text-xs">Senior Analytical Chemist</p>
                            </div>
                        </div>

                        {/* Date */}
                        <p className="text-sm mb-5">
                            {new Date().getDate()}<sup>th</sup> {new Date().toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })}
                        </p>

                        {/* Page Number */}
                        <div className="text-right text-sm italic mb-8">
                            Pg. 02 of 02
                        </div>

                        {/* Bottom Logo & Continuation text */}
                        <div className="flex items-center gap-4 mt-6">
                            <div className="border-2 border-gray-800 p-2 flex items-center justify-center" style={{ width: '64px', height: '64px' }}>
                                <div className="text-center">
                                    <p className="text-xl font-black leading-none">LILL</p>
                                    <p className="text-gray-600 leading-none" style={{ fontSize: '5px' }}>Lindel Industrial Laboratories Ltd</p>
                                    <p className="text-gray-600 leading-none" style={{ fontSize: '4.5px' }}>QUALITY for SUSTAINABILITY</p>
                                </div>
                            </div>
                            <p className="text-sm italic underline">LILL Continuation Sheet...........</p>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};