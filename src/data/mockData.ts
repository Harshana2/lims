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
    sampleTypes: string[]; // Which sample types this parameter applies to
}

export interface Chemist {
    id: string;
    name: string;
}

export interface SampleTypeConfig {
    name: string;
    parameters: string[]; // Parameter names that apply to this sample type
}

export interface ScheduledCollection {
    id: string;
    customerId: string;
    customerName: string;
    sampleType: string;
    collectionDate: string; // ISO date string
    address: string;
    contact: string;
    notes: string;
    status: 'scheduled' | 'collected' | 'cancelled';
}

export const mockCustomers: Customer[] = [
    {
        id: '1',
        name: 'Edinburgh Products (Pvt) Ltd',
        address: 'Padukka',
        contact: 'Mr. John Silva',
        email: 'john@edinburgh.lk',
    },
    {
        id: '2',
        name: 'Green Valley Industries',
        address: 'Katunayake',
        contact: 'Ms. Sarah Fernando',
        email: 'sarah@greenvalley.lk',
    },
    {
        id: '3',
        name: 'Ocean Foods Ltd',
        address: 'Negombo',
        contact: 'Mr. Rajesh Kumar',
        email: 'rajesh@oceanfoods.lk',
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
    // Wastewater parameters
    { name: 'COD', unit: 'mg/L', method: 'APHA 5220 D', defaultPrice: 2500, sampleTypes: ['Wastewater', 'Industrial Effluent'] },
    { name: 'BOD', unit: 'mg/L', method: 'APHA 5210 B', defaultPrice: 3000, sampleTypes: ['Wastewater', 'Industrial Effluent'] },
    { name: 'pH', unit: 'pH units', method: 'APHA 4500-H+ B', defaultPrice: 500, sampleTypes: ['Wastewater', 'Drinking Water', 'Industrial Effluent', 'Soil'] },
    { name: 'Total Suspended Solids', unit: 'mg/L', method: 'APHA 2540 D', defaultPrice: 1500, sampleTypes: ['Wastewater', 'Industrial Effluent', 'Drinking Water'] },
    { name: 'Oil & Grease', unit: 'mg/L', method: 'APHA 5520 B', defaultPrice: 3500, sampleTypes: ['Wastewater', 'Industrial Effluent'] },
    { name: 'Total Nitrogen', unit: 'mg/L', method: 'APHA 4500-N', defaultPrice: 2800, sampleTypes: ['Wastewater', 'Industrial Effluent'] },
    { name: 'Total Phosphorus', unit: 'mg/L', method: 'APHA 4500-P', defaultPrice: 2600, sampleTypes: ['Wastewater', 'Industrial Effluent'] },
    
    // Drinking Water parameters
    { name: 'Total Coliform', unit: 'CFU/100mL', method: 'APHA 9221 B', defaultPrice: 2000, sampleTypes: ['Drinking Water'] },
    { name: 'E. coli', unit: 'CFU/100mL', method: 'APHA 9221 F', defaultPrice: 2500, sampleTypes: ['Drinking Water', 'Food'] },
    { name: 'Turbidity', unit: 'NTU', method: 'APHA 2130 B', defaultPrice: 800, sampleTypes: ['Drinking Water', 'Wastewater'] },
    { name: 'Chlorine (Free)', unit: 'mg/L', method: 'APHA 4500-Cl B', defaultPrice: 600, sampleTypes: ['Drinking Water'] },
    { name: 'Total Hardness', unit: 'mg/L as CaCO3', method: 'APHA 2340 C', defaultPrice: 1200, sampleTypes: ['Drinking Water'] },
    { name: 'Iron', unit: 'mg/L', method: 'APHA 3500-Fe B', defaultPrice: 1500, sampleTypes: ['Drinking Water', 'Wastewater'] },
    
    // Noise parameters (Environmental)
    { name: 'Noise Level', unit: 'dB(A)', method: 'ISO 1996-2', defaultPrice: 3000, sampleTypes: ['Noise'] },
    { name: 'Peak Noise', unit: 'dB(A)', method: 'ISO 1996-2', defaultPrice: 3500, sampleTypes: ['Noise'] },
    { name: 'Background Noise', unit: 'dB(A)', method: 'ISO 1996-2', defaultPrice: 2800, sampleTypes: ['Noise'] },
    
    // Soil parameters
    { name: 'Moisture Content', unit: '%', method: 'ASTM D2216', defaultPrice: 1800, sampleTypes: ['Soil'] },
    { name: 'Organic Matter', unit: '%', method: 'ASTM D2974', defaultPrice: 2200, sampleTypes: ['Soil'] },
    { name: 'Heavy Metals (Lead)', unit: 'mg/kg', method: 'EPA 3050B', defaultPrice: 4000, sampleTypes: ['Soil'] },
    { name: 'Heavy Metals (Cadmium)', unit: 'mg/kg', method: 'EPA 3050B', defaultPrice: 4000, sampleTypes: ['Soil'] },
    
    // Food parameters
    { name: 'Total Plate Count', unit: 'CFU/g', method: 'ISO 4833', defaultPrice: 2500, sampleTypes: ['Food'] },
    { name: 'Salmonella', unit: 'Presence/25g', method: 'ISO 6579', defaultPrice: 3500, sampleTypes: ['Food'] },
    { name: 'Moisture Content (Food)', unit: '%', method: 'AOAC 925.10', defaultPrice: 1500, sampleTypes: ['Food'] },
    { name: 'Fat Content', unit: '%', method: 'AOAC 922.06', defaultPrice: 2000, sampleTypes: ['Food'] },
];

export const sampleTypeConfigs: SampleTypeConfig[] = [
    {
        name: 'Wastewater',
        parameters: ['COD', 'BOD', 'pH', 'Total Suspended Solids', 'Oil & Grease', 'Total Nitrogen', 'Total Phosphorus', 'Turbidity', 'Iron']
    },
    {
        name: 'Drinking Water',
        parameters: ['Total Coliform', 'E. coli', 'pH', 'Turbidity', 'Chlorine (Free)', 'Total Hardness', 'Iron', 'Total Suspended Solids']
    },
    {
        name: 'Industrial Effluent',
        parameters: ['COD', 'BOD', 'pH', 'Total Suspended Solids', 'Oil & Grease', 'Total Nitrogen', 'Total Phosphorus']
    },
    {
        name: 'Noise',
        parameters: ['Noise Level', 'Peak Noise', 'Background Noise']
    },
    {
        name: 'Soil',
        parameters: ['pH', 'Moisture Content', 'Organic Matter', 'Heavy Metals (Lead)', 'Heavy Metals (Cadmium)']
    },
    {
        name: 'Food',
        parameters: ['Total Plate Count', 'E. coli', 'Salmonella', 'Moisture Content (Food)', 'Fat Content']
    }
];

export const mockScheduledCollections: ScheduledCollection[] = [
    {
        id: 'SC-001',
        customerId: '1',
        customerName: 'Edinburgh Products (Pvt) Ltd',
        sampleType: 'Wastewater',
        collectionDate: '2026-02-21T10:00:00',
        address: 'Padukka',
        contact: 'Mr. John Silva',
        notes: 'Collect from main drainage outlet',
        status: 'scheduled'
    },
    {
        id: 'SC-002',
        customerId: '2',
        customerName: 'Green Valley Industries',
        sampleType: 'Noise',
        collectionDate: '2026-02-23T14:00:00',
        address: 'Katunayake',
        contact: 'Ms. Sarah Fernando',
        notes: 'Measure noise levels near production area',
        status: 'scheduled'
    },
    {
        id: 'SC-003',
        customerId: '3',
        customerName: 'Ocean Foods Ltd',
        sampleType: 'Food',
        collectionDate: '2026-02-25T09:00:00',
        address: 'Negombo',
        contact: 'Mr. Rajesh Kumar',
        notes: 'Collect fish samples from cold storage',
        status: 'scheduled'
    },
];

export const mockChemists: Chemist[] = [
    { id: '1', name: 'D.H.S. Costa' },
    { id: '2', name: 'S.A.A.G. Senarathna' },
    { id: '3', name: 'K.M. Perera' },
    { id: '4', name: 'A.B. Jayawardena' },
    { id: '5', name: 'R.P. Silva' },
    { id: '6', name: 'N.T. Fernando' },
];

// Mock data for dashboard charts and analytics
export interface PendingTask {
    id: string;
    crfId: string;
    customer: string;
    sampleType: string;
    taskType: 'Testing' | 'Review' | 'Report Generation';
    assignedTo: string;
    dueDate: string; // ISO date string
    priority: 'Normal' | 'Urgent' | 'Rush';
    status: 'On Track' | 'At Risk' | 'Overdue';
}

export interface ChemistWorkload {
    chemistId: string;
    chemistName: string;
    activeTasks: number;
    completedThisWeek: number;
    pendingTests: number;
    overdueTests: number;
}

export const mockPendingTasks: PendingTask[] = [
    {
        id: 'TASK-001',
        crfId: 'CRF-001',
        customer: 'Edinburgh Products',
        sampleType: 'Wastewater',
        taskType: 'Testing',
        assignedTo: 'D.H.S. Costa',
        dueDate: '2026-02-20',
        priority: 'Urgent',
        status: 'At Risk'
    },
    {
        id: 'TASK-002',
        crfId: 'CRF-002',
        customer: 'Green Valley Industries',
        sampleType: 'Drinking Water',
        taskType: 'Testing',
        assignedTo: 'S.A.A.G. Senarathna',
        dueDate: '2026-02-19',
        priority: 'Rush',
        status: 'Overdue'
    },
    {
        id: 'TASK-003',
        crfId: 'CRF-003',
        customer: 'Ocean Foods Ltd',
        sampleType: 'Food',
        taskType: 'Review',
        assignedTo: 'K.M. Perera',
        dueDate: '2026-02-22',
        priority: 'Normal',
        status: 'On Track'
    },
    {
        id: 'TASK-004',
        crfId: 'CRF-004',
        customer: 'Tech Solutions Inc',
        sampleType: 'Industrial Effluent',
        taskType: 'Testing',
        assignedTo: 'A.B. Jayawardena',
        dueDate: '2026-02-21',
        priority: 'Urgent',
        status: 'On Track'
    },
    {
        id: 'TASK-005',
        crfId: 'CRF-005',
        customer: 'Urban Developers',
        sampleType: 'Noise',
        taskType: 'Report Generation',
        assignedTo: 'R.P. Silva',
        dueDate: '2026-02-23',
        priority: 'Normal',
        status: 'On Track'
    },
];

export const mockChemistWorkload: ChemistWorkload[] = [
    {
        chemistId: '1',
        chemistName: 'D.H.S. Costa',
        activeTasks: 5,
        completedThisWeek: 12,
        pendingTests: 3,
        overdueTests: 0
    },
    {
        chemistId: '2',
        chemistName: 'S.A.A.G. Senarathna',
        activeTasks: 7,
        completedThisWeek: 9,
        pendingTests: 4,
        overdueTests: 1
    },
    {
        chemistId: '3',
        chemistName: 'K.M. Perera',
        activeTasks: 4,
        completedThisWeek: 15,
        pendingTests: 2,
        overdueTests: 0
    },
    {
        chemistId: '4',
        chemistName: 'A.B. Jayawardena',
        activeTasks: 6,
        completedThisWeek: 10,
        pendingTests: 3,
        overdueTests: 0
    },
    {
        chemistId: '5',
        chemistName: 'R.P. Silva',
        activeTasks: 3,
        completedThisWeek: 8,
        pendingTests: 2,
        overdueTests: 0
    },
    {
        chemistId: '6',
        chemistName: 'N.T. Fernando',
        activeTasks: 5,
        completedThisWeek: 11,
        pendingTests: 3,
        overdueTests: 0
    },
];

// Monthly test statistics for charts
export interface MonthlyStats {
    month: string;
    tests: number;
    reports: number;
}

export const mockMonthlyStats: MonthlyStats[] = [
    { month: 'Aug', tests: 145, reports: 140 },
    { month: 'Sep', tests: 168, reports: 165 },
    { month: 'Oct', tests: 192, reports: 188 },
    { month: 'Nov', tests: 210, reports: 205 },
    { month: 'Dec', tests: 178, reports: 175 },
    { month: 'Jan', tests: 195, reports: 190 },
    { month: 'Feb', tests: 89, reports: 85 }, // Current month (partial)
];

export const sampleTypes = ['Wastewater', 'Drinking Water', 'Industrial Effluent', 'Soil', 'Food', 'Noise'];
export const priorities = ['Normal', 'Urgent', 'Rush'];
export const samplingTypes = ['One Time', 'Monthly', 'Quarterly', 'Annually'];

