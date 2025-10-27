import api from "./api";
import type { AxiosResponse } from "axios";

// Technician types based on the new schema
export interface Technician {
  id: string;
  firstName: string;
  lastName: string;
  fullName: string;
  email: string;
  phone: string;
  experience: number;
  availabilityStatus: "Available" | "Busy" | "Unavailable" | "On Leave";
  currentJobs: number;
  maxJobs: number;
  assignedJobs: AssignedJob[];
  completedJobs: number;
  averageRating: number;
  totalRatings: number;
  status: "Active" | "Inactive" | "Suspended" | "Pending";
  owner: {
    ownerType: "SuperUser" | "Agency";
    ownerId: string;
  };
  address: {
    street?: string;
    suburb?: string;
    state?: string;
    postcode?: string;
    fullAddress?: string;
  };

  createdAt: string;
  lastUpdated: string;
  lastLogin?: string;
  lastActive?: string;
}

export interface AssignedJob {
  jobId: string;
  assignedDate: string;
  status: "Active" | "Completed" | "Cancelled";
}

export interface TechnicianFilters {
  page?: number;
  limit?: number;
  experience?: number;
  availabilityStatus?: string;
  status?: string;
  search?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export interface CreateTechnicianData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  password: string;
  experience?: number;
  availabilityStatus?: string;
  maxJobs?: number;
  address?: {
    street?: string;
    suburb?: string;
    state?: string;
    postcode?: string;
  };
}

export interface UpdateTechnicianData {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  experience?: number;
  availabilityStatus?: string;
  maxJobs?: number;
  status?: string;
  address?: {
    street?: string;
    suburb?: string;
    state?: string;
    postcode?: string;
  };
}

export interface TechnicianApiResponse {
  status: "success" | "error";
  message: string;
  data: {
    technician?: Technician;
    technicians?: Technician[];
    pagination?: {
      currentPage: number;
      totalPages: number;
      totalItems: number;
      itemsPerPage: number;
      hasNextPage: boolean;
      hasPrevPage: boolean;
    };
  };
}

export interface TechnicianProfile {
  id: string;
  firstName: string;
  lastName: string;
  fullName: string;
  email: string;
  phone?: string;
  licenseNumber?: string;
  licenseExpiry?: string;
  experience?: number;
  hourlyRate?: number;
  availabilityStatus?: string;
  currentJobs?: number;
  maxJobs?: number;
  completedJobs?: number;
  averageRating?: number;
  totalRatings?: number;
  status?: string;
  address?: {
    street?: string;
    suburb?: string;
    state?: string;
    postcode?: string;
    fullAddress?: string;
  };
  profileImage?: {
    url?: string;
    cloudinaryId?: string;
  } | null;
  owner?: {
    ownerType: string;
    ownerId: string;
  };
  createdAt?: string;
  lastLogin?: string;
  lastActive?: string;
}

