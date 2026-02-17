import React, { createContext, useContext, useState, type ReactNode } from 'react';
import { mockSamples, type Sample } from '../data/mockData';

export interface RequestData {
    id: string;
    customer: string;
    address: string;
    contact: string;
    email: string;
    sampleType: string;
    testParameters: string[];
    numberOfSamples: number;
    samplingType: string;
    date: string;
    priority: string;
    status: 'pending' | 'confirmed';
}

export interface QuotationData {
    requestId: string;
    customer: string;
    address: string;
    contact: string;
    email: string;
    sampleType: string;
    numberOfSamples: number;
    samplingType: string;
    priority: string;
    parameters: {
        name: string;
        unitPrice: number;
        quantity: number;
        total: number;
    }[];
    grandTotal: number;
    signature: string;
    approved: boolean;
}

export interface SampleData {
    id: string; // CS/25/001, LS/25/002
    description: string;
    submissionDetail: string;
    testValue?: string;
    remarks?: string;
    image?: string; // Base64 encoded image (optional)
}

export interface CRFData {
    id: string;
    crfType: 'CS' | 'LS'; // Customer Sample or Lab Sample
    customer: string;
    address: string;
    contact: string;
    email: string;
    sampleType: string;
    testParameters: string[];
    numberOfSamples: number;
    samples: SampleData[]; // Auto-generated sample IDs
    samplingType: string;
    receptionDate: string;
    receivedBy: string;
    signature: string;
    date: string;
    priority: string;
    quotationRef?: string; // Optional - for samples with quotation
    status: 'draft' | 'submitted' | 'assigned' | 'testing' | 'review' | 'approved' | 'completed';
    createdAt: string;
    sampleImages?: string[]; // Optional array of base64 images for samples
}

export interface ParameterAssignment {
    crfId: string;
    sampleId: string;
    parameter: string;
    unit: string;
    method: string;
    chemist: string;
    dueDate: string;
}

export interface TestResult {
    crfId: string;
    sampleId: string;
    parameter: string;
    testValue: string;
    remarks: string;
    testedBy: string;
    testedDate: string;
}

export interface ReviewData {
    crfId: string;
    reviewedBy: string;
    signature: string;
    status: 'approved' | 'rejected';
    comments: string;
    reviewDate: string;
}

export interface WorkflowState {
    // Request
    requests: RequestData[];
    addRequest: (data: Omit<RequestData, 'id' | 'status'>) => void;
    updateRequestStatus: (id: string, status: 'pending' | 'confirmed') => void;
    getConfirmedRequests: () => RequestData[];

    // Quotation
    quotations: QuotationData[];
    createQuotation: (data: QuotationData) => void;
    updateQuotation: (requestId: string, data: QuotationData) => void;

    // CRF - New centralized system
    crfs: CRFData[];
    addCRF: (data: Omit<CRFData, 'id' | 'samples' | 'createdAt' | 'status'>) => void;
    updateCRF: (id: string, data: Partial<CRFData>) => void;
    updateCRFStatus: (id: string, status: CRFData['status']) => void;
    getCRFById: (id: string) => CRFData | undefined;
    getCRFsByStatus: (status: CRFData['status']) => CRFData[];

    // Parameter Assignment
    assignments: ParameterAssignment[];
    assignmentsLocked: boolean;
    setAssignments: (assignments: ParameterAssignment[]) => void;
    lockAssignments: () => void;

    // Test Results
    testResults: TestResult[];
    addTestResult: (result: TestResult) => void;
    updateTestResult: (crfId: string, sampleId: string, data: Partial<TestResult>) => void;

    // Review
    reviews: ReviewData[];
    addReview: (review: ReviewData) => void;

    // Legacy (for backward compatibility)
    samples: Sample[];
    resultsStatus: string;
    updateSampleResult: (ref: string, value: string, remarks: string) => void;
    submitResults: () => void;
    reviewStatus: string;
    approveResults: (supervisorName: string, signature: string) => void;
    supervisorName: string;
    supervisorSignature: string;
}

const WorkflowContext = createContext<WorkflowState | undefined>(undefined);

