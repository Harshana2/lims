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

export interface CRFData {
    receptionDate: string;
    signature: string;
    approved: boolean;
}

export interface ParameterAssignment {
    sampleRef: string;
    parameter: string;
    unit: string;
    method: string;
    chemist: string;
    dueDate: string;
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

    // CRF
    crf: CRFData | null;
    crfStatus: string;
    saveCRF: (data: CRFData) => void;

    // Parameter Assignment
    assignments: ParameterAssignment[];
    assignmentsLocked: boolean;
    setAssignments: (assignments: ParameterAssignment[]) => void;
    lockAssignments: () => void;

    // Data Entry
    samples: Sample[];
    resultsStatus: string;
    updateSampleResult: (ref: string, value: string, remarks: string) => void;
    submitResults: () => void;

    // Review
    reviewStatus: string;
    approveResults: (supervisorName: string, signature: string) => void;
    supervisorName: string;
    supervisorSignature: string;
}

const WorkflowContext = createContext<WorkflowState | undefined>(undefined);

export const WorkflowProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [requests, setRequests] = useState<RequestData[]>([]);
    const [quotations, setQuotations] = useState<QuotationData[]>([]);

    const [crf, setCRF] = useState<CRFData | null>(null);
    const [crfStatus, setCRFStatus] = useState('Pending');

    const [assignments, setAssignmentsData] = useState<ParameterAssignment[]>([]);
    const [assignmentsLocked, setAssignmentsLocked] = useState(false);

    const [samples, setSamples] = useState<Sample[]>(mockSamples);
    const [resultsStatus, setResultsStatus] = useState('Pending');

    const [reviewStatus, setReviewStatus] = useState('Pending');
    const [supervisorName, setSupervisorName] = useState('');
    const [supervisorSignature, setSupervisorSignature] = useState('');

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

    const saveCRF = (data: CRFData) => {
        setCRF(data);
        setCRFStatus('CRF Approved');
    };

    const setAssignments = (newAssignments: ParameterAssignment[]) => {
        setAssignmentsData(newAssignments);
    };

    const lockAssignments = () => {
        setAssignmentsLocked(true);
    };

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
                crf,
                crfStatus,
                saveCRF,
                assignments,
                assignmentsLocked,
                setAssignments,
                lockAssignments,
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
