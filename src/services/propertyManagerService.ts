import api from "./api";
import type { AxiosResponse } from "axios";

// PropertyManager types based on the documentation
export interface PropertyManager {
  id: string;
  firstName: string;
  lastName: string;
  fullName: string;
  email: string;
  phone: string;
  status: "Active" | "Inactive" | "Suspended" | "Pending";
  availabilityStatus: "Available" | "Busy" | "Unavailable" | "On Leave";
  assignedPropertiesCount: number;
  activePropertiesCount: number;
  assignedProperties: AssignedProperty[];
  owner: {
    ownerType: "Agency";
    ownerId: string | {
      _id: string;
      companyName: string;
      email: string;
      phone: string;
    };
  };
  address: {
    street?: string;
    suburb?: string;
    state?: string;
    postcode?: string;
    fullAddress?: string;
  };
  assignmentSummary?: {
    totalProperties: number;
    activeProperties: number;
    inactiveProperties: number;
    primaryAssignments: number;
    secondaryAssignments: number;
  };
  createdAt: string;
  updatedAt: string;
  lastLogin?: string;
  lastActive?: string;
}

export interface AssignedProperty {
  propertyId: string;
  assignedDate: string;
  status: "Active" | "Inactive" | "Suspended";
  role: "Primary" | "Secondary" | "Backup";
  property?: {
    address: {
      street: string;
      suburb: string;
      state: string;
      postcode: string;
    };
  };
}

export interface PropertyManagerFilters {
  page?: number;
  limit?: number;
  status?: string;
  availabilityStatus?: string;
  search?: string;
  agencyId?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export interface CreatePropertyManagerData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  password: string;
  agencyId: string;
  address?: {
    street?: string;
    suburb?: string;
    state?: string;
    postcode?: string;
  };
}

export interface PropertyManagerLoginData {
  email: string;
  password: string;
}

export interface UpdatePropertyManagerData {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  status?: string;
  availabilityStatus?: string;
  address?: {
    street?: string;
    suburb?: string;
    state?: string;
    postcode?: string;
  };
}

// Raw API response interface for backend data structure
export interface RawPropertyManager {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  status: "Active" | "Inactive" | "Suspended" | "Pending";
  availabilityStatus: "Available" | "Busy" | "Unavailable" | "On Leave";
  assignedProperties: any[];
  owner: {
    ownerType: "Agency";
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
  updatedAt: string;
  lastLogin?: string;
  lastActive?: string;
}

export interface PropertyManagerApiResponse {
  success: boolean;
  message: string;
  data: {
    propertyManager?: PropertyManager;
    propertyManagers?: PropertyManager[];
    pagination?: {
      page: number;
      limit: number;
      total: number;
      pages: number;
    };
    summary?: {
      total: number;
      active: number;
      inactive: number;
      available: number;
      busy: number;
      unavailable: number;
    };
  };
}

export interface AssignPropertyManagerData {
  propertyManagerId: string;
  role: "Primary" | "Secondary" | "Backup";
}

export interface BulkAssignPropertyManagerData {
  propertyManagerId: string;
  propertyIds: string[];
  role: "Primary" | "Secondary" | "Backup";
}

class PropertyManagerService {
  // Get all PropertyManagers with filters
  async getPropertyManagers(
    filters?: PropertyManagerFilters
  ): Promise<PropertyManagerApiResponse> {
    try {
      const params = new URLSearchParams();

      if (filters?.page) params.append("page", filters.page.toString());
      if (filters?.limit) params.append("limit", filters.limit.toString());
      if (filters?.status) params.append("status", filters.status);
      if (filters?.availabilityStatus)
        params.append("availabilityStatus", filters.availabilityStatus);
      if (filters?.search) params.append("search", filters.search);
      if (filters?.agencyId) params.append("agencyId", filters.agencyId);
      if (filters?.sortBy) params.append("sortBy", filters.sortBy);
      if (filters?.sortOrder) params.append("sortOrder", filters.sortOrder);

      const response: AxiosResponse<any> = await api.get(
        `/v1/property-managers?${params.toString()}`
      );

      // Transform the response to match frontend expectations
      if (response.data.success && response.data.data.propertyManagers) {
        const transformedPropertyManagers =
          response.data.data.propertyManagers.map((pm: RawPropertyManager) => ({
            id: pm._id,
            firstName: pm.firstName,
            lastName: pm.lastName,
            fullName: `${pm.firstName} ${pm.lastName}`,
            email: pm.email,
            phone: pm.phone,
            status: pm.status,
            availabilityStatus: pm.availabilityStatus,
            assignedPropertiesCount: pm.assignedProperties?.length || 0,
            activePropertiesCount:
              pm.assignedProperties?.filter((p: any) => p.status === "Active")
                ?.length || 0,
            assignedProperties: pm.assignedProperties || [],
            owner: pm.owner,
            address: pm.address,
            createdAt: pm.createdAt,
            updatedAt: pm.updatedAt,
            lastLogin: pm.lastLogin,
            lastActive: pm.lastActive,
          }));

        return {
          success: true,
          message:
            response.data.message || "PropertyManagers fetched successfully",
          data: {
            propertyManagers: transformedPropertyManagers,
            pagination: response.data.data.pagination,
            summary: response.data.data.summary,
          },
        };
      }

      return response.data;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || "Failed to fetch PropertyManagers"
      );
    }
  }

