import apiClient from './api';

export interface LoginRequest {
  username: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  password: string;
  name: string;
  email: string;
  role: string;
}

export interface LoginResponse {
  token: string;
  type: string;
  username: string;
  name: string;
  email: string;
  role: string;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

const authService = {
  async login(credentials: LoginRequest): Promise<LoginResponse> {
    const response = await apiClient.post<ApiResponse<LoginResponse>>('/auth/login', credentials);
    const { data } = response.data;
    
    // Store token and user info
    localStorage.setItem('authToken', data.token);
    localStorage.setItem('user', JSON.stringify(data));
    
    return data;
  },

  async register(userData: RegisterRequest): Promise<any> {
    const response = await apiClient.post<ApiResponse<any>>('/auth/register', userData);
    return response.data.data;
  },

  logout() {
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    window.location.href = '/login';
  },

  getCurrentUser() {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  },

  isAuthenticated(): boolean {
    return !!localStorage.getItem('authToken');
  },
};

export default authService;
