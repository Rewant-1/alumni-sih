
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
// API Functions (mock data removed)
// API Functions
    shortDescription: 'Support bright students who need financial assistance to continue their 
education.',
    description: `The Merit Scholarship Fund aims to provide financial support to deserving 
students who demonstrate exceptional academic performance but face financial constraints.
    category: 'Scholarship',
    goalAmount: 1000000,
    raisedAmount: 650000,
    donorsCount: 234,
    image: '/scholarship.jpg',
    organizer: {
      id: '1',
      name: 'Alumni Association',
    },
    startDate: '2025-01-01T00:00:00Z',
    endDate: '2025-06-30T23:59:59Z',
    status: 'active',
    isFeatured: true,
    updates: [
      {
        id: '1',
        title: 'First Milestone Reached!',
        content: 'We have reached 50% of our goal. Thank you to all donors!',
        createdAt: '2025-12-01T10:00:00Z',
      },
    ],
    createdAt: '2025-01-01T00:00:00Z',
  },
  {
    id: '2',
    title: 'New Computer Lab',
    shortDescription: 'Help us build a state-of-the-art computer lab for the CS department.',
    description: `We are raising funds to establish a modern computer laboratory equipped with the 
latest technology for the Computer Science department.
    category: 'Infrastructure',
    goalAmount: 5000000,
    raisedAmount: 2500000,
    donorsCount: 89,
    organizer: {
      id: '2',
      name: 'CS Department Alumni',
    },
    startDate: '2025-02-01T00:00:00Z',
    endDate: '2025-12-31T23:59:59Z',
    status: 'active',
    isFeatured: true,
    updates: [],
    createdAt: '2025-02-01T00:00:00Z',
  },
  {
    id: '3',
    title: 'AI Research Grant',
    shortDescription: 'Fund cutting-edge AI research at our university.',
    description: `Support groundbreaking artificial intelligence research conducted by our faculty 
and students.
    category: 'Research',
    goalAmount: 2000000,
    raisedAmount: 800000,
    donorsCount: 45,
    organizer: {
      id: '3',
      name: 'Research Committee',
    },
    startDate: '2025-03-01T00:00:00Z',
    endDate: '2025-09-30T23:59:59Z',
    status: 'active',
    isFeatured: false,
    updates: [],
    createdAt: '2025-03-01T00:00:00Z',
  },
  {
    id: '4',
    title: 'Sports Equipment Upgrade',
    shortDescription: 'Upgrade sports facilities and equipment for student athletes.',
    description: `Help our student athletes compete at national and international levels by 
providing them with world-class equipment and facilities.`,
    category: 'Sports',
    goalAmount: 500000,
    raisedAmount: 350000,
    donorsCount: 156,
    organizer: {
      id: '4',
      name: 'Sports Alumni Club',
    },
    startDate: '2025-01-15T00:00:00Z',
    endDate: '2025-04-30T23:59:59Z',
    status: 'active',
    isFeatured: false,
    updates: [],
    createdAt: '2025-01-15T00:00:00Z',
  },
const MOCK_DONATIONS: Donation[] = [
  {
    id: '1',
    campaign: MOCK_CAMPAIGNS[0],
    donor: { id: '1', name: 'Rahul Sharma', isAnonymous: false },
    amount: 10000,
    message: 'Happy to support future scholars!',
    createdAt: '2025-12-05T10:00:00Z',
  },
  {
    id: '2',
    campaign: MOCK_CAMPAIGNS[0],
    donor: { id: '2', name: 'Anonymous', isAnonymous: true },
    amount: 25000,
    createdAt: '2025-12-04T10:00:00Z',
  },
  {
    id: '3',
    campaign: MOCK_CAMPAIGNS[0],
    donor: { id: '3', name: 'Priya Patel', isAnonymous: false },
    amount: 5000,
    message: 'Education changes lives!',
    createdAt: '2025-12-03T10:00:00Z',
  },
// API Functions
export const getAllCampaigns = async (params?: CampaignSearchParams): 
Promise<PaginatedResponse<Campaign>> => {
  try {
    const response = await apiClient.get<ApiResponse<Campaign[] | 
PaginatedResponse<Campaign>>>('/campaigns', { params });
    const backendData = response.data.data;
    // Handle both formats: direct array or paginated response with items
    if (Array.isArray(backendData)) {
      // Backend returns { data: [...], pagination: {...} }
      const pagination = (response.data as { pagination?: { total?: number; page?: number; limit?: 
number; pages?: number } }).pagination;
      return {
        items: backendData,
        total: pagination?.total || backendData.length,
        page: pagination?.page || 1,
        limit: pagination?.limit || 10,
        totalPages: pagination?.pages || 1,
      };
    }
    // Already in expected format
    return backendData || { items: [], total: 0, page: 1, limit: 10, totalPages: 1 };
  } catch (error) {
    console.error('Error fetching campaigns:', error);
    let filtered = [...MOCK_CAMPAIGNS];
    if (params?.category) {
      filtered = filtered.filter(c => c.category === params.category);
    }
    if (params?.status) {
      filtered = filtered.filter(c => c.status === params.status);
    }
    if (params?.featured) {
      filtered = filtered.filter(c => c.isFeatured);
    }
    if (params?.query) {
      const query = params.query.toLowerCase();
      filtered = filtered.filter(c => 
        c.title.toLowerCase().includes(query) ||
        c.description.toLowerCase().includes(query)
      );
    }
    return {
      items: filtered,
      total: filtered.length,
      page: params?.page || 1,
      limit: params?.limit || 10,
      totalPages: 1,
    };
  }
};
export const getCampaign = async (id: string): Promise<Campaign> => {
  try {
    const response = await apiClient.get<ApiResponse<Campaign>>(`/campaigns/${id}`);
    return response.data.data;
  } catch (error) {
    console.error('Error fetching campaign:', error);
    return MOCK_CAMPAIGNS.find(c => c.id === id) || MOCK_CAMPAIGNS[0];
  }
};
export const getCampaignDonations = async (id: string): Promise<Donation[]> => {
  try {
    const response = await apiClient.get<ApiResponse<Donation[]>>(`/campaigns/${id}/donations`);
    return response.data.data;
  } catch (error) {
    console.error('Error fetching campaign donations:', error);
    return MOCK_DONATIONS.filter(d => d.campaign.id === id);
  }
};
export const donate = async (campaignId: string, data: DonationData): Promise<Donation> => {
  try {
    const response = await 
apiClient.post<ApiResponse<Donation>>(`/campaigns/${campaignId}/donate`, data);
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
    return MOCK_DONATIONS.slice(0, 1);
  }
};


