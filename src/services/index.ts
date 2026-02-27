// Export all services from a single location
export { default as apiClient } from './api';
export { default as authService } from './authService';
export { default as crfService } from './crfService';
export { default as requestService } from './requestService';
export { default as quotationService } from './quotationService';
export { default as sampleService } from './sampleService';
export { default as chemistService } from './chemistService';

// Export types
export type { LoginRequest, LoginResponse, RegisterRequest, ApiResponse } from './authService';
export type { CRF } from './crfService';
export type { Request } from './requestService';
export type { Quotation, QuotationItem } from './quotationService';
export type { Sample } from './sampleService';
export type { Chemist, ChemistWorkload } from './chemistService';