class TechnicianService {
  /**
   * Get all technicians with optional filters
   */
  async getTechnicians(
    filters?: TechnicianFilters
  ): Promise<TechnicianApiResponse> {
    try {
      const queryParams = new URLSearchParams();

      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== undefined && value !== null && value !== "") {
            queryParams.append(key, value.toString());
          }
        });
      }

      const url = `/v1/technicians${
        queryParams.toString() ? `?${queryParams.toString()}` : ""
      }`;
      const response: AxiosResponse<TechnicianApiResponse> = await api.get(url);

      return response.data;
    } catch (error: any) {
      return {
        status: "error",
        message: error.response?.data?.message || "Failed to fetch technicians",
        data: {},
      };
    }
  }

  /**
   * Get single technician by ID
   */
  async getTechnicianById(id: string): Promise<TechnicianApiResponse> {
    try {
      const response: AxiosResponse<TechnicianApiResponse> = await api.get(
        `/v1/technicians/${id}`
      );
      return response.data;
    } catch (error: any) {
      return {
        status: "error",
        message: error.response?.data?.message || "Failed to fetch technician",
        data: {},
      };
    }
  }

  /**
   * Create new technician
   */
  async createTechnician(
    data: CreateTechnicianData
  ): Promise<TechnicianApiResponse> {
    try {
      const response: AxiosResponse<TechnicianApiResponse> = await api.post(
        "/v1/technicians",
        data,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      return response.data;
    } catch (error: any) {
      return {
        status: "error",
        message: error.response?.data?.message || "Failed to create technician",
        data: {},
      };
    }
  }

  /**
   * Update technician
   */
  async updateTechnician(
    id: string,
    updateData: UpdateTechnicianData
  ): Promise<TechnicianApiResponse> {
    try {
      const response: AxiosResponse<TechnicianApiResponse> = await api.put(
        `/v1/technicians/${id}`,
        updateData
      );
      return response.data;
    } catch (error: any) {
      return {
        status: "error",
        message: error.response?.data?.message || "Failed to update technician",
        data: {},
      };
    }
  }

  /**
   * Delete technician
   */
  async deleteTechnician(id: string): Promise<TechnicianApiResponse> {
    try {
      const response: AxiosResponse<TechnicianApiResponse> = await api.delete(
        `/v1/technicians/${id}`
      );
      return response.data;
    } catch (error: any) {
      return {
        status: "error",
        message: error.response?.data?.message || "Failed to delete technician",
        data: {},
      };
    }
  }

  /**
   * Send email to technician
   */
  async sendEmailToTechnician(
    email: string,
    data: { subject: string; html: string }
  ): Promise<any> {
    try {
      const response = await api.post(`/v1/emails/send-general`, {
        to: email,
        subject: data.subject,
        html: data.html,
      });
      return response.data;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || "Failed to send email to Technician"
      );
    }
  }

  /**
   * Get available technicians for job assignment
   */
  async getAvailableTechnicians(): Promise<TechnicianApiResponse> {
    try {
      const response = await this.getTechnicians({
        availabilityStatus: "Available",
        status: "Active",
        limit: 100,
        sortBy: "fullName",
        sortOrder: "asc",
      });
      return response;
    } catch (error: any) {
      return {
        status: "error",
        message:
          error.response?.data?.message ||
          "Failed to fetch available technicians",
        data: {},
      };
    }
  }

  /**
   * Get my jobs (all jobs assigned to the authenticated technician)
   */
  async getMyJobs(filters?: {
    jobType?: string;
    status?: string;
    priority?: string;
    search?: string;
    startDate?: string;
    endDate?: string;
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: "asc" | "desc";
  }): Promise<any> {
    try {
      const queryParams = new URLSearchParams();

      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== undefined && value !== null && value !== "") {
            queryParams.append(key, value.toString());
          }
        });
      }

      const url = `/v1/technicians/my-jobs${
        queryParams.toString() ? `?${queryParams.toString()}` : ""
      }`;
      const response = await api.get(url);
      return response.data;
    } catch (error: any) {
      return {
        status: "error",
        message: error.response?.data?.message || "Failed to fetch my jobs",
        data: {},
      };
    }
  }

  /**
   * Get active jobs (claimed by technician, not completed, not overdue)
   */
  async getActiveJobs(filters?: {
    jobType?: string;
    priority?: string;
    search?: string;
    startDate?: string;
    endDate?: string;
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: "asc" | "desc";
  }): Promise<any> {
    try {
      const queryParams = new URLSearchParams();

      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== undefined && value !== null && value !== "") {
            queryParams.append(key, value.toString());
          }
        });
      }

      const url = `/v1/technicians/active-jobs${
        queryParams.toString() ? `?${queryParams.toString()}` : ""
      }`;
      const response = await api.get(url);
      return response.data;
    } catch (error: any) {
      return {
        status: "error",
        message: error.response?.data?.message || "Failed to fetch active jobs",
        data: {},
      };
    }
  }

  /**
   * Get overdue jobs (assigned to technician, due date is behind, not completed)
   */
  async getOverdueJobs(filters?: {
    jobType?: string;
    priority?: string;
    search?: string;
    startDate?: string;
    endDate?: string;
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: "asc" | "desc";
  }): Promise<any> {
    try {
      const queryParams = new URLSearchParams();

      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== undefined && value !== null && value !== "") {
            queryParams.append(key, value.toString());
          }
        });
      }

      const url = `/v1/technicians/overdue-jobs${
        queryParams.toString() ? `?${queryParams.toString()}` : ""
      }`;
      const response = await api.get(url);
      return response.data;
    } catch (error: any) {
      return {
        status: "error",
        message:
          error.response?.data?.message || "Failed to fetch overdue jobs",
        data: {},
      };
    }
  }

  /**
   * Get completed jobs (assigned to technician, status is completed)
   */
  async getCompletedJobs(filters?: {
    jobType?: string;
    priority?: string;
    search?: string;
    startDate?: string;
    endDate?: string;
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: "asc" | "desc";
  }): Promise<any> {
    try {
      const queryParams = new URLSearchParams();

      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== undefined && value !== null && value !== "") {
            queryParams.append(key, value.toString());
          }
        });
      }

      const url = `/v1/technicians/completed-jobs${
        queryParams.toString() ? `?${queryParams.toString()}` : ""
      }`;
      const response = await api.get(url);
      return response.data;
    } catch (error: any) {
      return {
        status: "error",
        message:
          error.response?.data?.message || "Failed to fetch completed jobs",
        data: {},
      };
    }
  }

  /**
   * Get technician payments
   */
  async getMyPayments(filters?: {
    status?: string;
    jobType?: string;
    startDate?: string;
    endDate?: string;
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: "asc" | "desc";
  }): Promise<any> {
    try {
      const queryParams = new URLSearchParams();

      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== undefined && value !== null && value !== "") {
            queryParams.append(key, value.toString());
          }
        });
      }

      const url = `/v1/technician-payments/my-payments${
        queryParams.toString() ? `?${queryParams.toString()}` : ""
      }`;
      const response = await api.get(url);
      return response.data;
    } catch (error: any) {
      return {
        status: "error",
        message: error.response?.data?.message || "Failed to fetch payments",
        data: {},
      };
    }
  }

  /**
   * Get current technician profile
   */
  async getProfile(): Promise<TechnicianProfile> {
    const response = await api.get("/v1/technician/auth/profile");

    if (response.data?.status === "success" && response.data?.data?.technician) {
      return response.data.data.technician as TechnicianProfile;
    }

    throw new Error(
      response.data?.message || "Failed to load technician profile"
    );
  }

  /**
   * Update technician profile
   */
  async updateProfile(payload: {
    firstName?: string;
    lastName?: string;
    phone?: string;
    licenseNumber?: string;
    licenseExpiry?: string;
    experience?: number;
    hourlyRate?: number;
    address?: {
      street?: string;
      suburb?: string;
      state?: string;
      postcode?: string;
    };
  }): Promise<TechnicianProfile> {
    const response = await api.put("/v1/technician/auth/profile", payload);

    if (response.data?.status === "success" && response.data?.data?.technician) {
      return response.data.data.technician as TechnicianProfile;
    }

    throw new Error(
      response.data?.message || "Failed to update technician profile"
    );
  }

  /**
   * Get technician dashboard data
   */
  async getDashboardData(): Promise<any> {
    try {
      const response = await api.get("/v1/technicians/dashboard");
      return response.data;
    } catch (error: any) {
      return {
        status: "error",
        message:
          error.response?.data?.message || "Failed to fetch dashboard data",
        data: {},
      };
    }
  }
}

const technicianService = new TechnicianService();
export default technicianService;
