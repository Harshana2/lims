import apiClient from './api';
import type { ApiResponse } from './authService';

export interface CRF {
  id?: number;
  crfId: string;
  crfType: string;
  customer: string;
  address?: string;
  contact?: string;
  email?: string;
  sampleType: string;
  testParameters: string[];
  numberOfSamples: number;
  samplingType?: string;
  receptionDate: string;
  receivedBy?: string;
  signature?: string;
  priority: string;
  status: string;
  quotationRef?: string;
  sampleImages?: string[];
  createdAt?: string;
  updatedAt?: string;
}

const crfService = {
  async getAll(): Promise<CRF[]> {
    const response = await apiClient.get<ApiResponse<CRF[]>>('/crf');
    return response.data.data;
  },

  async getById(id: number): Promise<CRF> {
    const response = await apiClient.get<ApiResponse<CRF>>(`/crf/${id}`);
    return response.data.data;
  },

  async getByCrfId(crfId: string): Promise<CRF> {
    const response = await apiClient.get<ApiResponse<CRF>>(`/crf/crfId/${crfId}`);
    return response.data.data;
  },

  async getByStatus(status: string): Promise<CRF[]> {
    const response = await apiClient.get<ApiResponse<CRF[]>>(`/crf/status/${status}`);
    return response.data.data;
  },

  async getByCustomer(customer: string): Promise<CRF[]> {
    const response = await apiClient.get<ApiResponse<CRF[]>>(`/crf/customer/${customer}`);
    return response.data.data;
  },

  async create(crf: CRF): Promise<CRF> {
    const response = await apiClient.post<ApiResponse<CRF>>('/crf', crf);
    return response.data.data;
  },

  async update(id: number, crf: Partial<CRF>): Promise<CRF> {
    const response = await apiClient.put<ApiResponse<CRF>>(`/crf/${id}`, crf);
    return response.data.data;
  },

  async updateStatus(id: number, status: string): Promise<CRF> {
    const response = await apiClient.patch<ApiResponse<CRF>>(`/crf/${id}/status?status=${status}`);
    return response.data.data;
  },

  async delete(id: number): Promise<void> {
    await apiClient.delete(`/crf/${id}`);
  },

  async countByStatus(status: string): Promise<number> {
    const response = await apiClient.get<ApiResponse<number>>(`/crf/count/${status}`);
    return response.data.data;
  },
};

export default crfService;
