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

export const applyToJob = async (id: string, data: CreateApplicationData): Promise<JobApplication> => {
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
    const response = await apiClient.get<ApiResponse<JobApplication[]>>(`/jobs/${jobId}/applications`);
    return response.data.data;
  } catch (error) {
    console.error('Error fetching job applications:', error);
    return [];
  }
};

export const updateApplicationStatus = async (
  applicationId: string, 
  status: JobApplication['status']
): Promise<JobApplication> => {
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
