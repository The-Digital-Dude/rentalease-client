import api from "./api";

export type LeadStatus =
  | "new"
  | "contacted"
  | "qualified"
  | "converted"
  | "closed";

export interface Lead {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  message: string;
  status: LeadStatus;
  source?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface LeadPagination {
  currentPage: number;
  totalPages: number;
  totalLeads: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export interface FetchLeadsParams {
  page?: number;
  limit?: number;
  status?: LeadStatus;
  search?: string;
  sortBy?: "createdAt" | "firstName" | "lastName" | "email" | "status";
  sortOrder?: "asc" | "desc";
  startDate?: string;
  endDate?: string;
}

export interface LeadServiceResponse {
  success: boolean;
  data: Lead[];
  pagination?: LeadPagination;
  message?: string;
}

export interface LeadUpdateResponse {
  success: boolean;
  data?: Lead;
  message?: string;
}

interface ServerLead {
  _id?: string;
  id?: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  message: string;
  status: LeadStatus;
  source?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

interface ServerPagination {
  currentPage: number;
  totalPages: number;
  totalLeads: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

interface ServerResponse {
  status: "success" | "error";
  message?: string;
  data: {
    leads: ServerLead[];
    pagination: ServerPagination;
  };
}

interface ServerUpdateResponse {
  status: "success" | "error";
  message?: string;
  data?: {
    lead?: ServerLead;
  };
}

const normalizeLead = (lead: ServerLead): Lead => ({
  id: lead._id || lead.id || "",
  firstName: lead.firstName,
  lastName: lead.lastName,
  email: lead.email,
  phone: lead.phone || undefined,
  message: lead.message,
  status: lead.status,
  source: lead.source,
  notes: lead.notes,
  createdAt: lead.createdAt,
  updatedAt: lead.updatedAt,
});

const leadService = {
  async getLeads(params: FetchLeadsParams = {}): Promise<LeadServiceResponse> {
    try {
      const response = await api.get<ServerResponse>("/v1/website-leads", {
        params,
      });

      if (response.data.status !== "success") {
        return {
          success: false,
          data: [],
          pagination: undefined,
          message: response.data.message || "Failed to fetch leads",
        };
      }

      const { leads, pagination } = response.data.data;

      return {
        success: true,
        data: leads.map(normalizeLead),
        pagination,
      };
    } catch (error: unknown) {
      let message = "Unable to fetch leads";

      if (typeof error === "object" && error !== null) {
        const maybeError = error as {
          response?: { data?: { message?: string } };
          message?: string;
        };

        message =
          maybeError.response?.data?.message ||
          maybeError.message ||
          message;
      }

      return {
        success: false,
        data: [],
        pagination: undefined,
        message,
      };
    }
  },

  async updateLeadStatus(id: string, status: LeadStatus): Promise<LeadUpdateResponse> {
    try {
      const response = await api.put<ServerUpdateResponse>(
        `/v1/website-leads/${id}`,
        { status }
      );

      if (response.data.status !== "success" || !response.data.data?.lead) {
        return {
          success: false,
          message: response.data.message || "Failed to update lead",
        };
      }

      return {
        success: true,
        data: normalizeLead(response.data.data.lead),
        message: response.data.message,
      };
    } catch (error: unknown) {
      let message = "Unable to update lead";

      if (typeof error === "object" && error !== null) {
        const maybeError = error as {
          response?: { data?: { message?: string } };
          message?: string;
        };

        message =
          maybeError.response?.data?.message ||
          maybeError.message ||
          message;
      }

      return {
        success: false,
        message,
      };
    }
  },
};

export default leadService;
