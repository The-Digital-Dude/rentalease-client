import api from "./api";
import type { AxiosResponse } from "axios";

// Property Manager Invoice interfaces
export interface PropertyManagerInvoice {
  id?: string; // For list responses
  _id?: string; // For single responses
  invoiceNumber: string;
  propertyId?: {
    _id: string;
    address: {
      street: string;
      suburb: string;
      state: string;
      postcode: string;
      fullAddress: string;
    };
    propertyType: string;
    region: string;
  };
  property?: // For backwards compatibility
    | {
        _id: string;
        fullAddress: string;
        assignedPropertyManager?: {
          _id: string;
          firstName: string;
          lastName: string;
          email: string;
          phone: string;
          status: string;
        };
      }
    | string;
  propertyManagerId?: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
  };
  propertyManager?: // For backwards compatibility
    | {
        _id: string;
        firstName: string;
        lastName: string;
        email: string;
      }
    | string;
  agencyId?: {
    _id: string;
    companyName: string;
    contactPerson: string;
  };
  agency?: // For backwards compatibility
    | {
        _id: string;
        agencyName: string;
      }
    | string;
  description: string;
  amount: number;
  dueDate: string;
  status: "Pending" | "Sent" | "Paid";
  notes?: string;
  createdBy?: {
    userType: "SuperUser" | "TeamMember" | "Agency";
    userId: string;
  };
  sentAt?: string | null;
  paidAt?: string | null;
  paymentMethod?: string;
  paymentReference?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface CreatePropertyManagerInvoiceRequest {
  propertyId: string;
  description: string;
  amount: number;
  dueDate: string;
  notes?: string;
}

export interface UpdatePropertyManagerInvoiceRequest {
  description?: string;
  amount?: number;
  dueDate?: string;
  notes?: string;
  status?: "Pending" | "Sent" | "Paid";
}

export interface UpdateInvoiceStatusRequest {
  status: "Pending" | "Sent" | "Paid";
  paymentMethod?: string;
  paymentReference?: string;
}

export interface PropertyManagerInvoiceListResponse {
  status: string;
  success?: boolean;
  message?: string;
  data: {
    invoices: PropertyManagerInvoice[];
    pagination: {
      currentPage: number;
      totalPages: number;
      totalItems: number;
      itemsPerPage: number;
      hasNextPage: boolean;
      hasPrevPage: boolean;
    };
    statistics?: {
      totalInvoices: number;
      totalAmount: number;
      paidAmount: number;
      pendingAmount: number;
      statusCounts: {
        Pending?: number;
        Sent?: number;
        Paid?: number;
      };
    };
  };
}

export interface SinglePropertyManagerInvoiceResponse {
  success: boolean;
  data: PropertyManagerInvoice;
  message?: string;
}

export interface PropertyManagerInvoiceStatsResponse {
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

class PropertyManagerInvoiceService {
  // Create a new property manager invoice
  async createPropertyManagerInvoice(
    invoiceData: CreatePropertyManagerInvoiceRequest
  ): Promise<SinglePropertyManagerInvoiceResponse> {
    try {
      console.log(invoiceData);
      const response: AxiosResponse<SinglePropertyManagerInvoiceResponse> =
        await api.post("/v1/property-manager-invoices", invoiceData);
      return response.data;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || "Failed to create invoice"
      );
    }
  }

