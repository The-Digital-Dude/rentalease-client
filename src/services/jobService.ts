import api from './api';
import type { AxiosResponse } from 'axios';

// Job interfaces
export interface Job {
  id: string;
  job_id: string;
  propertyAddress: string;
  jobType: 'Gas' | 'Electrical' | 'Smoke' | 'Repairs';
  dueDate: string;
  assignedTechnician: string | { fullName: string } | null;
  status: 'Pending' | 'Scheduled' | 'Completed' | 'Overdue';
  priority: 'Low' | 'Medium' | 'High' | 'Urgent';
  description?: string;
  createdAt: string;
}

export interface CreateJobData {
  propertyAddress: string;
  jobType: 'Gas' | 'Electrical' | 'Smoke' | 'Repairs';
  dueDate: string;
  assignedTechnician: string | null;
  description?: string;
  priority?: 'Low' | 'Medium' | 'High' | 'Urgent';
  estimatedDuration?: number;
  notes?: string;
}

export interface UpdateJobData {
  propertyAddress?: string;
  jobType?: 'Gas' | 'Electrical' | 'Smoke' | 'Repairs';
  dueDate?: string;
  assignedTechnician?: string;
  status?: 'Pending' | 'Scheduled' | 'Completed' | 'Overdue';
  description?: string;
  priority?: 'Low' | 'Medium' | 'High' | 'Urgent';
  estimatedDuration?: number;
  actualDuration?: number;
  cost?: {
    materialCost?: number;
    laborCost?: number;
  };
  notes?: string;
}

export interface JobsResponse {
  status: 'success' | 'error';
  message: string;
  data: {
    jobs: Job[];
    pagination: {
      currentPage: number;
      totalPages: number;
      totalItems: number;
      itemsPerPage: number;
      hasNextPage: boolean;
      hasPrevPage: boolean;
    };
    statistics: {
      statusCounts: Record<string, number>;
      totalJobs: number;
    };
  };
}

export interface SingleJobResponse {
  status: 'success' | 'error';
  message: string;
  data: {
    job: Job;
  };
}

