import apiClient from './api';

export interface ReportTemplate {
    id?: number;
    name: string;
    description?: string;
    templateType: string; // "standard", "custom", "summary"
    
    // Header Section
    headerContent?: string;
    includeCompanyLogo?: boolean;
    includeLabDetails?: boolean;
    
    // Report Body Configuration
    includeCRFDetails?: boolean;
    includeSampleDetails?: boolean;
    includeTestResults?: boolean;
    includeTestMethods?: boolean;
    includeChemistInfo?: boolean;
    
    // Footer Section
    footerContent?: string;
    includeSignatures?: boolean;
    includePageNumbers?: boolean;
    includeGeneratedDate?: boolean;
    
    // Layout & Styling
    pageSize?: string; // "A4", "Letter", "Legal"
    orientation?: string; // "portrait", "landscape"
    customCSS?: string;
    
    // Additional Sections
    additionalNotes?: string;
    disclaimer?: string;
    
    // Metadata
    createdBy?: string;
    createdAt?: string;
    updatedAt?: string;
    isDefault?: boolean;
    isActive?: boolean;
}

const reportTemplateService = {
    // Get all templates
    getAll: async () => {
        const response = await apiClient.get('/report-templates');
        return response.data.data;
    },

    // Get active templates
    getActive: async () => {
        const response = await apiClient.get('/report-templates/active');
        return response.data.data;
    },

    // Get template by ID
    getById: async (id: number) => {
        const response = await apiClient.get(`/report-templates/${id}`);
        return response.data.data;
    },

    // Get default template
    getDefault: async () => {
        const response = await apiClient.get('/report-templates/default');
        return response.data.data;
    },

    // Get templates by type
    getByType: async (type: string) => {
        const response = await apiClient.get(`/report-templates/type/${type}`);
        return response.data.data;
    },

    // Create new template
    create: async (template: ReportTemplate) => {
        const response = await apiClient.post('/report-templates', template);
        return response.data.data;
    },

    // Update template
    update: async (id: number, template: ReportTemplate) => {
        const response = await apiClient.put(`/report-templates/${id}`, template);
        return response.data.data;
    },

    // Delete template
    delete: async (id: number) => {
        const response = await apiClient.delete(`/report-templates/${id}`);
        return response.data.data;
    },

    // Set template as default
    setAsDefault: async (id: number) => {
        const response = await apiClient.patch(`/report-templates/${id}/set-default`);
        return response.data.data;
    },

    // Toggle active status
    toggleActive: async (id: number) => {
        const response = await apiClient.patch(`/report-templates/${id}/toggle-active`);
        return response.data.data;
    },
};

export default reportTemplateService;
