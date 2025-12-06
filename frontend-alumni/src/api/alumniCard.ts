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

const MOCK_CARD: AlumniCard = {
  id: '1',
  cardNumber: 'ALM-2016-001234',
  name: 'Rahul Sharma',
  email: 'rahul.sharma@example.com',
  degree: 'B.Tech Computer Science',
  gradYear: '2016',
  department: 'Computer Science',
  university: 'Delhi University',
  avatarUrl: '/profile.jpeg',
  qrCode: 'https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=ALM-2016-001234',
  issueDate: '2025-01-01T00:00:00Z',
  expiryDate: '2030-01-01T00:00:00Z',
  status: 'active',
};

export const getAlumniCard = async (): Promise<AlumniCard> => {
  try {
    const response = await apiClient.get<ApiResponse<AlumniCard>>('/alumni/card');
    return response.data.data;
  } catch { return MOCK_CARD; }
};

export const requestAlumniCard = async (): Promise<AlumniCard> => {
  const response = await apiClient.post<ApiResponse<AlumniCard>>('/alumni/card/request');
  return response.data.data;
};

export const verifyAlumniCard = async (cardNumber: string): Promise<{ valid: boolean; alumni?: AlumniCard }> => {
  try {
    const response = await apiClient.get<ApiResponse<{ valid: boolean; alumni?: AlumniCard }>>(`/alumni/card/verify/${cardNumber}`);
    return response.data.data;
  } catch { return { valid: false }; }
};
