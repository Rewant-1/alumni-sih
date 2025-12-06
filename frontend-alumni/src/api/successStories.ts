import apiClient, { ApiResponse, PaginationParams, PaginatedResponse } from './apiClient';

export interface SuccessStory {
  id: string;
  title: string;
  content: string;
  excerpt: string;
  category: 'Entrepreneurship' | 'Career' | 'Research' | 'Social Impact' | 'Innovation';
  author: { id: string; name: string; avatarUrl?: string; gradYear: string; currentRole?: string };
  image?: string;
  likes: number;
  isLiked?: boolean;
  isFeatured: boolean;
  status: 'published' | 'pending' | 'rejected';
  createdAt: string;
}

export interface CreateStoryData {
  title: string;
  content: string;
  category: SuccessStory['category'];
  image?: string;
}

const MOCK_STORIES: SuccessStory[] = [
  { id: '1', title: 'From Campus to Unicorn: My Startup Journey', content: 'Full story content here...', excerpt: 'How I built a billion-dollar company after graduating from Delhi University...', category: 'Entrepreneurship', author: { id: '1', name: 'Vikram Malhotra', gradYear: '2015', currentRole: 'Founder & CEO' }, likes: 234, isFeatured: true, status: 'published', createdAt: '2025-11-15T10:00:00Z' },
  { id: '2', title: 'Breaking Barriers in AI Research', content: 'Full story content here...', excerpt: 'My journey from being a curious student to leading AI research at a top lab...', category: 'Research', author: { id: '2', name: 'Priya Patel', gradYear: '2017', currentRole: 'Research Scientist' }, likes: 156, isFeatured: true, status: 'published', createdAt: '2025-10-20T10:00:00Z' },
  { id: '3', title: 'Building Schools in Rural India', content: 'Full story content here...', excerpt: 'How our alumni group has built 50+ schools across rural India...', category: 'Social Impact', author: { id: '3', name: 'Ananya Sharma', gradYear: '2018', currentRole: 'NGO Director' }, likes: 312, isFeatured: false, status: 'published', createdAt: '2025-09-10T10:00:00Z' },
];

// Transform backend story to frontend format
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const transformStory = (story: any): SuccessStory => {
  // Backend: alumniId.userId.name, alumniId.graduationYear, alumniId.photo
  // Frontend: author.name, author.gradYear, author.avatarUrl
  const alumni = story.alumniId || {};
  const user = alumni.userId || {};
  return {
    id: story._id || story.id,
    title: story.title || '',
    content: story.content || '',
    excerpt: story.excerpt || '',
    category: story.category || 'Career',
    author: {
      id: alumni._id || alumni.id || '',
      name: user.name || alumni.name || 'Unknown',
      avatarUrl: alumni.photo || user.avatar,
      gradYear: alumni.graduationYear || '',
      currentRole: alumni.headline || '',
    },
    image: story.coverImage,
    likes: Array.isArray(story.likes) ? story.likes.length : (story.likes || 0),
    isLiked: false,
    isFeatured: story.isFeatured || false,
    status: story.status === 'approved' ? 'published' : story.status,
    createdAt: story.createdAt || new Date().toISOString(),
  };
};

export const getSuccessStories = async (params?: PaginationParams & { category?: SuccessStory['category']; featured?: boolean }): Promise<PaginatedResponse<SuccessStory>> => {
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const response = await apiClient.get<ApiResponse<any>>('/success-stories', { params });
    const backendData = response.data.data;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const pagination = (response.data as any).pagination;
    
    // Transform backend data to frontend format
    const stories = Array.isArray(backendData) ? backendData.map(transformStory) : [];
    
    return {
      items: stories,
      total: pagination?.total || stories.length,
      page: pagination?.page || 1,
      limit: pagination?.limit || 10,
      totalPages: pagination?.pages || 1,
    };
  } catch {
    let filtered = [...MOCK_STORIES];
    if (params?.category) filtered = filtered.filter(s => s.category === params.category);
    if (params?.featured) filtered = filtered.filter(s => s.isFeatured);
    return { items: filtered, total: filtered.length, page: 1, limit: 10, totalPages: 1 };
  }
};

export const getSuccessStory = async (id: string): Promise<SuccessStory> => {
  try {
    const response = await apiClient.get<ApiResponse<SuccessStory>>(`/success-stories/${id}`);
    return response.data.data;
  } catch { return MOCK_STORIES.find(s => s.id === id) || MOCK_STORIES[0]; }
};

export const submitSuccessStory = async (data: CreateStoryData): Promise<SuccessStory> => {
  const response = await apiClient.post<ApiResponse<SuccessStory>>('/success-stories', data);
  return response.data.data;
};

export const likeStory = async (id: string): Promise<void> => {
  await apiClient.post(`/success-stories/${id}/like`);
};
