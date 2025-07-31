import api from "./api";
import type { AxiosResponse } from "axios";

// Staff interfaces
export interface Staff {
  id: string;
  fullName: string;
  tradeType: string;
  availabilityStatus: "Available" | "Busy" | "Off Duty";
  currentJobs: number;
  maxJobs: number;
  experience: number;
  phone: string;
  email: string;
  status: "Active" | "Inactive" | "Suspended";
  owner: {
    ownerType: "SuperUser" | "Agency";
    ownerId: string;
  };
  createdAt: string;
  lastUpdated: string;
}

export interface StaffFilters {
  page?: number;
  limit?: number;
  tradeType?: string;
  availabilityStatus?: string;
  status?: string;
  search?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export interface CreateStaffData {
  fullName: string;
  tradeType: string;
  email: string;
  phone: string;
  password: string;
  experience?: number;
  availabilityStatus?: string;
  maxJobs?: number;
}

export interface UpdateStaffData {
  fullName?: string;
  tradeType?: string;
  email?: string;
  phone?: string;
  experience?: number;
  availabilityStatus?: string;
  maxJobs?: number;
  status?: string;
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
   * Get all staff with optional filters
   */
  async getStaff(filters?: StaffFilters): Promise<StaffApiResponse> {
    try {
      const queryParams = new URLSearchParams();

      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== undefined && value !== null && value !== "") {
            queryParams.append(key, value.toString());
          }
        });
      }

      const url = `/v1/staff${
        queryParams.toString() ? `?${queryParams.toString()}` : ""
      }`;
      const response: AxiosResponse<{
        status: string;
        message: string;
        data: {
          staff: Staff[];
          pagination?: {
            currentPage: number;
            totalPages: number;
            totalItems: number;
            itemsPerPage: number;
            hasNextPage: boolean;
            hasPrevPage: boolean;
          };
        };
      }> = await api.get(url);

      if (response.data.status === "success") {
        return {
          success: true,
          message: response.data.message,
          data: response.data.data.staff,
          pagination: response.data.data.pagination,
        };
      } else {
        return {
          success: false,
          message: response.data.message || "Failed to fetch staff",
          data: [],
        };
      }
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || "Failed to fetch staff",
        data: [],
      };
    }
  }

  /**
   * Get single staff by ID
   */
  async getStaffById(id: string): Promise<StaffApiResponse> {
    try {
      const response: AxiosResponse<{
        status: string;
        message: string;
        data: { staff: Staff };
      }> = await api.get(`/v1/staff/${id}`);

      if (response.data.status === "success") {
        return {
          success: true,
          message: response.data.message,
          data: response.data.data.staff,
        };
      } else {
        return {
          success: false,
          message: response.data.message || "Failed to fetch staff",
        };
      }
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || "Failed to fetch staff",
      };
    }
  }

  /**
   * Create new staff
   */
  async createStaff(data: CreateStaffData): Promise<StaffApiResponse> {
    try {
      const response: AxiosResponse<{
        status: string;
        message: string;
        data: { staff: Staff };
      }> = await api.post("/v1/staff", data, {
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (response.data.status === "success") {
        return {
          success: true,
          message: response.data.message,
          data: response.data.data.staff,
        };
      } else {
        return {
          success: false,
          message: response.data.message || "Failed to create staff",
        };
      }
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || "Failed to create staff",
      };
    }
  }

  /**
   * Update staff
   */
  async updateStaff(
    id: string,
    updateData: UpdateStaffData
  ): Promise<StaffApiResponse> {
    try {
      const response: AxiosResponse<{
        status: string;
        message: string;
        data: { staff: Staff };
      }> = await api.put(`/v1/staff/${id}`, updateData);

      if (response.data.status === "success") {
        return {
          success: true,
          message: response.data.message,
          data: response.data.data.staff,
        };
      } else {
        return {
          success: false,
          message: response.data.message || "Failed to update staff",
        };
      }
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || "Failed to update staff",
      };
    }
  }

  /**
   * Delete staff
   */
  async deleteStaff(id: string): Promise<StaffApiResponse> {
    try {
      const response: AxiosResponse<{
        status: string;
        message: string;
        data: { deletedStaffId: string };
      }> = await api.delete(`/v1/staff/${id}`);

      if (response.data.status === "success") {
        return {
          success: true,
          message: response.data.message,
          data: null,
        };
      } else {
        return {
          success: false,
          message: response.data.message || "Failed to delete staff",
        };
      }
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || "Failed to delete staff",
      };
    }
  }

  /**
   * Get available staff for job assignment
   */
  async getAvailableStaff(): Promise<StaffApiResponse> {
    try {
      const response = await this.getStaff({
        availabilityStatus: "Available",
        status: "Active",
        limit: 100,
        sortBy: "fullName",
        sortOrder: "asc",
      });
      return response;
    } catch (error: any) {
      return {
        success: false,
        message:
          error.response?.data?.message || "Failed to fetch available staff",
        data: [],
      };
    }
  }
}

const staffService = new StaffService();
export default staffService;
