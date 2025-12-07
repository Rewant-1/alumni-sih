
import apiClient, { ApiResponse, PaginationParams, PaginatedResponse } from './apiClient';
// Types
export interface Job {
  id: string;
  title: string;
  company: string;
  companyLogo?: string;
  location: string;
  type: 'Full-time' | 'Part-time' | 'Contract' | 'Internship' | 'Remote';
  salary?: string;
  salaryMin?: number;
  salaryMax?: number;
  description: string;
  requirements: string[];
  skills: string[];
  benefits?: string[];
  experience: string;
  postedBy: {
    id: string;
    name: string;
    avatarUrl?: string;
    isAlumni: boolean;
  };
  postedAt: string;
  deadline?: string;
  applicantsCount: number;
  isBookmarked?: boolean;
  status: 'active' | 'closed' | 'draft';
}
export interface JobApplication {
  id: string;
  job: Job;
  applicant: {
    id: string;
    name: string;
    email: string;
    avatarUrl?: string;
  };
  resumeUrl: string;
  coverLetter?: string;
  status: 'pending' | 'reviewed' | 'shortlisted' | 'rejected' | 'hired';
  appliedAt: string;
}
export interface CreateJobData {
  title: string;
  company: string;
  location: string;
  type: Job['type'];
  salary?: string;
  description: string;
  requirements: string[];
  skills: string[];
  benefits?: string[];
  experience: string;
  deadline?: string;
}
export interface JobSearchParams extends PaginationParams {
  query?: string;
  type?: Job['type'];
  location?: string;
  salaryMin?: number;
  salaryMax?: number;
  experience?: string;
  skills?: string[];
}
export interface CreateApplicationData {
  resumeUrl: string;
  coverLetter?: string;
}
// API Functions start below (mock data removed for production)
// API Functions
    company: 'Google',
    companyLogo: '',
    location: 'Bangalore, India',
    type: 'Full-time',
    salary: 'â‚¹25-35 LPA',
    salaryMin: 2500000,
    salaryMax: 3500000,
    description: 'We are looking for a senior software engineer to join our team. You will be 
responsible for designing and implementing scalable web applications.',
    requirements: [
      '5+ years of experience in software development',
      'Strong proficiency in React and Node.js',
      'Experience with cloud platforms (AWS/GCP)',
      'Excellent problem-solving skills',
    ],
    skills: ['React', 'Node.js', 'TypeScript', 'AWS', 'System Design'],
    benefits: ['Health Insurance', 'Stock Options', 'Flexible Hours', 'Remote Work'],
    experience: '5+ years',
    postedBy: {
      id: '1',
      name: 'Rahul Sharma',
      isAlumni: true,
    },
    postedAt: '2025-12-04T10:00:00Z',
    deadline: '2025-12-31T23:59:59Z',
    applicantsCount: 45,
    status: 'active',
  },
  {
    id: '2',
    title: 'Product Manager',
    company: 'Microsoft',
    location: 'Hyderabad, India',
    type: 'Full-time',
    salary: 'â‚¹30-40 LPA',
    salaryMin: 3000000,
    salaryMax: 4000000,
    description: 'Lead product development for our cloud services team. Define product strategy 
and work closely with engineering teams.',
    requirements: [
      '3+ years of product management experience',
      'Strong analytical skills',
      'Experience with agile methodologies',
      'Technical background preferred',
    ],
    skills: ['Product Strategy', 'Agile', 'Analytics', 'User Research'],
    experience: '3+ years',
    postedBy: {
      id: '2',
      name: 'Priya Patel',
      isAlumni: true,
    },
    postedAt: '2025-12-01T10:00:00Z',
    applicantsCount: 32,
    status: 'active',
  },
  {
    id: '3',
    title: 'Data Scientist',
    company: 'Amazon',
    location: 'Remote',
    type: 'Remote',
    salary: 'â‚¹20-30 LPA',
    salaryMin: 2000000,
    salaryMax: 3000000,
    description: 'Work on ML models for recommendation systems. Build and deploy models at scale.',
    requirements: [
      '2+ years of data science experience',
      'Strong Python and ML skills',
      'Experience with deep learning frameworks',
    ],
    skills: ['Python', 'TensorFlow', 'PyTorch', 'SQL', 'AWS'],
    experience: '2+ years',
    postedBy: {
      id: '3',
      name: 'Arjun Singh',
      isAlumni: true,
    },
    postedAt: '2025-12-03T10:00:00Z',
    applicantsCount: 67,
    status: 'active',
  },
  {
    id: '4',
    title: 'UX Designer',
    company: 'Swiggy',
    location: 'Bangalore, India',
    type: 'Full-time',
    salary: 'â‚¹15-25 LPA',
    description: 'Design user experiences for our food delivery platform. Conduct user research 
and create intuitive interfaces.',
    requirements: [
      '3+ years of UX design experience',
      'Proficiency in Figma',
      'Portfolio showcasing mobile app design',
    ],
    skills: ['Figma', 'User Research', 'Prototyping', 'Design Systems'],
    experience: '3+ years',
    postedBy: {
      id: '4',
      name: 'Sneha Reddy',
      isAlumni: true,
    },
    postedAt: '2025-12-05T10:00:00Z',
    applicantsCount: 28,
    status: 'active',
  },
  {
    id: '5',
    title: 'Frontend Developer Intern',
    company: 'Razorpay',
    location: 'Bangalore, India',
    type: 'Internship',
    salary: 'â‚¹50K/month',
    description: 'Join our frontend team and learn from industry experts. Work on real projects 
impacting millions of users.',
    requirements: [
      'Currently pursuing B.Tech/M.Tech',
      'Knowledge of React/Vue',
      'Strong JavaScript fundamentals',
    ],
    skills: ['React', 'JavaScript', 'CSS', 'HTML'],
    experience: 'Fresher',
    postedBy: {
      id: '5',
      name: 'Vikram Malhotra',
      isAlumni: true,
    },
    postedAt: '2025-12-06T10:00:00Z',
    applicantsCount: 120,
    status: 'active',
  },
