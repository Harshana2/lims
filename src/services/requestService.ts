import apiClient from './api';
import type { ApiResponse } from './authService';

export interface Request {
  id?: number;
  requestId?: string;
  customer: string;
  contact?: string;
  email?: string;
  address?: string;
  sampleType: string;
  parameters: string[];
  numberOfSamples: number;
  priority: string;
  status: string;
  quotationId?: number;
  crfId?: number;
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
}

export type CreateRequestDTO = Omit<Request, 'id' | 'requestId' | 'createdAt' | 'updatedAt'>;

const requestService = {
  async getAll(): Promise<Request[]> {
    const response = await apiClient.get<ApiResponse<Request[]>>('/requests');
    return response.data.data;
  },

  async getById(id: number): Promise<Request> {
    const response = await apiClient.get<ApiResponse<Request>>(`/requests/${id}`);
    return response.data.data;
  },

  async getByRequestId(requestId: string): Promise<Request> {
    const response = await apiClient.get<ApiResponse<Request>>(`/requests/requestId/${requestId}`);
    return response.data.data;
  },

  async getByStatus(status: string): Promise<Request[]> {
    const response = await apiClient.get<ApiResponse<Request[]>>(`/requests/status/${status}`);
    return response.data.data;
  },

  async create(request: CreateRequestDTO): Promise<Request> {
    const response = await apiClient.post<ApiResponse<Request>>('/requests', request);
    return response.data.data;
  },

  async update(id: number, request: Partial<Request>): Promise<Request> {
    const response = await apiClient.put<ApiResponse<Request>>(`/requests/${id}`, request);
    return response.data.data;
  },

  async updateStatus(id: number, status: string): Promise<Request> {
    const response = await apiClient.patch<ApiResponse<Request>>(`/requests/${id}/status?status=${status}`);
    return response.data.data;
  },

  async delete(id: number): Promise<void> {
    await apiClient.delete(`/requests/${id}`);
  },
};

export default requestService;
