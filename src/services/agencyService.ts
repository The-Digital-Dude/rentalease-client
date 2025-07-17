import api from "./api";
import type { Region } from "../constants";

export interface Agency {
  id: string;
  name: string;
  abn: string;
  contactPerson: string;
  contactEmail: string;
  contactPhone: string;
  region: string;
  complianceLevel: string;
  status: "active" | "inactive" | "pending" | "suspended";
  outstandingAmount: number;
}

// Server response format for agency
export interface ServerAgency {
  id: string;
  companyName: string;
  abn: string;
  contactPerson: string;
  email: string;
  phone: string;
  region: string;
  compliance: string;
  status: string;
  outstandingAmount: number;
  totalProperties: number;
  lastLogin?: string | null;
  joinedDate?: string;
  createdAt?: string;
}

export interface ServerResponse {
  status: string;
  data: {
    agencies: ServerAgency[];
    pagination: {
      currentPage: number;
      totalPages: number;
      totalCount: number;
      hasNext: boolean;
      hasPrev: boolean;
    };
  };
}

// Response format for create agency
export interface CreateAgencyResponse {
  status: string;
  message: string;
  data: {
    agency: ServerAgency;
    createdBy: string;
  };
}

export interface AgencyResponse {
  success: boolean;
  data: Agency[];
  message?: string;
}

// Helper function to map server data to client format
const mapServerToClient = (serverData: ServerAgency): Agency => ({
  id: serverData.id,
  name: serverData.companyName,
  abn: serverData.abn,
  contactPerson: serverData.contactPerson,
  contactEmail: serverData.email,
  contactPhone: serverData.phone,
  region: serverData.region,
  complianceLevel: serverData.compliance,
  status: serverData.status.toLowerCase() as "active" | "inactive" | "pending",
  outstandingAmount: serverData.outstandingAmount,
});

export const agencyService = {
  // Get all agencies
  getAllAgencies: async (): Promise<AgencyResponse> => {
    try {
      const response = await api.get<ServerResponse>("/v1/agency/auth/all");

      if (response.data.status === "success" && response.data.data.agencies) {
        const mappedData = response.data.data.agencies.map(mapServerToClient);
        return {
          success: true,
          data: mappedData,
        };
      } else {
        return {
          success: false,
          data: [],
          message: "Invalid response format from server",
        };
      }
    } catch (error: any) {
      return {
        success: false,
        data: [],
        message: error.response?.data?.message || "Failed to fetch agencies",
      };
    }
  },

  // Create new agency
  createAgency: async (
    agency: Omit<Agency, "id"> & { password?: string }
  ): Promise<AgencyResponse> => {
    try {
      // Map client data to server format
      const serverData = {
        companyName: agency.name,
        abn: agency.abn,
        contactPerson: agency.contactPerson,
        email: agency.contactEmail,
        phone: agency.contactPhone,
        region: agency.region,
        compliance: agency.complianceLevel,
        password: agency.password, // Required for new agencies
      };

      const response = await api.post<CreateAgencyResponse>(
        "/v1/agency/auth/register",
        serverData
      );

      if (response.data.status === "success" && response.data.data?.agency) {
        const mappedData = mapServerToClient(response.data.data.agency);
        return {
          success: true,
          data: [mappedData],
          message: response.data.message,
        };
      } else {
        return {
          success: false,
          data: [],
          message: response.data.message || "Failed to create agency",
        };
      }
    } catch (error: any) {
      return {
        success: false,
        data: [],
        message: error.response?.data?.message || "Failed to create agency",
      };
    }
  },

  // Update agency
  updateAgency: async (
    id: string,
    agency: Partial<Agency>
  ): Promise<AgencyResponse> => {
    try {
      // Map client data to server format
      const serverData: any = {};
      if (agency.name) serverData.companyName = agency.name;
      if (agency.abn) serverData.abn = agency.abn;
      if (agency.contactPerson) serverData.contactPerson = agency.contactPerson;
      if (agency.contactEmail) serverData.email = agency.contactEmail;
      if (agency.contactPhone) serverData.phone = agency.contactPhone;
      if (agency.region) serverData.region = agency.region;
      if (agency.complianceLevel)
        serverData.compliance = agency.complianceLevel;
      if (agency.status)
        serverData.status =
          agency.status.charAt(0).toUpperCase() + agency.status.slice(1);
      if (agency.outstandingAmount !== undefined)
        serverData.outstandingAmount = agency.outstandingAmount;

      const response = await api.patch(`/v1/agency/auth/${id}`, serverData);

      if (response.data.status === "success" && response.data.data?.agency) {
        const mappedData = mapServerToClient(response.data.data.agency);
        return {
          success: true,
          data: [mappedData],
          message: response.data.message,
        };
      } else {
        return {
          success: false,
          data: [],
          message: response.data.message || "Failed to update agency",
        };
      }
    } catch (error: any) {
      return {
        success: false,
        data: [],
        message: error.response?.data?.message || "Failed to update agency",
      };
    }
  },

  // Delete agency
  deleteAgency: async (
    id: string
  ): Promise<{ success: boolean; message?: string }> => {
    try {
      await api.delete(`/v1/agency/auth/${id}`);
      return {
        success: true,
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || "Failed to delete agency",
      };
    }
  },

  // Resend credentials email
  resendCredentialsEmail: async (
    id: string
  ): Promise<{ success: boolean; message?: string }> => {
    try {
      const response = await api.post(
        `/v1/agency/auth/${id}/resend-credentials`
      );
      return {
        success: true,
        message:
          response.data.message || "Credentials email resent successfully",
      };
    } catch (error: any) {
      return {
        success: false,
        message:
          error.response?.data?.message || "Failed to resend credentials email",
      };
    }
  },
};
