import apiClient from './api';

export interface Chemist {
  id: number;
  name: string;
  email: string;
  specialization: string;
  currentWorkload: number;
  maxWorkload: number;
  available: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface ChemistWorkload {
  chemistId: number;
  chemistName: string;
  assignedSamples: number;
  completedSamples: number;
  pendingSamples: number;
  workloadPercentage: number;
}

const chemistService = {
  // Get all chemists
  getAll: async (): Promise<Chemist[]> => {
    const response = await apiClient.get('/chemists');
    return response.data.data;
  },

  // Get chemist by ID
  getById: async (id: number): Promise<Chemist> => {
    const response = await apiClient.get(`/chemists/${id}`);
    return response.data.data;
  },

  // Get available chemists (not at max workload)
  getAvailable: async (): Promise<Chemist[]> => {
    const response = await apiClient.get('/chemists/available');
    return response.data.data;
  },

  // Get chemist by name
  getByName: async (name: string): Promise<Chemist> => {
    const response = await apiClient.get(`/chemists/name/${name}`);
    return response.data.data;
  },

  // Get chemist workload statistics
  getWorkload: async (id: number): Promise<ChemistWorkload> => {
    const response = await apiClient.get(`/chemists/${id}/workload`);
    return response.data.data;
  },

  // Create new chemist
  create: async (chemist: Omit<Chemist, 'id' | 'createdAt' | 'updatedAt'>): Promise<Chemist> => {
    const response = await apiClient.post('/chemists', chemist);
    return response.data.data;
  },

  // Update chemist
  update: async (id: number, chemist: Partial<Chemist>): Promise<Chemist> => {
    const response = await apiClient.put(`/chemists/${id}`, chemist);
    return response.data.data;
  },

  // Update workload
  updateWorkload: async (id: number, workload: number): Promise<Chemist> => {
    const response = await apiClient.patch(`/chemists/${id}/workload`, { currentWorkload: workload });
    return response.data.data;
  },

  // Delete chemist
  delete: async (id: number): Promise<void> => {
    await apiClient.delete(`/chemists/${id}`);
  }
};

export default chemistService;