export const WorkflowProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [requests, setRequests] = useState<RequestData[]>([]);
    const [quotations, setQuotations] = useState<QuotationData[]>([]);
    const [crfs, setCRFs] = useState<CRFData[]>([]);
    const [assignments, setAssignmentsData] = useState<ParameterAssignment[]>([]);
    const [assignmentsLocked, setAssignmentsLocked] = useState(false);
    const [testResults, setTestResults] = useState<TestResult[]>([]);
    const [reviews, setReviews] = useState<ReviewData[]>([]);

    // Legacy state
    const [samples, setSamples] = useState<Sample[]>(mockSamples);
    const [resultsStatus, setResultsStatus] = useState('Pending');
    const [reviewStatus, setReviewStatus] = useState('Pending');
    const [supervisorName, setSupervisorName] = useState('');
    const [supervisorSignature, setSupervisorSignature] = useState('');

    // Counter for generating unique IDs
    const [csCounter, setCSCounter] = useState(1);
    const [lsCounter, setLSCounter] = useState(1);

    const addRequest = (data: Omit<RequestData, 'id' | 'status'>) => {
        const newRequest: RequestData = {
            ...data,
            id: `REQ-${Date.now()}`,
            status: 'pending',
        };
        setRequests(prev => [...prev, newRequest]);
    };

    const updateRequestStatus = (id: string, status: 'pending' | 'confirmed') => {
        setRequests(prev =>
            prev.map(req => (req.id === id ? { ...req, status } : req))
        );
    };

    const getConfirmedRequests = () => {
        return requests.filter(req => req.status === 'confirmed');
    };

    const createQuotation = (data: QuotationData) => {
        setQuotations(prev => [...prev, data]);
    };

    const updateQuotation = (requestId: string, data: QuotationData) => {
        setQuotations(prev =>
            prev.map(quot => (quot.requestId === requestId ? data : quot))
        );
    };

    // New CRF Functions
    const generateSampleIds = (crfType: 'CS' | 'LS', numberOfSamples: number, startCounter: number): SampleData[] => {
        const year = new Date().getFullYear().toString().slice(-2);
        const samples: SampleData[] = [];
        
        for (let i = 0; i < numberOfSamples; i++) {
            const counter = startCounter + i;
            const sampleId = `${crfType}/${year}/${counter.toString().padStart(3, '0')}`;
            samples.push({
                id: sampleId,
                description: `Sample ${i + 1}`,
                submissionDetail: '1L in plastic container',
            });
        }
        
        return samples;
    };

    const addCRF = (data: Omit<CRFData, 'id' | 'samples' | 'createdAt' | 'status'>) => {
        const counter = data.crfType === 'CS' ? csCounter : lsCounter;
        const year = new Date().getFullYear().toString().slice(-2);
        const crfId = `${data.crfType}/${year}/${counter.toString().padStart(3, '0')}`;
        
        const samples = generateSampleIds(data.crfType, data.numberOfSamples, counter);
        
        const newCRF: CRFData = {
            ...data,
            id: crfId,
            samples,
            status: 'draft',
            createdAt: new Date().toISOString(),
        };

        setCRFs(prev => [...prev, newCRF]);
        
        // Update counter
        if (data.crfType === 'CS') {
            setCSCounter(prev => prev + data.numberOfSamples);
        } else {
            setLSCounter(prev => prev + data.numberOfSamples);
        }
    };

    const updateCRF = (id: string, data: Partial<CRFData>) => {
        setCRFs(prev =>
            prev.map(crf => (crf.id === id ? { ...crf, ...data } : crf))
        );
    };

    const updateCRFStatus = (id: string, status: CRFData['status']) => {
        setCRFs(prev =>
            prev.map(crf => (crf.id === id ? { ...crf, status } : crf))
        );
    };

    const getCRFById = (id: string) => {
        return crfs.find(crf => crf.id === id);
    };

    const getCRFsByStatus = (status: CRFData['status']) => {
        return crfs.filter(crf => crf.status === status);
    };

    const setAssignments = (newAssignments: ParameterAssignment[]) => {
        setAssignmentsData(newAssignments);
    };

    const lockAssignments = () => {
        setAssignmentsLocked(true);
    };

    const addTestResult = (result: TestResult) => {
        setTestResults(prev => [...prev, result]);
    };

    const updateTestResult = (crfId: string, sampleId: string, data: Partial<TestResult>) => {
        setTestResults(prev =>
            prev.map(result =>
                result.crfId === crfId && result.sampleId === sampleId
                    ? { ...result, ...data }
                    : result
            )
        );
    };

    const addReview = (review: ReviewData) => {
        setReviews(prev => [...prev, review]);
    };

    // Legacy functions
    const updateSampleResult = (ref: string, value: string, remarks: string) => {
        setSamples(prev =>
            prev.map(s => (s.ref === ref ? { ...s, testValue: value, remarks } : s))
        );
    };

    const submitResults = () => {
        setResultsStatus('Results Submitted');
    };

    const approveResults = (name: string, signature: string) => {
        setSupervisorName(name);
        setSupervisorSignature(signature);
        setReviewStatus('Approved');
    };

    return (
        <WorkflowContext.Provider
            value={{
                requests,
                addRequest,
                updateRequestStatus,
                getConfirmedRequests,
                quotations,
                createQuotation,
                updateQuotation,
                crfs,
                addCRF,
                updateCRF,
                updateCRFStatus,
                getCRFById,
                getCRFsByStatus,
                assignments,
                assignmentsLocked,
                setAssignments,
                lockAssignments,
                testResults,
                addTestResult,
                updateTestResult,
                reviews,
                addReview,
                samples,
                resultsStatus,
                updateSampleResult,
                submitResults,
                reviewStatus,
                approveResults,
                supervisorName,
                supervisorSignature,
            }}
        >
            {children}
        </WorkflowContext.Provider>
    );
};

export const useWorkflow = () => {
    const context = useContext(WorkflowContext);
    if (!context) {
        throw new Error('useWorkflow must be used within WorkflowProvider');
    }
    return context;
};
