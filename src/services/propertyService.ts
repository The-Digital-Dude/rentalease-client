import api from "./api";
import type { AxiosResponse } from "axios";

// Property interfaces
export interface PropertyAddress {
  street: string;
  suburb: string;
  state: "NSW" | "VIC" | "QLD" | "WA" | "SA" | "TAS" | "NT" | "ACT";
  postcode: string;
  fullAddress?: string;
}

export interface PropertyTenant {
  name: string;
  email: string;
  phone: string;
}

export interface PropertyLandlord {
  name: string;
  email: string;
  phone: string;
}

export interface ComplianceItem {
  nextInspection?: string;
  required?: boolean;
  status?: "Compliant" | "Due Soon" | "Overdue" | "Not Required";
}

export interface ComplianceSchedule {
  gasCompliance?: ComplianceItem;
  electricalSafety?: ComplianceItem;
  smokeAlarms?: ComplianceItem;
  poolSafety?: ComplianceItem;
}

export interface ComplianceSummary {
  total: number;
  compliant: number;
  dueSoon: number;
  overdue: number;
  complianceScore: number;
}

export interface Property {
  id: string;
  address: PropertyAddress;
  fullAddress: string;
  propertyType: "House" | "Apartment" | "Townhouse" | "Commercial" | "Other";
  region: string;
  agency: {
    _id: string;
    companyName: string;
    contactPerson: string;
    email?: string;
    phone?: string;
  };
  currentTenant: PropertyTenant;
  currentLandlord: PropertyLandlord;
  complianceSchedule?: ComplianceSchedule;
  notes?: string;
  hasOverdueCompliance?: boolean;
  complianceSummary?: ComplianceSummary;
  createdAt: string;
  updatedAt?: string;
}

export interface CreatePropertyData {
  address: PropertyAddress;
  propertyType?: "House" | "Apartment" | "Townhouse" | "Commercial" | "Other";
  propertyManager?: string; // Only for super users
  agencyId?: string; // Required for super users when creating properties
  region?: string;
  currentTenant: PropertyTenant;
  currentLandlord: PropertyLandlord;
  complianceSchedule?: ComplianceSchedule;
  notes?: string;
}

export interface UpdatePropertyData {
  address?: PropertyAddress;
  propertyType?: "House" | "Apartment" | "Townhouse" | "Commercial" | "Other";
  bedrooms?: number;
  bathrooms?: number;
  rentAmount?: number;
  status?: "Available" | "Occupied" | "Maintenance" | "Pending";
  currentTenant?: PropertyTenant;
  notes?: string;
}

export interface PropertiesResponse {
  status: "success" | "error";
  message?: string;
  data: {
    properties: Property[];
    pagination: {
      currentPage: number;
      totalPages: number;
      totalCount: number;
      hasNext: boolean;
      hasPrev: boolean;
    };
  };
}

export interface PropertyResponse {
  status: "success" | "error";
  message: string;
  data: {
    property: Property;
  };
}

export interface PropertyComplianceResponse {
  status: "success" | "error";
  data: {
    propertyId: string;
    fullAddress: string;
    complianceSummary: ComplianceSummary;
    hasOverdueCompliance: boolean;
    complianceSchedule: ComplianceSchedule;
  };
}

// Property Service Class
class PropertyService {
  private baseUrl = "/v1/properties";

  // Create Property
  async createProperty(
    propertyData: CreatePropertyData
  ): Promise<PropertyResponse> {
    try {
      const response: AxiosResponse<PropertyResponse> = await api.post(
        this.baseUrl,
        propertyData
      );
      return response.data;
    } catch (error: any) {
      throw (
        error?.response?.data || {
          status: "error",
          message: "Failed to create property",
        }
      );
    }
  }

  // Get All Properties
  async getProperties(params?: {
    status?: string;
    propertyType?: string;
    region?: string;
    state?: string;
    page?: number;
    limit?: number;
    search?: string;
  }): Promise<PropertiesResponse> {
    try {
      const response: AxiosResponse<PropertiesResponse> = await api.get(
        this.baseUrl,
        { params }
      );

      return response.data;
    } catch (error: any) {
      throw (
        error?.response?.data || {
          status: "error",
          message: "Failed to fetch properties",
        }
      );
    }
  }

  // Get Single Property
  async getProperty(id: string): Promise<PropertyResponse> {
    try {
      const response: AxiosResponse<PropertyResponse> = await api.get(
        `${this.baseUrl}/${id}`
      );
      return response.data;
    } catch (error: any) {
      throw (
        error?.response?.data || {
          status: "error",
          message: "Failed to fetch property",
        }
      );
    }
  }

  // Update Property
  async updateProperty(
    id: string,
    propertyData: UpdatePropertyData
  ): Promise<PropertyResponse> {
    try {
      const response: AxiosResponse<PropertyResponse> = await api.put(
        `${this.baseUrl}/${id}`,
        propertyData
      );
      return response.data;
    } catch (error: any) {
      throw (
        error?.response?.data || {
          status: "error",
          message: "Failed to update property",
        }
      );
    }
  }

  // Delete Property
  async deleteProperty(
    id: string
  ): Promise<{ status: string; message: string }> {
    try {
      const response: AxiosResponse<{ status: string; message: string }> =
        await api.delete(`${this.baseUrl}/${id}`);
      return response.data;
    } catch (error: any) {
      throw (
        error?.response?.data || {
          status: "error",
          message: "Failed to delete property",
        }
      );
    }
  }

  // Get Property Compliance
  async getPropertyCompliance(id: string): Promise<PropertyComplianceResponse> {
    try {
      const response: AxiosResponse<PropertyComplianceResponse> = await api.get(
        `${this.baseUrl}/${id}/compliance`
      );
      return response.data;
    } catch (error: any) {
      throw (
        error?.response?.data || {
          status: "error",
          message: "Failed to fetch property compliance",
        }
      );
    }
  }

  // Utility methods
  getComplianceStatusColor(status: string): string {
    switch (status) {
      case "Compliant":
        return "success";
      case "Due Soon":
        return "warning";
      case "Overdue":
        return "danger";
      case "Not Required":
        return "secondary";
      default:
        return "secondary";
    }
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat("en-AU", {
      style: "currency",
      currency: "AUD",
    }).format(amount);
  }

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString("en-AU", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  }

  calculateWeeksUntilInspection(inspectionDate: string): number {
    const today = new Date();
    const inspection = new Date(inspectionDate);
    const diffTime = inspection.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24 * 7));
  }
}

// Export singleton instance
const propertyService = new PropertyService();
export default propertyService;

// Export constants
export const VALID_REGIONS = [
  "Sydney Metro",
  "Melbourne Metro",
  "Brisbane Metro",
  "Perth Metro",
  "Adelaide Metro",
  "Darwin Metro",
  "Hobart Metro",
  "Canberra Metro",
  "Regional NSW",
  "Regional VIC",
  "Regional QLD",
  "Regional WA",
  "Regional SA",
  "Regional NT",
  "Regional TAS",
] as const;

export const VALID_STATES = [
  "NSW",
  "VIC",
  "QLD",
  "WA",
  "SA",
  "TAS",
  "NT",
  "ACT",
] as const;

export const PROPERTY_TYPES = [
  "House",
  "Apartment",
  "Townhouse",
  "Commercial",
  "Other",
] as const;
