import api from "./api";
import type { Region } from "../constants";

export interface AgencySubscription {
  id: string;
  planType: "starter" | "pro" | "enterprise";
  status:
    | "trial"
    | "active"
    | "past_due"
    | "canceled"
    | "incomplete"
    | "unpaid";
  subscriptionStartDate?: string;
  subscriptionEndDate?: string;
  trialEndsAt?: string;
  currentPeriodStart?: string;
  currentPeriodEnd?: string;
}

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
  subscriptionAmount?: number;
  subscription?: AgencySubscription;
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
  lastUpdated?: string;
  subscription?: {
    id: string;
    planType: string;
    status: string;
    subscriptionStartDate?: string;
    subscriptionEndDate?: string;
    trialEndsAt?: string;
    currentPeriodStart?: string;
    currentPeriodEnd?: string;
  };
}

// Detailed agency profile interface for single agency fetch
export interface AgencyProfile {
  agency: {
    id: string;
    companyName: string;
    contactPerson: string;
    email: string;
    phone: string;
    region: string;
    compliance: string;
    status: string;
    abn: string;
    outstandingAmount: number;
    totalProperties: number;
    lastLogin?: string;
    joinedDate?: string;
    createdAt?: string;
    lastUpdated?: string;
    subscriptionAmount?: number;
    subscription?: {
      id: string;
      planType: string;
      status: string;
      subscriptionStartDate?: string;
      subscriptionEndDate?: string;
      trialEndsAt?: string;
      currentPeriodStart?: string;
      currentPeriodEnd?: string;
    };
  };
  statistics: {
    totalProperties: number;
    totalJobs: number;
    totalPropertyManagers: number;
    jobStatusCounts: {
      pending: number;
      scheduled: number;
      completed: number;
      overdue: number;
    };
    propertyStatusCounts: {
      active: number;
      inactive: number;
      maintenance: number;
    };
    propertyManagerAvailability: {
      available: number;
      busy: number;
      unavailable: number;
    };
    financials: {
      totalJobValue: number;
      completedJobValue: number;
      averageJobValue: number;
    };
  };
  properties: Array<{
    id: string;
    address: {
      street: string;
      suburb: string;
      state: string;
      postcode: string;
      fullAddress: string;
    };
    propertyType: string;
    currentTenant?: {
      name: string;
      email: string;
      phone: string;
    };
    currentLandlord?: {
      name: string;
      email: string;
      phone: string;
    };
    complianceSchedule?: {
      gasCheck?: string;
      electricalCheck?: string;
      smokeAlarmCheck?: string;
    };
    status?: string;
    createdAt?: string;
  }>;
  jobs: Array<{
    id: string;
    job_id: string;
    jobType: string;
    property: {
      id: string;
      address: {
        street: string;
        suburb: string;
        state: string;
        postcode: string;
      };
    };
    assignedTechnician?: {
      id: string;
      fullName: string;
      tradeType: string;
      availabilityStatus: string;
    };
    dueDate?: string;
    status: string;
    priority: string;
    description: string;
    cost?: {
      materialCost: number;
      laborCost: number;
      totalCost: number;
    };
    estimatedDuration?: number;
    actualDuration?: number;
    completedAt?: string;
    createdAt?: string;
  }>;
  propertyManagers: Array<{
    id: string;
    fullName: string;
    email: string;
    phone: string;
    availabilityStatus: string;
    assignedPropertiesCount: number;
    status: string;
    createdAt?: string;
  }>;
}

export interface AgencyProfileResponse {
  success: boolean;
  data?: AgencyProfile;
  message?: string;
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
  subscriptionAmount: serverData.subscriptionAmount,
  subscription: serverData.subscription
    ? {
        id: serverData.subscription.id,
        planType: serverData.subscription.planType.toLowerCase() as
          | "starter"
          | "pro"
          | "enterprise",
        status: serverData.subscription.status.toLowerCase() as
          | "trial"
          | "active"
          | "past_due"
          | "canceled"
          | "incomplete"
          | "unpaid",
        subscriptionStartDate: serverData.subscription.subscriptionStartDate,
        subscriptionEndDate: serverData.subscription.subscriptionEndDate,
        trialEndsAt: serverData.subscription.trialEndsAt,
        currentPeriodStart: serverData.subscription.currentPeriodStart,
        currentPeriodEnd: serverData.subscription.currentPeriodEnd,
      }
    : undefined,
});

