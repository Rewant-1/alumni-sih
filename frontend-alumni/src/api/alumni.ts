import apiClient, { ApiResponse, PaginationParams, PaginatedResponse } from './apiClient';

// Types
export interface SocialLinks {
  linkedin?: string;
  github?: string;
  twitter?: string;
  portfolio?: string;
}

export interface AlumniRelation {
  department: string;
  faculty: string;
  university: string;
  batch: string;
}

export interface Experience {
  id: string;
  company: string;
  role: string;
  startDate: string;
  endDate?: string;
  current: boolean;
  description?: string;
}

export interface Education {
  id: string;
  institution: string;
  degree: string;
  field: string;
  startYear: number;
  endYear?: number;
  current: boolean;
}

export interface AlumniProfile {
  id: string;
  name: string;
  email: string;
  phone?: string;
  avatarUrl?: string;
  bio?: string;
  degree: string;
  major: string;
  faculty: string;
  gradYear: string;
  currentRole?: string;
  currentCompany?: string;
  location?: string;
  socials: SocialLinks;
  alumniRelation: AlumniRelation;
  latestDegree?: string;
  interests: string[];
  skills: string[];
  experiences: Experience[];
  education: Education[];
  isVerified: boolean;
  connectionStatus?: 'connected' | 'pending' | 'none';
}

export interface AlumniSearchParams extends PaginationParams {
  query?: string;
  gradYear?: string;
  department?: string;
  location?: string;
  company?: string;
}

// Mock data for development
const MOCK_PROFILE: AlumniProfile = {
  id: '1',
  name: 'Rahul Sharma',
  email: 'rahul.sharma@example.com',
  phone: '+91 98765 43210',
  avatarUrl: '/profile.jpeg',
  bio: 'Passionate software engineer with 8+ years of experience building scalable web applications. Love mentoring young developers and contributing to open source.',
  degree: 'B.Tech',
  major: 'Computer Science',
  faculty: 'Engineering',
  gradYear: '2016',
  currentRole: 'Senior Software Engineer',
  currentCompany: 'Google India',
  location: 'Bangalore, India',
  socials: {
    linkedin: 'https://linkedin.com/in/rahulsharma',
    github: 'https://github.com/rahulsharma',
    twitter: 'https://twitter.com/rahulsharma',
    portfolio: 'https://rahulsharma.dev',
  },
  alumniRelation: {
    department: 'Computer Science',
    faculty: 'Faculty of Engineering',
    university: 'Delhi University',
    batch: '2012-2016',
  },
  latestDegree: 'M.Tech Computer Science (IIT Delhi)',
  interests: ['Machine Learning', 'Web Development', 'Open Source', 'Mentorship'],
  skills: ['React', 'Node.js', 'Python', 'TypeScript', 'AWS', 'System Design'],
  experiences: [
    {
      id: '1',
      company: 'Google India',
      role: 'Senior Software Engineer',
      startDate: '2020-06',
      current: true,
      description: 'Leading frontend development for Google Pay India',
    },
    {
      id: '2',
      company: 'Microsoft',
      role: 'Software Engineer',
      startDate: '2016-07',
      endDate: '2020-05',
      current: false,
      description: 'Worked on Azure DevOps platform',
    },
  ],
  education: [
    {
      id: '1',
      institution: 'IIT Delhi',
      degree: 'M.Tech',
      field: 'Computer Science',
      startYear: 2018,
      endYear: 2020,
      current: false,
    },
    {
      id: '2',
      institution: 'Delhi University',
      degree: 'B.Tech',
      field: 'Computer Science',
      startYear: 2012,
      endYear: 2016,
      current: false,
    },
  ],
  isVerified: true,
};

const MOCK_ALUMNI_LIST: AlumniProfile[] = [
  MOCK_PROFILE,
  {
    ...MOCK_PROFILE,
    id: '2',
    name: 'Priya Patel',
    email: 'priya.patel@example.com',
    currentRole: 'Product Manager',
    currentCompany: 'Amazon',
    gradYear: '2017',
    location: 'Hyderabad, India',
    avatarUrl: '',
  },
  {
    ...MOCK_PROFILE,
    id: '3',
    name: 'Arjun Singh',
    email: 'arjun.singh@example.com',
    currentRole: 'Data Scientist',
    currentCompany: 'Flipkart',
    gradYear: '2018',
    location: 'Bangalore, India',
    avatarUrl: '',
  },
  {
    ...MOCK_PROFILE,
    id: '4',
    name: 'Sneha Reddy',
    email: 'sneha.reddy@example.com',
    currentRole: 'UX Designer',
    currentCompany: 'Swiggy',
    gradYear: '2019',
    location: 'Bangalore, India',
    avatarUrl: '',
  },
  {
    ...MOCK_PROFILE,
    id: '5',
    name: 'Vikram Malhotra',
    email: 'vikram.m@example.com',
    currentRole: 'Engineering Manager',
    currentCompany: 'Razorpay',
    gradYear: '2015',
    location: 'Bangalore, India',
    avatarUrl: '',
  },
];

// API Functions
export const getAlumniProfile = async (id: string): Promise<AlumniProfile> => {
  try {
    const response = await apiClient.get<ApiResponse<AlumniProfile>>(`/alumni/${id}`);
    return response.data.data;
  } catch (error) {
    console.error('Error fetching alumni profile:', error);
    // Return mock data for development
    return MOCK_ALUMNI_LIST.find(a => a.id === id) || MOCK_PROFILE;
  }
};

export const getMyProfile = async (): Promise<AlumniProfile> => {
  try {
    const response = await apiClient.get<ApiResponse<AlumniProfile>>('/alumni/me');
    return response.data.data;
  } catch (error) {
    console.error('Error fetching my profile:', error);
    return MOCK_PROFILE;
  }
};

export const updateAlumniProfile = async (id: string, data: Partial<AlumniProfile>): Promise<AlumniProfile> => {
  try {
    const response = await apiClient.put<ApiResponse<AlumniProfile>>(`/alumni/${id}`, data);
    return response.data.data;
  } catch (error) {
    console.error('Error updating alumni profile:', error);
    throw error;
  }
};

export const getAlumniDirectory = async (params?: AlumniSearchParams): Promise<PaginatedResponse<AlumniProfile>> => {
  try {
    const response = await apiClient.get<ApiResponse<PaginatedResponse<AlumniProfile>>>('/alumni', { params });
    return response.data.data;
  } catch (error) {
    console.error('Error fetching alumni directory:', error);
    // Return mock data for development
    return {
      items: MOCK_ALUMNI_LIST,
      total: MOCK_ALUMNI_LIST.length,
      page: 1,
      limit: 10,
      totalPages: 1,
    };
  }
};

export const searchAlumni = async (query: string): Promise<AlumniProfile[]> => {
  try {
    const response = await apiClient.get<ApiResponse<AlumniProfile[]>>('/alumni/search', { params: { query } });
    return response.data.data;
  } catch (error) {
    console.error('Error searching alumni:', error);
    return MOCK_ALUMNI_LIST.filter(a => 
      a.name.toLowerCase().includes(query.toLowerCase()) ||
      a.currentCompany?.toLowerCase().includes(query.toLowerCase())
    );
  }
};
