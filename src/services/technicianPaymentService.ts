import api from "./api";
import type { AxiosResponse } from "axios";

export interface TechnicianPayment {
  id: string;
  paymentNumber: string;
  technicianId: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
  };
  jobId: {
    _id: string;
    property: {
      _id: string;
      address: {
        street: string;
        suburb: string;
        state: string;
        postcode: string;
        fullAddress: string;
      };
    };
    job_id: string;
    jobType: string;
  };
  agencyId: {
    _id: string;
    companyName: string;
    contactPerson: string;
    email: string;
  };
  amount: number;
  status: "Pending" | "Paid" | "Processing" | string;
  jobType: string;
  jobCompletedAt: string;
  paymentMethod?: string | null;
  paidAt?: string | null;
  createdAt: string;
  updatedAt?: string;
}

export interface TechnicianPaymentResponse {
  status: "success" | "error";
  message: string;
  data: {
    payment: TechnicianPayment;
  };
}

export interface TechnicianPaymentsListResponse {
  status: "success" | "error";
  message: string;
  data: {
    payments: TechnicianPayment[];
    pagination: {
      currentPage: number;
      totalPages: number;
      totalItems: number;
      itemsPerPage: number;
      hasNextPage: boolean;
      hasPrevPage: boolean;
    };
    statistics?: Record<string, unknown>;
  };
}

interface TechnicianPaymentFilters {
  status?: string;
  technicianId?: string;
  agencyId?: string;
  jobType?: string;
  startDate?: string;
  endDate?: string;
  search?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

class TechnicianPaymentService {
  private baseUrl = "/v1/technician-payments";

  async getPaymentById(id: string): Promise<TechnicianPaymentResponse> {
    try {
      const response: AxiosResponse<TechnicianPaymentResponse> = await api.get(
        `${this.baseUrl}/${id}`
      );
      return response.data;
    } catch (error: any) {
      throw (
        error?.response?.data || {
          status: "error",
          message: "Failed to fetch payment",
        }
      );
    }
  }

  async getPayments(filters?: TechnicianPaymentFilters): Promise<TechnicianPaymentsListResponse> {
    try {
      const queryParams = new URLSearchParams();

      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== undefined && value !== null && value !== "") {
            queryParams.append(key, value.toString());
          }
        });
      }

      const url = `${this.baseUrl}${
        queryParams.toString() ? `?${queryParams.toString()}` : ""
      }`;

      console.log("TechnicianPaymentService: Making API call to:", url);
      console.log("TechnicianPaymentService: Filters:", filters);

      const response: AxiosResponse<TechnicianPaymentsListResponse> = await api.get(url);

      console.log("TechnicianPaymentService: API response:", response);
      console.log("TechnicianPaymentService: Response data:", response.data);

      return response.data;
    } catch (error: any) {
      console.error("TechnicianPaymentService: API error:", error);
      console.error("TechnicianPaymentService: Error response:", error?.response);
      throw (
        error?.response?.data || {
          status: "error",
          message: "Failed to fetch payments",
        }
      );
    }
  }
}

const technicianPaymentService = new TechnicianPaymentService();

export default technicianPaymentService;