  // Get property manager invoices (filtered by user role)
  async getPropertyManagerInvoices(params?: {
    status?: string;
    property?: string;
    propertyManager?: string;
    agency?: string;
    startDate?: string;
    endDate?: string;
    page?: number;
    limit?: number;
  }): Promise<PropertyManagerInvoiceListResponse> {
    try {
      const response: AxiosResponse<PropertyManagerInvoiceListResponse> =
        await api.get("/v1/property-manager-invoices", { params });
      return response.data;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || "Failed to fetch invoices"
      );
    }
  }

  // Get single property manager invoice
  async getPropertyManagerInvoice(
    id: string
  ): Promise<SinglePropertyManagerInvoiceResponse> {
    try {
      const response: AxiosResponse<SinglePropertyManagerInvoiceResponse> =
        await api.get(`/v1/property-manager-invoices/${id}`);
      return response.data;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || "Failed to fetch invoice"
      );
    }
  }

  // Update property manager invoice (SuperUser only)
  async updatePropertyManagerInvoice(
    id: string,
    updateData: UpdatePropertyManagerInvoiceRequest
  ): Promise<SinglePropertyManagerInvoiceResponse> {
    try {
      const response: AxiosResponse<SinglePropertyManagerInvoiceResponse> =
        await api.put(`/v1/property-manager-invoices/${id}`, updateData);
      return response.data;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || "Failed to update invoice"
      );
    }
  }

  // Get all property manager invoices for SuperUser management (no pagination)
  async getAllPropertyManagerInvoices(): Promise<PropertyManagerInvoiceListResponse> {
    try {
      const response: AxiosResponse<PropertyManagerInvoiceListResponse> =
        await api.get(
          "/v1/property-manager-invoices" // Get all invoices for management interface
        );
      return response.data;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || "Failed to fetch all invoices"
      );
    }
  }

  // Get invoices by Property Manager
  async getInvoicesByPropertyManager(
    propertyManagerId: string,
    params?: {
      status?: string;
      page?: number;
      limit?: number;
    }
  ): Promise<PropertyManagerInvoiceListResponse> {
    try {
      const response: AxiosResponse<PropertyManagerInvoiceListResponse> =
        await api.get(
          `/v1/property-manager-invoices/property-manager/${propertyManagerId}`,
          { params }
        );
      return response.data;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message ||
          "Failed to fetch property manager invoices"
      );
    }
  }

  // Get invoices by Agency
  async getInvoicesByAgency(
    agencyId: string,
    params?: {
      propertyManager?: string;
      status?: string;
      page?: number;
      limit?: number;
    }
  ): Promise<PropertyManagerInvoiceListResponse> {
    try {
      const response: AxiosResponse<PropertyManagerInvoiceListResponse> =
        await api.get(`/v1/property-manager-invoices/agency/${agencyId}`, {
          params,
        });
      return response.data;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || "Failed to fetch agency invoices"
      );
    }
  }

  // Update invoice status
  async updateInvoiceStatus(
    id: string,
    statusData: UpdateInvoiceStatusRequest
  ): Promise<SinglePropertyManagerInvoiceResponse> {
    try {
      const response: AxiosResponse<SinglePropertyManagerInvoiceResponse> =
        await api.patch(
          `/v1/property-manager-invoices/${id}/status`,
          statusData
        );
      return response.data;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || "Failed to update invoice status"
      );
    }
  }

  // Delete property manager invoice
  async deletePropertyManagerInvoice(id: string): Promise<ApiResponse> {
    try {
      const response: AxiosResponse<ApiResponse> = await api.delete(
        `/v1/property-manager-invoices/${id}`
      );
      return response.data;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || "Failed to delete invoice"
      );
    }
  }

  // Get property manager invoice statistics (SuperUser only)
  async getPropertyManagerInvoiceStats(): Promise<PropertyManagerInvoiceStatsResponse> {
    try {
      const response: AxiosResponse<PropertyManagerInvoiceStatsResponse> =
        await api.get("/v1/property-manager-invoices/stats");
      return response.data;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || "Failed to fetch invoice statistics"
      );
    }
  }

  // Helper method to format invoices for display
  formatPropertyManagerInvoiceForDisplay(invoice: PropertyManagerInvoice) {
    return {
      ...invoice,
      formattedDueDate: new Date(invoice.dueDate).toLocaleDateString(),
      formattedCreatedAt: new Date(invoice.createdAt).toLocaleDateString(),
      formattedAmount: `$${invoice.amount.toFixed(2)}`,
      propertyAddress:
        typeof invoice.property === "object"
          ? invoice.property.fullAddress
          : "Unknown",
      statusColor: this.getStatusColor(invoice.status),
      statusIcon: this.getStatusIcon(invoice.status),
    };
  }

  // Get status color for UI
  private getStatusColor(status: string): string {
    switch (status) {
      case "Pending":
        return "#ffc107"; // warning yellow
      case "Sent":
        return "#17a2b8"; // info blue
      case "Paid":
        return "#28a745"; // success green
      default:
        return "#6c757d";
    }
  }

  // Get status icon for UI
  private getStatusIcon(status: string): string {
    switch (status) {
      case "Pending":
        return "RiTimeLine";
      case "Sent":
        return "RiSendPlaneLine";
      case "Paid":
        return "RiCheckboxCircleLine";
      default:
        return "RiQuestionLine";
    }
  }

  // Validate property manager invoice data before submission
  validatePropertyManagerInvoiceRequest(
    data: CreatePropertyManagerInvoiceRequest
  ): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!data.propertyId) {
      errors.push("Property is required");
    }

    if (!data.description || data.description.trim().length === 0) {
      errors.push("Description is required");
    } else if (data.description.length > 1000) {
      errors.push("Description cannot exceed 1000 characters");
    }

    if (!data.amount) {
      errors.push("Amount is required");
    } else if (data.amount <= 0) {
      errors.push("Amount must be greater than 0");
    }

    if (!data.dueDate) {
      errors.push("Due date is required");
    } else if (new Date(data.dueDate) <= new Date()) {
      errors.push("Due date must be in the future");
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  // Validate property manager invoice update data
  validatePropertyManagerInvoiceUpdate(
    data: UpdatePropertyManagerInvoiceRequest
  ): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (data.amount !== undefined) {
      if (data.amount <= 0) {
        errors.push("Amount must be greater than 0");
      }
    }

    if (data.description !== undefined && data.description.length > 1000) {
      errors.push("Description cannot exceed 1000 characters");
    }

    if (data.dueDate !== undefined) {
      if (new Date(data.dueDate) <= new Date()) {
        errors.push("Due date must be in the future");
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }
}

const propertyManagerInvoiceService = new PropertyManagerInvoiceService();
export default propertyManagerInvoiceService;
