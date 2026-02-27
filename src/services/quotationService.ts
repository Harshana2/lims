import apiClient from './api';
import type { ApiResponse } from './authService';

export interface QuotationItem {
  parameter: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export interface Quotation {
  id?: number;
  quotationId?: string;
  requestId?: number;
  customer: string;
  items: QuotationItem[];
  subtotal: number;
  tax?: number;
  total: number;
  status: string;
  sentDate?: string;
  approvedDate?: string;
  notes?: string;
  preparedBy?: string;
  approvedBy?: string;
  createdAt?: string;
  updatedAt?: string;
}

export type CreateQuotationDTO = Omit<Quotation, 'id' | 'quotationId' | 'createdAt' | 'updatedAt'>;

const quotationService = {
  async getAll(): Promise<Quotation[]> {
    const response = await apiClient.get<ApiResponse<Quotation[]>>('/quotations');
    return response.data.data;
  },

  async getById(id: number): Promise<Quotation> {
    const response = await apiClient.get<ApiResponse<Quotation>>(`/quotations/${id}`);
    return response.data.data;
  },

  async getByQuotationId(quotationId: string): Promise<Quotation> {
    const response = await apiClient.get<ApiResponse<Quotation>>(`/quotations/quotationId/${quotationId}`);
    return response.data.data;
  },

  async getByRequestId(requestId: number): Promise<Quotation[]> {
    const response = await apiClient.get<ApiResponse<Quotation[]>>(`/quotations/request/${requestId}`);
    return response.data.data;
  },

  async getByStatus(status: string): Promise<Quotation[]> {
    const response = await apiClient.get<ApiResponse<Quotation[]>>(`/quotations/status/${status}`);
    return response.data.data;
  },

  async create(quotation: Quotation): Promise<Quotation> {
    const response = await apiClient.post<ApiResponse<Quotation>>('/quotations', quotation);
    return response.data.data;
  },

  async update(id: number, quotation: Partial<Quotation>): Promise<Quotation> {
    const response = await apiClient.put<ApiResponse<Quotation>>(`/quotations/${id}`, quotation);
    return response.data.data;
  },

  async updateStatus(id: number, status: string): Promise<Quotation> {
    const response = await apiClient.patch<ApiResponse<Quotation>>(`/quotations/${id}/status?status=${status}`);
    return response.data.data;
  },

  async delete(id: number): Promise<void> {
    await apiClient.delete(`/quotations/${id}`);
  },
};

export default quotationService;
