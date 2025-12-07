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

// Mock data removed - using real backend API

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
  } catch (error) {
    console.error('Error fetching success stories:', error);
    throw error;
  }
};

export const getSuccessStory = async (id: string): Promise<SuccessStory> => {
  const response = await apiClient.get<ApiResponse<SuccessStory>>(`/success-stories/${id}`);
  return response.data.data;
};

export const submitSuccessStory = async (data: CreateStoryData): Promise<SuccessStory> => {
  const response = await apiClient.post<ApiResponse<SuccessStory>>('/success-stories', data);
  return response.data.data;
};

export const likeStory = async (id: string): Promise<void> => {
  await apiClient.post(`/success-stories/${id}/like`);
};
