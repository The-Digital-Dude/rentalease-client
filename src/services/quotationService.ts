import api from "./api";
import type { AxiosResponse } from "axios";

// Quotation interfaces
export interface Quotation {
  _id: string;
  quotationNumber: string;
  agency: string | {
    _id: string;
    name: string;
    email: string;
  };
  property: string | {
    _id: string;
    title: string;
    address: string;
  };
  createdBy: {
    userType: "SuperUser" | "Agency" | "PropertyManager";
    userId: string;
  };
  jobType: "Vacant Property Cleaning" | "Water Connection" | "Gas Connection" | "Electricity Connection" | "Landscaping & Outdoor Maintenance" | "Pest Control" | "Grout Cleaning" | "Removalists" | "Handyman Services" | "Painters";
  dueDate: string;
  description: string;
  attachments?: Array<{
    _id: string;
    fileName: string;
    fileUrl: string;
    fileSize: number;
    mimeType: string;
    cloudinaryId: string;
    uploadedAt: string;
  }>;
  amount?: number;
  notes?: string;
  validUntil: string;
  status: "Draft" | "Sent" | "Accepted" | "Rejected" | "Expired";
  sentAt?: string;
  respondedAt?: string;
  generatedJob?: string;
  generatedInvoice?: string;
  agencyResponse?: {
    respondedBy?: string;
    responseDate?: string;
    responseNotes?: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface CreateQuotationRequest {
  jobType: string;
  property: string;
  dueDate: string;
  description: string;
  status?: "Draft" | "Sent"; // Default is "Sent"
  agencyId?: string; // For SuperUser creating on behalf of agency
}

export interface UpdateQuotationRequest {
  amount?: number;
  notes?: string;
  validUntil?: string;
}

export interface RespondToQuotationRequest {
  action: "accept" | "reject";
  responseNotes?: string;
}

export interface QuotationListResponse {
  success: boolean;
  data: Quotation[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
  message?: string;
}

export interface SingleQuotationResponse {
  success: boolean;
  data: Quotation;
  message?: string;
}

export interface QuotationStatsResponse {
  success: boolean;
  data: {
    statusStats: Array<{
      _id: string;
      count: number;
      totalAmount: number;
    }>;
    monthlyStats: Array<{
      _id: {
        year: number;
        month: number;
      };
      count: number;
      totalAmount: number;
    }>;
  };
  message?: string;
}

export interface ApiResponse {
  success: boolean;
  message: string;
  data?: any;
}

class QuotationService {
  // Create a new quotation request
  async createQuotationRequest(
    quotationData: CreateQuotationRequest | FormData
  ): Promise<SingleQuotationResponse> {
    try {
      const isFormData = quotationData instanceof FormData;
      const config = isFormData
        ? {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          }
        : undefined;

      const response: AxiosResponse<SingleQuotationResponse> = await api.post(
        "/v1/quotations",
        quotationData,
        config
      );
      return response.data;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || "Failed to create quotation request"
      );
    }
  }

  // Get quotations (filtered by user role)
  async getQuotations(params?: {
    status?: string;
    page?: number;
    limit?: number;
  }): Promise<QuotationListResponse> {
    try {
      const response: AxiosResponse<QuotationListResponse> = await api.get(
        "/v1/quotations",
        { params }
      );
      return response.data;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || "Failed to fetch quotations"
      );
    }
  }

  // Get single quotation
  async getQuotation(id: string): Promise<SingleQuotationResponse> {
    try {
      const response: AxiosResponse<SingleQuotationResponse> = await api.get(
        `/v1/quotations/${id}`
      );
      return response.data;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || "Failed to fetch quotation"
      );
    }
  }