export interface JobFilters {
  page?: number;
  limit?: number;
  jobType?: string;
  status?: string;
  assignedTechnician?: string;
  priority?: string;
  search?: string;
  startDate?: string;
  endDate?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface JobApiResponse {
  success: boolean;
  message: string;
  data?: Job[] | Job | {
    job: Job;
    technician: {
      id: string;
      fullName: string;
      currentJobs: number;
      availabilityStatus: string;
    };
  } | null;
  pagination?: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
  statistics?: {
    statusCounts: Record<string, number>;
    totalJobs: number;
  };
}

class JobService {
  /**
   * Get all jobs with optional filters
   */
  async getJobs(filters?: JobFilters): Promise<JobApiResponse> {
    try {
      const queryParams = new URLSearchParams();
      
      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== undefined && value !== null && value !== '') {
            queryParams.append(key, value.toString());
          }
        });
      }

      const url = `/v1/jobs${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
      const response: AxiosResponse<JobsResponse> = await api.get(url);

      if (response.data.status === 'success') {
        return {
          success: true,
          message: response.data.message,
          data: response.data.data.jobs,
          pagination: response.data.data.pagination,
          statistics: response.data.data.statistics
        };
      } else {
        return {
          success: false,
          message: response.data.message || 'Failed to fetch jobs',
          data: []
        };
      }
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to fetch jobs',
        data: []
      };
    }
  }

  /**
   * Get a single job by ID
   */
  async getJobById(id: string): Promise<JobApiResponse> {
    try {
      const response: AxiosResponse<SingleJobResponse> = await api.get(`/v1/jobs/${id}`);

      if (response.data.status === 'success') {
        return {
          success: true,
          message: response.data.message,
          data: response.data.data.job
        };
      } else {
        return {
          success: false,
          message: response.data.message || 'Job not found',
        };
      }
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to fetch job',
      };
    }
  }

  /**
   * Create a new job
   */
  async createJob(jobData: CreateJobData): Promise<JobApiResponse> {
    try {
      const response: AxiosResponse<SingleJobResponse> = await api.post('/v1/jobs', jobData);

      if (response.data.status === 'success') {
        return {
          success: true,
          message: response.data.message,
          data: response.data.data.job
        };
      } else {
        return {
          success: false,
          message: response.data.message || 'Failed to create job',
        };
      }
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to create job',
      };
    }
  }

  /**
   * Update an existing job
   */
  async updateJob(id: string, updateData: UpdateJobData): Promise<JobApiResponse> {
    try {
      const response: AxiosResponse<SingleJobResponse> = await api.put(`/v1/jobs/${id}`, updateData);

      if (response.data.status === 'success') {
        return {
          success: true,
          message: response.data.message,
          data: response.data.data.job
        };
      } else {
        return {
          success: false,
          message: response.data.message || 'Failed to update job',
        };
      }
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to update job',
      };
    }
  }

  /**
   * Update job status quickly
   */
  async updateJobStatus(id: string, status: Job['status']): Promise<JobApiResponse> {
    try {
      const response: AxiosResponse<SingleJobResponse> = await api.patch(`/v1/jobs/${id}/status`, { status });

      if (response.data.status === 'success') {
        return {
          success: true,
          message: response.data.message,
          data: response.data.data.job
        };
      } else {
        return {
          success: false,
          message: response.data.message || 'Failed to update job status',
        };
      }
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to update job status',
      };
    }
  }

  /**
   * Delete a job (only for super users)
   */
  async deleteJob(id: string): Promise<JobApiResponse> {
    try {
      const response: AxiosResponse<{status: string; message: string; data: {deletedJobId: string}}> = await api.delete(`/v1/jobs/${id}`);

      if (response.data.status === 'success') {
        return {
          success: true,
          message: response.data.message,
          data: null
        };
      } else {
        return {
          success: false,
          message: response.data.message || 'Failed to delete job',
        };
      }
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to delete job',
      };
    }
  }

  /**
   * Get dashboard statistics
   */
  async getDashboardStats(): Promise<JobApiResponse> {
    try {
      const response = await this.getJobs({ limit: 1 }); // Just get stats
      
      if (response.success && response.statistics) {
        return {
          success: true,
          message: 'Dashboard statistics retrieved successfully',
          statistics: response.statistics
        };
      } else {
        return {
          success: false,
          message: 'Failed to fetch dashboard statistics',
        };
      }
    } catch (error: any) {
      return {
        success: false,
        message: 'Failed to fetch dashboard statistics',
      };
    }
  }

  /**
   * Get urgent/overdue jobs
   */
  async getUrgentJobs(): Promise<JobApiResponse> {
    try {
      // Get jobs with urgent priority or overdue status
      const urgentResponse = await this.getJobs({ 
        priority: 'Urgent', 
        limit: 50,
        sortBy: 'dueDate',
        sortOrder: 'asc'
      });
      
      const overdueResponse = await this.getJobs({ 
        status: 'Overdue', 
        limit: 50,
        sortBy: 'dueDate',
        sortOrder: 'asc'
      });

      const urgentJobs = urgentResponse.data as Job[] || [];
      const overdueJobs = overdueResponse.data as Job[] || [];

      // Combine and deduplicate
      const allUrgentJobs = [...urgentJobs];
      overdueJobs.forEach(job => {
        if (!urgentJobs.find(uj => uj.id === job.id)) {
          allUrgentJobs.push(job);
        }
      });

      // Sort by due date
      allUrgentJobs.sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());

      return {
        success: true,
        message: 'Urgent jobs retrieved successfully',
        data: allUrgentJobs
      };
    } catch (error: any) {
      return {
        success: false,
        message: 'Failed to fetch urgent jobs',
        data: []
      };
    }
  }

  /**
   * Assign a job to a technician (super users only)
   */
  async assignJob(jobId: string, technicianId: string): Promise<JobApiResponse> {
    try {
      const response: AxiosResponse<{
        status: string;
        message: string;
        data: {
          job: Job;
          technician: {
            id: string;
            fullName: string;
            currentJobs: number;
            availabilityStatus: string;
          };
        };
      }> = await api.patch(`/v1/jobs/${jobId}/assign`, { technicianId });

      if (response.data.status === 'success') {
        return {
          success: true,
          message: response.data.message,
          data: response.data.data // Return both job and technician data
        };
      } else {
        return {
          success: false,
          message: response.data.message || 'Failed to assign job',
        };
      }
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to assign job',
      };
    }
  }

  /**
   * Get available technicians for job assignment
   */
  async getAvailableTechnicians(): Promise<JobApiResponse> {
    try {
      // Import staff API from this file's API service
      const { staffAPI } = await import('./api');
      
      const response = await staffAPI.getStaff({
        availabilityStatus: 'Available',
        status: 'Active',
        limit: 100, // Get all available technicians
        sortBy: 'fullName',
        sortOrder: 'asc'
      });

      if (response.data.status === 'success') {
        // Transform staff data to technician format for job assignment
        const technicians = response.data.data.staff.map((staff: any) => ({
          id: staff.id,
          fullName: staff.fullName,
          tradeType: staff.tradeType,
          phone: staff.phone,
          email: staff.email,
          availabilityStatus: staff.availabilityStatus,
          serviceRegions: staff.serviceRegions,
        }));

        return {
          success: true,
          message: 'Available technicians retrieved successfully',
          data: technicians
        };
      } else {
        return {
          success: false,
          message: 'Failed to fetch technicians',
          data: []
        };
      }
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to fetch technicians',
        data: []
      };
    }
  }
}

// Create and export a singleton instance
const jobService = new JobService();
export default jobService; 