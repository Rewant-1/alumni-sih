import apiClient, { ApiResponse, PaginationParams, PaginatedResponse } from './apiClient';

// Types
export interface Connection {
  id: string;
  user: {
    id: string;
    name: string;
    email: string;
    avatarUrl?: string;
    currentRole?: string;
    currentCompany?: string;
    gradYear?: string;
  };
  connectedAt: string;
}

export interface ConnectionRequest {
  id: string;
  from: {
    id: string;
    name: string;
    email: string;
    avatarUrl?: string;
    currentRole?: string;
    currentCompany?: string;
    gradYear?: string;
  };
  to: { id: string; name: string };
  message?: string;
  status: 'pending' | 'accepted' | 'rejected';
  createdAt: string;
}

export interface ConnectionSuggestion {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
  currentRole?: string;
  currentCompany?: string;
  gradYear?: string;
  mutualConnections: number;
  reason: string;
}

// API Functions (mock data removed)

// API Functions
// Note: Backend routes are under /connections prefix
// /connections/connections - get all
// /connections/send-request - send request
// /connections/accept-request, /connections/reject-request
export const getConnections = async (params?: PaginationParams): Promise<PaginatedResponse<Connection>> => {
  // Backend route: GET /connections/connections
  const response = await apiClient.get<ApiResponse<PaginatedResponse<Connection>>>('/connections/connections', { params });
  return response.data.data;
};

export const getPendingRequests = async (): Promise<ConnectionRequest[]> => {
  // Backend route: GET /connections/pending (needs implementation)
  const response = await apiClient.get<ApiResponse<ConnectionRequest[]>>('/connections/pending');
  return response.data.data;
};

export const getConnectionSuggestions = async (): Promise<ConnectionSuggestion[]> => {
  // Backend route: GET /alumni/suggestions (AI-powered)
  const response = await apiClient.get<ApiResponse<ConnectionSuggestion[]>>('/alumni/suggestions');
  return response.data.data;
};

export const sendConnectionRequest = async (userId: string, message?: string): Promise<ConnectionRequest> => {
  // Backend route: POST /connections/send-request (requires Student role)
  const response = await apiClient.post<ApiResponse<ConnectionRequest>>('/connections/send-request', { targetUserId: userId, message });
  return response.data.data;
};

export const acceptRequest = async (requestId: string): Promise<Connection> => {
  // Backend route: POST /connections/accept-request (requires Alumni role)
  const response = await apiClient.post<ApiResponse<Connection>>('/connections/accept-request', { requestId });
  return response.data.data;
};

export const rejectRequest = async (requestId: string): Promise<void> => {
  // Backend route: POST /connections/reject-request (requires Alumni role)
  await apiClient.post('/connections/reject-request', { requestId });
};

export const removeConnection = async (connectionId: string): Promise<void> => {
  // Backend route: DELETE /connections/remove-connection
  await apiClient.delete('/connections/remove-connection', { data: { connectionId } });
};