  // Update quotation (SuperUser only)
  async updateQuotation(
    id: string,
    updateData: UpdateQuotationRequest
  ): Promise<SingleQuotationResponse> {
    try {
      const response: AxiosResponse<SingleQuotationResponse> = await api.put(
        `/v1/quotations/${id}`,
        updateData
      );
      return response.data;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || "Failed to update quotation"
      );
    }
  }

  // Get all quotations for SuperUser management (no pagination)
  async getAllQuotations(): Promise<QuotationListResponse> {
    try {
      const response: AxiosResponse<QuotationListResponse> = await api.get(
        "/v1/quotations?limit=1000" // Get all quotations for management interface
      );
      return response.data;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || "Failed to fetch all quotations"
      );
    }
  }

  // Send quotation to agency (SuperUser only)
  async sendQuotation(
    id: string,
    quotationData?: UpdateQuotationRequest
  ): Promise<SingleQuotationResponse> {
    try {
      // If quotation data is provided, update the quotation first
      if (quotationData) {
        await this.updateQuotation(id, quotationData);
      }

      // Then send the quotation
      const response: AxiosResponse<SingleQuotationResponse> = await api.post(
        `/v1/quotations/${id}/send`
      );
      return response.data;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || "Failed to send quotation"
      );
    }
  }

  // Respond to quotation (Agency only)
  async respondToQuotation(
    id: string,
    responseData: RespondToQuotationRequest
  ): Promise<SingleQuotationResponse> {
    try {
      const response: AxiosResponse<SingleQuotationResponse> = await api.post(
        `/v1/quotations/${id}/respond`,
        responseData
      );
      return response.data;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || "Failed to respond to quotation"
      );
    }
  }

  // Delete quotation
  async deleteQuotation(id: string): Promise<ApiResponse> {
    try {
      const response: AxiosResponse<ApiResponse> = await api.delete(
        `/v1/quotations/${id}`
      );
      return response.data;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || "Failed to delete quotation"
      );
    }
  }

  // Get quotation statistics (SuperUser only)
  async getQuotationStats(): Promise<QuotationStatsResponse> {
    try {
      const response: AxiosResponse<QuotationStatsResponse> = await api.get(
        "/v1/quotations/stats"
      );
      return response.data;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || "Failed to fetch quotation statistics"
      );
    }
  }

  // Helper method to format quotations for display
  formatQuotationForDisplay(quotation: Quotation) {
    return {
      ...quotation,
      formattedDueDate: new Date(quotation.dueDate).toLocaleDateString(),
      formattedValidUntil: new Date(quotation.validUntil).toLocaleDateString(),
      formattedCreatedAt: new Date(quotation.createdAt).toLocaleDateString(),
      formattedAmount: quotation.amount ? `$${quotation.amount.toFixed(2)}` : "N/A",
      agencyName: typeof quotation.agency === "object" ? quotation.agency.name : "Unknown",
      propertyAddress: typeof quotation.property === "object" ? quotation.property.address : "Unknown",
      propertyTitle: typeof quotation.property === "object" ? quotation.property.title : "Unknown",
      isExpired: quotation.status === "Sent" && new Date(quotation.validUntil) < new Date(),
      canRespond: quotation.status === "Sent" && new Date(quotation.validUntil) > new Date(),
      statusColor: this.getStatusColor(quotation.status),
      statusIcon: this.getStatusIcon(quotation.status),
    };
  }

  // Get status color for UI
  private getStatusColor(status: string): string {
    switch (status) {
      case "Draft":
        return "#6c757d"; // gray
      case "Sent":
        return "#17a2b8"; // info blue
      case "Accepted":
        return "#28a745"; // success green
      case "Rejected":
        return "#dc3545"; // danger red
      case "Expired":
        return "#fd7e14"; // warning orange
      default:
        return "#6c757d";
    }
  }

  // Get status icon for UI
  private getStatusIcon(status: string): string {
    switch (status) {
      case "Draft":
        return "RiDraftLine";
      case "Sent":
        return "RiSendPlaneLine";
      case "Accepted":
        return "RiCheckboxCircleLine";
      case "Rejected":
        return "RiCloseCircleLine";
      case "Expired":
        return "RiTimeLine";
      default:
        return "RiQuestionLine";
    }
  }

  // Get available job types for beyond compliance
  getBeyondComplianceJobTypes(): string[] {
    return [
      "Vacant Property Cleaning",
      "Water Connection",
      "Gas Connection",
      "Electricity Connection",
      "Landscaping & Outdoor Maintenance",
      "Pest Control",
      "Grout Cleaning",
      "Removalists",
      "Handyman Services",
      "Painters",
    ];
  }

  // Validate quotation data before submission
  validateQuotationRequest(data: CreateQuotationRequest): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!data.jobType) {
      errors.push("Job type is required");
    } else if (!this.getBeyondComplianceJobTypes().includes(data.jobType)) {
      errors.push("Invalid job type selected");
    }

    if (!data.property) {
      errors.push("Property is required");
    }

    if (!data.dueDate) {
      errors.push("Due date is required");
    } else if (new Date(data.dueDate) <= new Date()) {
      errors.push("Due date must be in the future");
    }

    if (!data.description || data.description.trim().length === 0) {
      errors.push("Description is required");
    } else if (data.description.length > 1000) {
      errors.push("Description cannot exceed 1000 characters");
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  // Validate quotation update data
  validateQuotationUpdate(data: UpdateQuotationRequest): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (data.amount !== undefined) {
      if (data.amount <= 0) {
        errors.push("Amount must be greater than 0");
      }
    }

    if (data.notes !== undefined && data.notes.length > 500) {
      errors.push("Notes cannot exceed 500 characters");
    }

    if (data.validUntil !== undefined) {
      if (new Date(data.validUntil) <= new Date()) {
        errors.push("Valid until date must be in the future");
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }
}

const quotationService = new QuotationService();
export default quotationService;