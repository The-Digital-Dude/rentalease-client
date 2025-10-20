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

export interface PropertyDocument {
  id?: string;
  name: string;
  type?: string;
  size?: number;
  url?: string;
  cloudinaryId?: string;
  uploadDate?: string;
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
  minimumSafetyStandard?: ComplianceItem;
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
  propertyManager?: string;
  assignedPropertyManager?: {
    _id: string;
    firstName: string;
    lastName: string;
    email?: string;
    phone?: string;
  } | null;
  rentAmount?: number;
  currentTenant: PropertyTenant;
  currentLandlord: PropertyLandlord;
  complianceSchedule?: ComplianceSchedule;
  notes?: string;
  hasOverdueCompliance?: boolean;
  complianceSummary?: ComplianceSummary;
  documents?: PropertyDocument[];
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

export interface FilterOptions {
  regions: string[];
  propertyTypes: string[];
  statuses: string[];
}

export interface FilterOptionsResponse {
  status: "success" | "error";
  message?: string;
  data: FilterOptions;
}

export interface PropertyFilters {
  propertyType?: string;
  region?: string;
  status?: string;
  search?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export interface PropertyManager {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  status: string;
  availabilityStatus: string;
  assignedPropertiesCount: number;
}

export interface AssignedPropertyManager {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  availabilityStatus: string;
  status: string;
}

export interface AvailablePropertyManagersResponse {
  status: "success" | "error";
  message?: string;
  data: {
    propertyManagers: PropertyManager[];
    totalCount: number;
  };
}

export interface AssignmentSummary {
  propertyId: string;
  fullAddress: string;
  fullName?: string | null;
  assignedPropertyManager?: AssignedPropertyManager;
  assignmentStatus: "Assigned" | "Unassigned";
}

export interface AssignmentSummaryResponse {
  status: "success" | "error";
  message?: string;
  data: AssignmentSummary;
}

export interface AssignPropertyManagerData {
  propertyManagerId: string;
  role?: "Primary" | "Secondary";
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

  // Get Filter Options
  async getFilterOptions(): Promise<FilterOptionsResponse> {
    try {
      const response: AxiosResponse<FilterOptionsResponse> = await api.get(
        `${this.baseUrl}/filter-options`
      );
      return response.data;
    } catch (error: any) {
      throw (
        error?.response?.data || {
          status: "error",
          message: "Failed to fetch filter options",
        }
      );
    }
  }

  // Get Properties with Enhanced Filtering
  async getPropertiesWithFilters(
    filters: PropertyFilters
  ): Promise<PropertiesResponse> {
    try {
      const response: AxiosResponse<PropertiesResponse> = await api.get(
        this.baseUrl,
        { params: filters }
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
    const diffWeeks = Math.ceil(diffTime / (1000 * 60 * 60 * 24 * 7));
    return diffWeeks;
  }

  // Property Manager Assignment Methods
  async getAvailablePropertyManagers(): Promise<AvailablePropertyManagersResponse> {
    try {
      const response: AxiosResponse<AvailablePropertyManagersResponse> =
        await api.get(`${this.baseUrl}/available-property-managers`);
      return response.data;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message ||
          "Failed to fetch available property managers"
      );
    }
  }

  async getAssignmentSummary(
    propertyId: string
  ): Promise<AssignmentSummaryResponse> {
    try {
      const response: AxiosResponse<AssignmentSummaryResponse> = await api.get(
        `${this.baseUrl}/${propertyId}/assignment-summary`
      );
      return response.data;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || "Failed to fetch assignment summary"
      );
    }
  }

  async assignPropertyManager(
    propertyId: string,
    assignmentData: AssignPropertyManagerData
  ): Promise<{ status: string; message: string }> {
    try {
      const response: AxiosResponse<{ status: string; message: string }> =
        await api.post(
          `${this.baseUrl}/${propertyId}/assign-property-manager`,
          assignmentData
        );
      return response.data;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || "Failed to assign property manager"
      );
    }
  }

  // Document Upload
  async uploadDocument(
    propertyId: string,
    file: File
  ): Promise<PropertyResponse> {
    try {
      const formData = new FormData();
      formData.append("document", file);

      const response: AxiosResponse<PropertyResponse> = await api.post(
        `${this.baseUrl}/${propertyId}/documents`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      return response.data;
    } catch (error: any) {
      throw (
        error?.response?.data || {
          status: "error",
          message: "Failed to upload document",
        }
      );
    }
  }

  // Document Delete
  async deleteDocument(
    propertyId: string,
    documentId: string
  ): Promise<PropertyResponse> {
    try {
      const response: AxiosResponse<PropertyResponse> = await api.delete(
        `${this.baseUrl}/${propertyId}/documents/${documentId}`
      );
      return response.data;
    } catch (error: any) {
      throw (
        error?.response?.data || {
          status: "error",
          message: "Failed to delete document",
        }
      );
    }
  }

  // Toggle Property Doubt Status
  async togglePropertyDoubt(id: string): Promise<PropertyResponse> {
    try {
      const response: AxiosResponse<PropertyResponse> = await api.patch(
        `${this.baseUrl}/${id}/toggle-doubt`
      );
      return response.data;
    } catch (error: any) {
      throw (
        error?.response?.data || {
          status: "error",
          message: "Failed to toggle property doubt status",
        }
      );
    }
  }

  // Assign Team Member to Property
  async assignTeamMember(
    id: string,
    teamMemberId: string
  ): Promise<PropertyResponse> {
    try {
      const response: AxiosResponse<PropertyResponse> = await api.post(
        `${this.baseUrl}/${id}/assign-team-member`,
        { teamMemberId }
      );
      return response.data;
    } catch (error: any) {
      throw (
        error?.response?.data || {
          status: "error",
          message: "Failed to assign team member",
        }
      );
    }
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
