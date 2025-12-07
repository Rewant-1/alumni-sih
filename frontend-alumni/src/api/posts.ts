import apiClient, { ApiResponse, PaginationParams, PaginatedResponse } from './apiClient';

export interface Post {
  _id: string;
  author: {
    _id: string;
    name: string;
    avatar?: string;
    title?: string;
  };
  content: string;
  createdAt: string;
  likes: number;
  comments: number;
  isLiked?: boolean;
}

export const getAllPosts = async (params?: PaginationParams): Promise<PaginatedResponse<Post>> => {
  const response = await apiClient.get<ApiResponse<PaginatedResponse<Post>>>('/posts', { params });
  return response.data.data;
};

export const createPost = async (content: string): Promise<Post> => {
  const response = await apiClient.post<ApiResponse<Post>>('/posts', { content });
  return response.data.data;
};

export const likePost = async (id: string): Promise<void> => {
  await apiClient.post(`/posts/${id}/like`);
};

export const unlikePost = async (id: string): Promise<void> => {
  await apiClient.delete(`/posts/${id}/like`);
};
