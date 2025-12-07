import apiClient, { ApiResponse, PaginationParams, PaginatedResponse } from './apiClient';

// Types
export interface Campaign {
  id: string;
  title: string;
  description: string;
  shortDescription: string;
  category: 'Scholarship' | 'Infrastructure' | 'Research' | 'Sports' | 'Community' | 'Emergency';
  goalAmount: number;
  raisedAmount: number;
  donorsCount: number;
  image?: string;
  organizer: {
    id: string;
    name: string;
    avatarUrl?: string;
  };
  startDate: string;
  endDate: string;
  status: 'active' | 'completed' | 'cancelled';
  isFeatured: boolean;
  updates: CampaignUpdate[];
  createdAt: string;
}

export interface CampaignUpdate {
  id: string;
  title: string;
  content: string;
  createdAt: string;
}

export interface Donation {
  id: string;
  campaign: Campaign;
  donor: {
    id: string;
    name: string;
    avatarUrl?: string;
    isAnonymous: boolean;
  };
  amount: number;
  message?: string;
  createdAt: string;
}

export interface DonationData {
  amount: number;
  message?: string;
  isAnonymous?: boolean;
}

export interface CampaignSearchParams extends PaginationParams {
  query?: string;
  category?: Campaign['category'];
  status?: Campaign['status'];
  featured?: boolean;
}

// API Functions
export const getAllCampaigns = async (params?: CampaignSearchParams): Promise<PaginatedResponse<Campaign>> => {
  try {
    const response = await apiClient.get<ApiResponse<PaginatedResponse<Campaign> | Campaign[]>>('/campaigns', { params });
    const backendData = response.data.data;
    if (Array.isArray(backendData)) {
      // Convert array response into paginated shape
      return {
        items: backendData,
        total: backendData.length,
        page: params?.page || 1,
        limit: params?.limit || 10,
        totalPages: 1,
      };
    }
    return backendData || { items: [], total: 0, page: 1, limit: 10, totalPages: 0 };
  } catch (error) {
    console.error('Error fetching campaigns:', error);
    return { items: [], total: 0, page: params?.page || 1, limit: params?.limit || 10, totalPages: 0 };
  }
};

export const getCampaign = async (id: string): Promise<Campaign> => {
  try {
    const response = await apiClient.get<ApiResponse<Campaign>>(`/campaigns/${id}`);
    return response.data.data;
  } catch (error) {
    console.error('Error fetching campaign:', error);
    throw error;
  }
};

export const getCampaignDonations = async (id: string): Promise<Donation[]> => {
  try {
    const response = await apiClient.get<ApiResponse<Donation[]>>(`/campaigns/${id}/donations`);
    return response.data.data;
  } catch (error) {
    console.error('Error fetching campaign donations:', error);
    return [];
  }
};

export const donate = async (campaignId: string, data: DonationData): Promise<Donation> => {
  try {
    const response = await apiClient.post<ApiResponse<Donation>>(`/campaigns/${campaignId}/donate`, data);
    return response.data.data;
  } catch (error) {
    console.error('Error making donation:', error);
    throw error;
  }
};

export const getMyDonations = async (): Promise<Donation[]> => {
  try {
    const response = await apiClient.get<ApiResponse<Donation[]>>('/donations/my-donations');
    return response.data.data;
  } catch (error) {
    console.error('Error fetching my donations:', error);
    return [];
  }
};
