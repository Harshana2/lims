export interface Customer {
    id: string;
    name: string;
    address: string;
    contact: string;
    email: string;
}

export interface Sample {
    ref: string;
    description: string;
    submissionDetail: string;
    testValue?: string;
    remarks?: string;
}

export interface Parameter {
    name: string;
    unit: string;
    method: string;
    defaultPrice: number;
}

export interface Chemist {
    id: string;
    name: string;
}

export const mockCustomers: Customer[] = [
    {
        id: '1',
        name: 'Edinburgh Products (Pvt) Ltd',
        address: 'Padukka',
        contact: 'Mr. John Silva',
        email: 'john@edinburgh.lk',
    },
];

export const mockSamples: Sample[] = [
    { ref: 'CS/25/886', description: 'Wastewater Sample 1', submissionDetail: '1L in plastic container', testValue: '3.3 × 10³' },
    { ref: 'CS/25/887', description: 'Wastewater Sample 2', submissionDetail: '1L in plastic container', testValue: '1430' },
    { ref: 'CS/25/888', description: 'Wastewater Sample 3', submissionDetail: '1L in plastic container', testValue: '1503' },
    { ref: 'CS/25/889', description: 'Wastewater Sample 4', submissionDetail: '1L in plastic container', testValue: '1670' },
    { ref: 'CS/25/890', description: 'Wastewater Sample 5', submissionDetail: '1L in plastic container', testValue: '1608' },
];

export const mockParameters: Parameter[] = [
    { name: 'COD', unit: 'mg/L', method: 'APHA 5220 D', defaultPrice: 2500 },
    { name: 'BOD', unit: 'mg/L', method: 'APHA 5210 B', defaultPrice: 3000 },
    { name: 'pH', unit: 'pH units', method: 'APHA 4500-H+ B', defaultPrice: 500 },
    { name: 'Total Suspended Solids', unit: 'mg/L', method: 'APHA 2540 D', defaultPrice: 1500 },
    { name: 'Oil & Grease', unit: 'mg/L', method: 'APHA 5520 B', defaultPrice: 3500 },
];

export const mockChemists: Chemist[] = [
    { id: '1', name: 'D.H.S. Costa' },
    { id: '2', name: 'S.A.A.G. Senarathna' },
];

export const sampleTypes = ['Wastewater', 'Drinking Water', 'Industrial Effluent', 'Soil', 'Food'];
export const priorities = ['Normal', 'Urgent'];
export const samplingTypes = ['Customer Submission', 'Lab Service'];