export const agencyService = {
  // Get all agencies
  getAllAgencies: async (): Promise<AgencyResponse> => {
    try {
      const response = await api.get<ServerResponse>(
        "/v1/agency/auth/all?limit=100"
      );

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
    agency: Omit<Agency, "id"> & {
      password?: string;
      subscriptionAmount?: number;
    }
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
        subscriptionAmount: agency.subscriptionAmount, // Required for new agencies
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

  // Get single agency by ID
  getSingleAgency: async (id: string): Promise<AgencyProfileResponse> => {
    try {
      const response = await api.get<{ status: string; data: AgencyProfile }>(
        `/v1/agency/auth/${id}`
      );

      if (response.data.status === "success" && response.data.data) {
        return {
          success: true,
          data: response.data.data,
        };
      } else {
        return {
          success: false,
          message: "Invalid response format from server",
        };
      }
    } catch (error: any) {
      return {
        success: false,
        message:
          error.response?.data?.message || "Failed to fetch agency details",
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

  // Get agency dashboard data
  getDashboardData: async (): Promise<{
    status: string;
    message: string;
    data: any;
  }> => {
    try {
      const response = await api.get("/v1/agency/auth/dashboard");
      return response.data;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || "Failed to fetch dashboard data"
      );
    }
  },

  // Get agency jobs with filters and pagination
  getJobs: async (
    queryParams: string
  ): Promise<{
    status: string;
    message: string;
    data: any;
  }> => {
    try {
      const response = await api.get(`/v1/jobs?${queryParams}`);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || "Failed to fetch jobs");
    }
  },

  // Get technician information
  getTechnicianInfo: async (
    technicianId: string
  ): Promise<{
    status: string;
    message: string;
    data: any;
  }> => {
    try {
      const response = await api.get(`/v1/technicians/${technicianId}`);
      return response.data;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message ||
          "Failed to fetch technician information"
      );
    }
  },

  // Get agency subscription data
  getAgencySubscription: async (
    agencyId: string
  ): Promise<{
    success: boolean;
    data?: AgencySubscription;
    message?: string;
  }> => {
    try {
      const response = await api.get(`/v1/agency/${agencyId}/subscription`);

      if (
        response.data.status === "success" &&
        response.data.data?.subscription
      ) {
        const subscription = response.data.data.subscription;
        return {
          success: true,
          data: {
            id: subscription.id,
            planType: subscription.planType?.toLowerCase() as
              | "starter"
              | "pro"
              | "enterprise",
            status: subscription.status?.toLowerCase() as
              | "trial"
              | "active"
              | "past_due"
              | "canceled"
              | "incomplete"
              | "unpaid",
            subscriptionStartDate: subscription.subscriptionStartDate,
            subscriptionEndDate: subscription.subscriptionEndDate,
            trialEndsAt: subscription.trialEndsAt,
            currentPeriodStart: subscription.currentPeriodStart,
            currentPeriodEnd: subscription.currentPeriodEnd,
          },
        };
      } else {
        return {
          success: false,
          message: "No subscription found for this agency",
        };
      }
    } catch (error: any) {
      return {
        success: false,
        message:
          error.response?.data?.message ||
          "Failed to fetch agency subscription",
      };
    }
  },

  // Send email to Agency
  sendEmailToAgency: async (
    email: string,
    data: { subject: string; html: string; attachments?: File[] }
  ): Promise<ApiResponse<any>> => {
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
        response = await api.post(`/v1/emails/send-general`, {
          to: email,
          subject: data.subject,
          html: data.html,
        });
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
      return {
        success: false,
        message:
          error.response?.data?.message || "Failed to send email to Agency",
      };
    }
  },
};