  // Get PropertyManager by ID
  async getPropertyManagerById(
    id: string
  ): Promise<PropertyManagerApiResponse> {
    try {
      const response: AxiosResponse<any> = await api.get(
        `/v1/property-managers/${id}`
      );

      // Transform the response to match frontend expectations
      if (response.data.success && response.data.data.propertyManager) {
        const pm: RawPropertyManager = response.data.data.propertyManager;
        const transformedPropertyManager = {
          id: pm._id,
          firstName: pm.firstName,
          lastName: pm.lastName,
          fullName: `${pm.firstName} ${pm.lastName}`,
          email: pm.email,
          phone: pm.phone,
          status: pm.status,
          availabilityStatus: pm.availabilityStatus,
          assignedPropertiesCount: pm.assignedProperties?.length || 0,
          activePropertiesCount:
            pm.assignedProperties?.filter((p: any) => p.status === "Active")
              ?.length || 0,
          assignedProperties: pm.assignedProperties || [],
          owner: pm.owner,
          address: pm.address,
          createdAt: pm.createdAt,
          updatedAt: pm.updatedAt,
          lastLogin: pm.lastLogin,
          lastActive: pm.lastActive,
        };

        return {
          success: true,
          message:
            response.data.message || "PropertyManager fetched successfully",
          data: {
            propertyManager: transformedPropertyManager,
          },
        };
      }

      return response.data;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || "Failed to fetch PropertyManager"
      );
    }
  }

  // Login PropertyManager
  async loginPropertyManager(
    data: PropertyManagerLoginData
  ): Promise<PropertyManagerApiResponse> {
    try {
      const response: AxiosResponse<PropertyManagerApiResponse> =
        await api.post("/v1/property-manager/auth/login", data);

      return response.data;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || "Failed to login PropertyManager"
      );
    }
  }

  // Create new PropertyManager
  async createPropertyManager(
    data: CreatePropertyManagerData
  ): Promise<PropertyManagerApiResponse> {
    try {
      const response: AxiosResponse<PropertyManagerApiResponse> =
        await api.post("/v1/property-manager/auth/register", data);

      // Normalize the response - if HTTP status is 2xx, treat as success
      const normalizedResponse = {
        ...response.data,
        success:
          response.status >= 200 && response.status < 300
            ? true
            : response.data.success,
      };

      return normalizedResponse;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || "Failed to create PropertyManager"
      );
    }
  }

  // Update PropertyManager
  async updatePropertyManager(
    id: string,
    updateData: UpdatePropertyManagerData
  ): Promise<PropertyManagerApiResponse> {
    try {
      const response: AxiosResponse<PropertyManagerApiResponse> =
        await api.patch(`/v1/property-managers/${id}`, updateData);

      // Normalize the response - if HTTP status is 2xx, treat as success
      const normalizedResponse = {
        ...response.data,
        success:
          response.status >= 200 && response.status < 300
            ? true
            : response.data.success,
      };

      return normalizedResponse;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || "Failed to update PropertyManager"
      );
    }
  }

  // Update PropertyManager status
  async updatePropertyManagerStatus(
    id: string,
    status: string
  ): Promise<PropertyManagerApiResponse> {
    try {
      const response: AxiosResponse<PropertyManagerApiResponse> =
        await api.patch(`/v1/property-managers/${id}/status`, { status });

      return response.data;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message ||
          "Failed to update PropertyManager status"
      );
    }
  }

  // Update PropertyManager availability
  async updatePropertyManagerAvailability(
    id: string,
    availabilityStatus: string
  ): Promise<PropertyManagerApiResponse> {
    try {
      const response: AxiosResponse<PropertyManagerApiResponse> =
        await api.patch(`/v1/property-managers/${id}/availability`, {
          availabilityStatus,
        });

      return response.data;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message ||
          "Failed to update PropertyManager availability"
      );
    }
  }

  // Delete PropertyManager
  async deletePropertyManager(id: string): Promise<PropertyManagerApiResponse> {
    try {
      const response: AxiosResponse<PropertyManagerApiResponse> =
        await api.delete(`/v1/property-managers/${id}`);

      return response.data;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || "Failed to delete PropertyManager"
      );
    }
  }

  // Assign PropertyManager to property
  async assignPropertyManager(
    propertyId: string,
    data: AssignPropertyManagerData
  ): Promise<PropertyManagerApiResponse> {
    try {
      const response: AxiosResponse<PropertyManagerApiResponse> =
        await api.post(
          `/v1/properties/${propertyId}/assign-property-manager`,
          data
        );

      return response.data;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || "Failed to assign PropertyManager"
      );
    }
  }

  // Bulk assign properties to PropertyManager
  async bulkAssignProperties(
    data: BulkAssignPropertyManagerData
  ): Promise<PropertyManagerApiResponse> {
    try {
      const response: AxiosResponse<PropertyManagerApiResponse> =
        await api.post("/v1/properties/bulk-assign-property-manager", data);

      return response.data;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || "Failed to bulk assign properties"
      );
    }
  }

  // Remove PropertyManager assignment from property
  async removePropertyManagerAssignment(
    propertyId: string
  ): Promise<PropertyManagerApiResponse> {
    try {
      const response: AxiosResponse<PropertyManagerApiResponse> =
        await api.delete(
          `/v1/properties/${propertyId}/assign-property-manager`
        );

      return response.data;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message ||
          "Failed to remove PropertyManager assignment"
      );
    }
  }

  // Get available PropertyManagers for assignment
  async getAvailablePropertyManagers(): Promise<PropertyManagerApiResponse> {
    try {
      const response: AxiosResponse<PropertyManagerApiResponse> = await api.get(
        "/v1/properties/available-property-managers"
      );

      return response.data;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message ||
          "Failed to fetch available PropertyManagers"
      );
    }
  }

  // Send email to PropertyManager
  async sendEmailToPropertyManager(
    email: string,
    data: { subject: string; html: string; attachments?: File[] }
  ): Promise<any> {
    try {
      let response;
      
      // If there are attachments, use FormData
      if (data.attachments && data.attachments.length > 0) {
        const formData = new FormData();
        formData.append('to', email);
        formData.append('subject', data.subject);
        formData.append('html', data.html);
        
        // Add attachments
        data.attachments.forEach((file) => {
          formData.append('attachments', file);
        });

        response = await api.post(`/v1/emails/send-general`, formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
      } else {
        // No attachments, use JSON
        response = await api.post(
          `/v1/emails/send-general`,
          {
            to: email,
            subject: data.subject,
            html: data.html
          }
        );
      }
      
      console.log('📧 Email API Response:', response.data);
      
      // Handle both response formats: { success: true } or { status: "success" }
      const isSuccess = response.data?.success === true || 
                       response.data?.status === 'success' ||
                       (response.status >= 200 && response.status < 300);
      
      console.log('✅ Email success status:', isSuccess);
      
      return {
        success: isSuccess,
        data: response.data?.data || response.data,
        message: response.data?.message || 'Email sent successfully',
      };
    } catch (error: any) {
      console.error('❌ Email send error:', error.response?.data || error.message);
      throw new Error(
        error.response?.data?.message || "Failed to send email to PropertyManager"
      );
    }
  }
}

export default new PropertyManagerService();
