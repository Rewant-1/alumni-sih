import apiClient, { ApiResponse } from './apiClient';

export interface AlumniCard {
  id: string;
  cardNumber: string;
  name: string;
  email: string;
  degree: string;
  gradYear: string;
  department: string;
  university: string;
  avatarUrl?: string;
  qrCode: string;
  issueDate: string;
  expiryDate: string;
  status: 'active' | 'expired' | 'pending';
}

// API Functions (mock data removed)

export const getAlumniCard = async (): Promise<AlumniCard> => {
  const response = await apiClient.get<ApiResponse<AlumniCard>>('/alumni-card');
  return response.data.data;
};

export const requestAlumniCard = async (): Promise<AlumniCard> => {
  const response = await apiClient.post<ApiResponse<AlumniCard>>('/alumni-card/request');
  return response.data.data;
};

export const verifyAlumniCard = async (cardNumber: string): Promise<{ valid: boolean; alumni?: AlumniCard }> => {
  const response = await apiClient.get<ApiResponse<{ valid: boolean; alumni?: AlumniCard }>>(`/alumni-card/verify/${cardNumber}`);
  return response.data.data;
};
