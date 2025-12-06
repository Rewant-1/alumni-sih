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

const MOCK_ACTIVITIES: Activity[] = [
  { id: '1', type: 'job_posted', title: 'New Job Posted', description: 'Posted Senior Software Engineer at Google', actor: { id: '1', name: 'Rahul Sharma' }, target: { id: '1', type: 'job', title: 'Senior Software Engineer' }, createdAt: '2025-12-06T10:00:00Z' },
  { id: '2', type: 'connection_made', title: 'New Connection', description: 'Connected with Priya Patel', actor: { id: '1', name: 'Current User' }, target: { id: '2', type: 'user', title: 'Priya Patel' }, createdAt: '2025-12-05T10:00:00Z' },
  { id: '3', type: 'event_created', title: 'Event Created', description: 'Created Alumni Annual Reunion 2025', actor: { id: '1', name: 'Alumni Association' }, target: { id: '1', type: 'event', title: 'Alumni Annual Reunion 2025' }, createdAt: '2025-12-04T10:00:00Z' },
  { id: '4', type: 'donation_made', title: 'Donation Made', description: 'Donated ₹10,000 to Scholarship Fund', actor: { id: '1', name: 'Current User' }, target: { id: '1', type: 'campaign', title: 'Scholarship Fund' }, createdAt: '2025-12-03T10:00:00Z' },
];

export const getActivities = async (params?: PaginationParams & { type?: Activity['type'] }): Promise<PaginatedResponse<Activity>> => {
  try {
    const response = await apiClient.get<ApiResponse<PaginatedResponse<Activity>>>('/activities', { params });
    return response.data.data;
  } catch {
    let filtered = [...MOCK_ACTIVITIES];
    if (params?.type) filtered = filtered.filter(a => a.type === params.type);
    return { items: filtered, total: filtered.length, page: 1, limit: 10, totalPages: 1 };
  }
};

export const getMyActivities = async (): Promise<Activity[]> => {
  try {
    const response = await apiClient.get<ApiResponse<Activity[]>>('/activities/me');
    return response.data.data;
  } catch { return MOCK_ACTIVITIES; }
};
