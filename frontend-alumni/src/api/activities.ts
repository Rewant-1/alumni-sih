import apiClient, { ApiResponse, PaginationParams, PaginatedResponse } from './apiClient';

export interface Activity {
  id: string;
  type: 'job_posted' | 'event_created' | 'connection_made' | 'donation_made' | 'story_shared' | 'profile_updated';
  title: string;
  description: string;
  actor: { id: string; name: string; avatarUrl?: string };
  target?: { id: string; type: string; title: string };
  createdAt: string;
}

// API Functions (mock data removed)

export const getActivities = async (params?: PaginationParams & { type?: Activity['type'] }): Promise<PaginatedResponse<Activity>> => {
  const response = await apiClient.get<ApiResponse<PaginatedResponse<Activity>>>('/activities', { params });
  return response.data.data;
};

export const getMyActivities = async (): Promise<Activity[]> => {
  const response = await apiClient.get<ApiResponse<Activity[]>>('/activities/me');
  return response.data.data;
};
