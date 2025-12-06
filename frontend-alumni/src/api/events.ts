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

// Mock Data
const MOCK_EVENTS: Event[] = [
  {
    id: '1',
    title: 'Alumni Annual Reunion 2025',
    description: 'Join us for the annual alumni reunion. Reconnect with old friends, make new connections, and celebrate our shared heritage. The event features keynote speeches, networking sessions, and a grand dinner.',
    date: '2025-01-15T18:00:00Z',
    endDate: '2025-01-15T22:00:00Z',
    location: 'Main Campus Auditorium, Delhi University',
    isOnline: false,
    category: 'Reunion',
    image: '/du.png',
    organizer: {
      id: '1',
      name: 'Alumni Association',
    },
    attendeesCount: 156,
    capacity: 500,
    status: 'upcoming',
    createdAt: '2025-11-01T10:00:00Z',
    agenda: [
      { id: '1', time: '18:00', title: 'Registration & Welcome Drinks' },
      { id: '2', time: '19:00', title: 'Keynote Address', speaker: 'Dr. Ramesh Kumar' },
      { id: '3', time: '20:00', title: 'Networking Session' },
      { id: '4', time: '21:00', title: 'Grand Dinner' },
    ],
  },
  {
    id: '2',
    title: 'Tech Talk: AI in 2025',
    description: 'Industry experts discuss the future of AI and its impact on various sectors. Learn about the latest trends in machine learning, generative AI, and their practical applications.',
    date: '2025-01-20T15:00:00Z',
    endDate: '2025-01-20T17:00:00Z',
    location: 'Online (Zoom)',
    isOnline: true,
    meetingLink: 'https://zoom.us/j/123456789',
    category: 'Webinar',
    image: '/fot_blue.png',
    organizer: {
      id: '2',
      name: 'Tech Alumni Club',
    },
    attendeesCount: 89,
    status: 'upcoming',
    createdAt: '2025-11-15T10:00:00Z',
    agenda: [
      { id: '1', time: '15:00', title: 'Introduction to AI Trends', speaker: 'Priya Patel' },
      { id: '2', time: '15:30', title: 'Generative AI in Enterprise', speaker: 'Arjun Singh' },
      { id: '3', time: '16:00', title: 'Panel Discussion' },
      { id: '4', time: '16:45', title: 'Q&A Session' },
    ],
  },
  {
    id: '3',
    title: 'Startup Networking Night',
    description: 'Connect with alumni entrepreneurs and investors. Pitch your ideas, find co-founders, and explore investment opportunities.',
    date: '2025-02-05T19:00:00Z',
    endDate: '2025-02-05T22:00:00Z',
    location: 'Innovation Hub, Connaught Place, Delhi',
    isOnline: false,
    category: 'Networking',
    image: '/fot_building.png',
    organizer: {
      id: '3',
      name: 'Entrepreneur Alumni Network',
    },
    attendeesCount: 45,
    capacity: 100,
    status: 'upcoming',
    createdAt: '2025-11-20T10:00:00Z',
  },
  {
    id: '4',
    title: 'Resume Building Workshop',
    description: 'Learn how to craft a compelling resume that stands out. Tips from HR professionals and successful alumni.',
    date: '2025-01-25T14:00:00Z',
    endDate: '2025-01-25T16:00:00Z',
    location: 'Online (Google Meet)',
    isOnline: true,
    meetingLink: 'https://meet.google.com/abc-defg-hij',
    category: 'Workshop',
    organizer: {
      id: '4',
      name: 'Career Services',
    },
    attendeesCount: 67,
    status: 'upcoming',
    createdAt: '2025-11-25T10:00:00Z',
  },
  {
    id: '5',
    title: 'Alumni Cricket Tournament',
    description: 'Annual inter-batch cricket tournament. Form your team and compete for the Alumni Trophy!',
    date: '2025-02-15T09:00:00Z',
    endDate: '2025-02-16T18:00:00Z',
    location: 'University Sports Complex',
    isOnline: false,
    category: 'Social',
    organizer: {
      id: '1',
      name: 'Alumni Sports Committee',
    },
    attendeesCount: 120,
    capacity: 200,
    status: 'upcoming',
    createdAt: '2025-12-01T10:00:00Z',
  },
];

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
