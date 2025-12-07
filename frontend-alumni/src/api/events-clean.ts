import apiClient, { ApiResponse, PaginationParams, PaginatedResponse } from './apiClient';

// Types
export interface Event {
  id: string;
  title: string;
  description: string;
  date: string;
  endDate?: string;
  location: string;
  isOnline: boolean;
  meetingLink?: string;
  category: 'Reunion' | 'Webinar' | 'Networking' | 'Workshop' | 'Conference' | 'Social';
  image?: string;
  organizer: {
    id: string;
    name: string;
    avatarUrl?: string;
  };
  attendeesCount: number;
  capacity?: number;
  isRegistered?: boolean;
  status: 'upcoming' | 'ongoing' | 'completed' | 'cancelled';
  createdAt: string;
  agenda?: AgendaItem[];
  sponsors?: string[];
}

export interface AgendaItem {
  id: string;
  time: string;
  title: string;
  speaker?: string;
  description?: string;
}

export interface EventRegistration {
  id: string;
  event: Event;
  user: {
    id: string;
    name: string;
    email: string;
  };
  registeredAt: string;
  status: 'confirmed' | 'waitlisted' | 'cancelled';
}

export interface CreateEventData {
  title: string;
  description: string;
  date: string;
  endDate?: string;
  location: string;
  isOnline: boolean;
  meetingLink?: string;
  category: Event['category'];
  image?: string;
  capacity?: number;
  agenda?: Omit<AgendaItem, 'id'>[];
}

export interface EventSearchParams extends PaginationParams {
  query?: string;
  category?: Event['category'];
  status?: Event['status'];
  startDate?: string;
  endDate?: string;
}

// API Functions
export const getAllEvents = async (params?: EventSearchParams): Promise<PaginatedResponse<Event>> => {
  const response = await apiClient.get<ApiResponse<PaginatedResponse<Event>>>('/events', { params });
  return response.data.data;
};

export const getEvent = async (id: string): Promise<Event> => {
  const response = await apiClient.get<ApiResponse<Event>>(`/events/${id}`);
  return response.data.data;
};

export const createEvent = async (data: CreateEventData): Promise<Event> => {
  const response = await apiClient.post<ApiResponse<Event>>('/events', data);
  return response.data.data;
};

export const updateEvent = async (id: string, data: Partial<CreateEventData>): Promise<Event> => {
  const response = await apiClient.put<ApiResponse<Event>>(`/events/${id}`, data);
  return response.data.data;
};

export const deleteEvent = async (id: string): Promise<void> => {
  await apiClient.delete(`/events/${id}`);
};

export const registerForEvent = async (id: string): Promise<EventRegistration> => {
  const response = await apiClient.post<ApiResponse<EventRegistration>>(`/events/${id}/register`);
  return response.data.data;
};

export const cancelRegistration = async (id: string): Promise<void> => {
  await apiClient.delete(`/events/${id}/register`);
};

export const getMyEvents = async (): Promise<Event[]> => {
  const response = await apiClient.get<ApiResponse<Event[]>>('/events/my-events');
  return response.data.data;
};

export const getEventAttendees = async (id: string): Promise<{ id: string; name: string; avatarUrl?: string }[]> => {
  const response = await apiClient.get<ApiResponse<{ id: string; name: string; avatarUrl?: string }[]>>(
    `/events/${id}/attendees`
  );
  return response.data.data;
};
