import api from './api';
import type { AxiosResponse } from 'axios';

export interface Staff {
  id: string;
  fullName: string;
  tradeType: string;
  phone: string;
  email: string;
  availabilityStatus: 'Available' | 'Busy' | 'Off Duty';
  startDate: string;
  serviceRegions: string[];
  notes?: string;
  hourlyRate?: number;
  currentJobs: number;
  owner: {
    ownerType: string;
    ownerId: string;
  };
  licensingDocuments?: string[];
  insuranceDocuments?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface StaffResponse {
  status: 'success' | 'error';
  message: string;
  data: {
    staff: Staff[];
    pagination: {
      currentPage: number;
      totalPages: number;
      totalItems: number;
      itemsPerPage: number;
      hasNextPage: boolean;
      hasPrevPage: boolean;
    };
  };
}

export interface StaffApiResponse {
  success: boolean;
  message: string;
  data?: Staff[] | Staff | null;
  pagination?: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}

class StaffService {
  /**
   * Get all staff members with optional filters
   */
  async getStaff(filters?: {
    tradeType?: string;
    availabilityStatus?: string;
    serviceRegion?: string;
    status?: string;
    search?: string;
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }): Promise<StaffApiResponse> {
    try {
      const queryParams = new URLSearchParams();
      
      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== undefined && value !== null && value !== '') {
            queryParams.append(key, value.toString());
          }
        });
      }

      const url = `/v1/staff${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
      const response: AxiosResponse<StaffResponse> = await api.get(url);

      if (response.data.status === 'success') {
        return {
          success: true,
          message: response.data.message,
          data: response.data.data.staff,
          pagination: response.data.data.pagination
        };
      } else {
        return {
          success: false,
          message: response.data.message || 'Failed to fetch staff',
          data: []
        };
      }
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to fetch staff',
        data: []
      };
    }
  }

  /**
   * Update a staff member
   */
  async updateStaff(id: string, updateData: Partial<Staff>): Promise<StaffApiResponse> {
    try {
      const response: AxiosResponse<StaffResponse> = await api.put(`/v1/staff/${id}`, updateData);

      if (response.data.status === 'success') {
        return {
          success: true,
          message: response.data.message,
          data: response.data.data.staff
        };
      } else {
        return {
          success: false,
          message: response.data.message || 'Failed to update staff member',
          data: null
        };
      }
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to update staff member',
        data: null
      };
    }
  }
}

const staffService = new StaffService();
export default staffService; 