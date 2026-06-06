import api from "./api";
import type { AxiosResponse } from "axios";
import type { EmailParticipant } from "./emailService";

const INVOICE_SEND_TIMEOUT_MS = 60000;

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
  propertyAddress?: string;
  jobId:
    | string
    | {
        _id: string;
        job_id?: string;
        jobType?: string;
        property?:
          | string
          | {
              _id?: string;
              fullAddress?: string;
              address?: {
                street?: string;
                suburb?: string;
                state?: string;
                postcode?: string;
                fullAddress?: string;
              };
            };
      };
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
  status: "Draft" | "Sent" | "Paid" | string;
  notes?: string;
  paymentMethod?: string | null;
  paymentReference?: string | null;
  createdAt: string;
  sentAt?: string | null;
  paidAt?: string | null;
  updatedAt?: string;
}

export interface InvoiceDocumentReviewData {
  propertyAddress: string;
  jobType: string;
  jobNumber: string;
  agencyName?: string;
  attentionName?: string;
  invoiceDate?: string | null;
  dueDate?: string | null;
  reportSource?: "job" | "latestInspectionReport" | "generated" | null;
  reportFile: string | null;
  hasReport: boolean;
  recipients: {
    to: EmailParticipant[];
    cc: EmailParticipant[];
    bcc: EmailParticipant[];
  };
}

export interface InvoiceResponse {
  status: "success" | "error";
  message: string;
  data: {
    invoice: Invoice;
    reviewData?: InvoiceDocumentReviewData;
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

interface CreateInvoicePayload {
  jobId: string;
  description: string;
  items: InvoiceItem[];
  tax: number;
  notes?: string;
  technicianId?: string;
  agencyId?: string;
}

interface SendInvoicePayload {
  to?: EmailParticipant[];
  cc?: EmailParticipant[];
  bcc?: EmailParticipant[];
  subject: string;
  bodyHtml: string;
  bodyText?: string;
  attachments?: File[];
}

interface UpdateInvoiceStatusPayload {
  status: "Draft" | "Sent" | "Paid";
  paymentMethod?: string | null;
  paymentReference?: string;
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

  async updateInvoice(
    invoiceId: string,
    payload: {
      description: string;
      items: InvoiceItem[];
      tax: number;
      notes?: string;
    }
  ): Promise<InvoiceResponse> {
    const response: AxiosResponse<InvoiceResponse> = await api.patch(
      `${this.baseUrl}/${invoiceId}`,
      payload
    );
    return response.data;
  }

  async sendInvoice(
    invoiceId: string,
    payload: SendInvoicePayload
  ): Promise<InvoiceResponse> {
    let response: AxiosResponse<InvoiceResponse>;

    if (payload.attachments && payload.attachments.length > 0) {
      const formData = new FormData();
      formData.append("to", JSON.stringify(payload.to || []));
      formData.append("cc", JSON.stringify(payload.cc || []));
      formData.append("bcc", JSON.stringify(payload.bcc || []));
      formData.append("subject", payload.subject);
      formData.append("bodyHtml", payload.bodyHtml);
      if (payload.bodyText) {
        formData.append("bodyText", payload.bodyText);
      }
      payload.attachments.forEach((file) => {
        formData.append("attachments", file);
      });

      response = await api.patch(`${this.baseUrl}/${invoiceId}/send`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
        timeout: INVOICE_SEND_TIMEOUT_MS,
      });
    } else {
      response = await api.patch(`${this.baseUrl}/${invoiceId}/send`, payload, {
        timeout: INVOICE_SEND_TIMEOUT_MS,
      });
    }

    return response.data;
  }

  async updateInvoiceStatus(
    invoiceId: string,
    payload: UpdateInvoiceStatusPayload
  ): Promise<InvoiceResponse> {
    const response: AxiosResponse<InvoiceResponse> = await api.patch(
      `${this.baseUrl}/${invoiceId}/status`,
      payload
    );
    return response.data;
  }

  async createInvoice(payload: CreateInvoicePayload): Promise<InvoiceResponse> {
    const response: AxiosResponse<InvoiceResponse> = await api.post(
      this.baseUrl,
      payload
    );
    return response.data;
  }

  async generateDraftForJob(jobId: string): Promise<InvoiceResponse> {
    const response: AxiosResponse<InvoiceResponse> = await api.post(
      `${this.baseUrl}/job/${jobId}/generate-draft`
    );
    return response.data;
  }
}

const invoiceService = new InvoiceService();

export default invoiceService;