const MOCK_APPLICATIONS: JobApplication[] = [
  {
    id: '1',
    job: MOCK_JOBS[0],
    applicant: {
      id: '1',
      name: 'Current User',
      email: 'user@example.com',
    },
    resumeUrl: '/resume.pdf',
    coverLetter: 'I am excited to apply for this position...',
    status: 'reviewed',
    appliedAt: '2025-12-05T10:00:00Z',
  },
// API Functions
export const getAllJobs = async (params?: JobSearchParams): Promise<PaginatedResponse<Job>> => {
  const response = await apiClient.get<ApiResponse<PaginatedResponse<Job>>>('/jobs', { params });
  return response.data.data;
};
export const getJob = async (id: string): Promise<Job> => {
  const response = await apiClient.get<ApiResponse<Job>>(`/jobs/${id}`);
  return response.data.data;
};
export const createJob = async (data: CreateJobData): Promise<Job> => {
  const response = await apiClient.post<ApiResponse<Job>>('/jobs', data);
  return response.data.data;
};
export const updateJob = async (id: string, data: Partial<CreateJobData>): Promise<Job> => {
  const response = await apiClient.put<ApiResponse<Job>>(`/jobs/${id}`, data);
  return response.data.data;
};
export const deleteJob = async (id: string): Promise<void> => {
  await apiClient.delete(`/jobs/${id}`);
};
export const applyToJob = async (id: string, data: CreateApplicationData): Promise<JobApplication> 
=> {
  const response = await apiClient.post<ApiResponse<JobApplication>>(`/jobs/${id}/apply`, data);
  return response.data.data;
};
export const bookmarkJob = async (id: string): Promise<void> => {
  await apiClient.post(`/jobs/${id}/bookmark`);
};
export const getMyJobPostings = async (): Promise<Job[]> => {
  const response = await apiClient.get<ApiResponse<Job[]>>('/jobs/my/posted');
  return response.data.data;
};
export const getMyApplications = async (): Promise<JobApplication[]> => {
  const response = await apiClient.get<ApiResponse<JobApplication[]>>('/jobs/my/applications');
  return response.data.data;
};
export const getJobApplications = async (jobId: string): Promise<JobApplication[]> => {
  try {
    const response = await 
apiClient.get<ApiResponse<JobApplication[]>>(`/jobs/${jobId}/applications`);
    return response.data.data;
  } catch (error) {
    console.error('Error fetching job applications:', error);
    return [];
  }
};
export const updateApplicationStatus = async (
  applicationId: string, 
  status: JobApplication['status']
  try {
    const response = await apiClient.patch<ApiResponse<JobApplication>>(
      `/applications/${applicationId}`,
      { status }
    );
    return response.data.data;
  } catch (error) {
    console.error('Error updating application status:', error);
    throw error;
  }
};


