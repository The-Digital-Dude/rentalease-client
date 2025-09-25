import api from "./api";
import type { AxiosResponse } from "axios";

export interface InvoiceItem {
  _id?: string;
  id?: string;
  name: string;
  quantity: number;
  rate: number;
  amount: number;
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  jobId: string | { _id: string; job_id?: string; jobType?: string; property?: string };
  technicianId:
    | string
    | {
        _id: string;
        firstName?: string;
        lastName?: string;
        email?: string;
        phone?: string;
      };
  agencyId:
    | string
    | {
        _id: string;
        companyName?: string;
        contactPerson?: string;
        email?: string;
        phone?: string;
      };
  description: string;
  items: InvoiceItem[];
  subtotal: number;
  tax: number;
  totalCost: number;
  status: "Pending" | "Sent" | "Paid" | string;
  notes?: string;
  paymentMethod?: string | null;
  paymentReference?: string | null;
  createdAt: string;
  sentAt?: string | null;
  paidAt?: string | null;
  updatedAt?: string;
}

export interface InvoiceResponse {
  status: "success" | "error";
  message: string;
  data: {
    invoice: Invoice;
  };
}

export interface InvoicesListResponse {
  status: "success" | "error";
  message: string;
  data: {
    invoices: Invoice[];
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

interface InvoiceFilters {
  status?: string;
  technicianId?: string;
  agencyId?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

class InvoiceService {
  private baseUrl = "/v1/invoices";

  async getInvoiceById(id: string): Promise<InvoiceResponse> {
    try {
      const response: AxiosResponse<InvoiceResponse> = await api.get(
        `${this.baseUrl}/${id}`
      );
      return response.data;
    } catch (error: any) {
      throw (
        error?.response?.data || {
          status: "error",
          message: "Failed to fetch invoice",
        }
      );
    }
  }

  async getInvoiceByJobId(jobId: string): Promise<InvoiceResponse> {
    try {
      const response: AxiosResponse<InvoiceResponse> = await api.get(
        `${this.baseUrl}/job/${jobId}`
      );
      return response.data;
    } catch (error: any) {
      throw (
        error?.response?.data || {
          status: "error",
          message: "Failed to fetch invoice for job",
        }
      );
    }
  }

  async getInvoices(filters?: InvoiceFilters): Promise<InvoicesListResponse> {
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

      console.log("InvoiceService: Making API call to:", url);
      console.log("InvoiceService: Filters:", filters);
      console.log("InvoiceService: Query params:", queryParams.toString());

      const response: AxiosResponse<InvoicesListResponse> = await api.get(url);

      console.log("InvoiceService: API response:", response);
      console.log("InvoiceService: Response data:", response.data);

      return response.data;
    } catch (error: any) {
      console.error("InvoiceService: API error:", error);
      console.error("InvoiceService: Error response:", error?.response);
      throw (
        error?.response?.data || {
          status: "error",
          message: "Failed to fetch invoices",
        }
      );
    }
  }
}

const invoiceService = new InvoiceService();

export default invoiceService;
