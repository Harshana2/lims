import apiClient from './api';
import type { ApiResponse } from './authService';

export interface Sample {
  id?: number;
  sampleId: string;
  description: string;
  submissionDetail?: string;
  status: string;
  assignedTo?: string;
  testValues?: Record<string, string>;
  testStatus?: Record<string, string>;
  assignedDate?: string;
  completedDate?: string;
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
}

const sampleService = {
  async getAll(): Promise<Sample[]> {
    const response = await apiClient.get<ApiResponse<Sample[]>>('/samples');
    return response.data.data;
  },

  async getById(id: number): Promise<Sample> {
    const response = await apiClient.get<ApiResponse<Sample>>(`/samples/${id}`);
    return response.data.data;
  },

  async getByCrfId(crfId: number): Promise<Sample[]> {
    const response = await apiClient.get<ApiResponse<Sample[]>>(`/samples/crf/${crfId}`);
    return response.data.data;
  },

  async getByStatus(status: string): Promise<Sample[]> {
    const response = await apiClient.get<ApiResponse<Sample[]>>(`/samples/status/${status}`);
    return response.data.data;
  },

  async getByChemist(chemist: string): Promise<Sample[]> {
    const response = await apiClient.get<ApiResponse<Sample[]>>(`/samples/chemist/${chemist}`);
    return response.data.data;
  },

  async assignToChemist(id: number, chemist: string): Promise<Sample> {
    const response = await apiClient.patch<ApiResponse<Sample>>(`/samples/${id}/assign?chemist=${chemist}`);
    return response.data.data;
  },

  async updateTestValues(id: number, testValues: Record<string, string>): Promise<Sample> {
    const response = await apiClient.patch<ApiResponse<Sample>>(`/samples/${id}/test-values`, testValues);
    return response.data.data;
  },

  async updateStatus(id: number, status: string): Promise<Sample> {
    const response = await apiClient.patch<ApiResponse<Sample>>(`/samples/${id}/status?status=${status}`);
    return response.data.data;
  },

  async update(id: number, sample: Partial<Sample>): Promise<Sample> {
    const response = await apiClient.put<ApiResponse<Sample>>(`/samples/${id}`, sample);
    return response.data.data;
  },
};

export default sampleService;
