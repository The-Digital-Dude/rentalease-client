import api from "./api";

export interface Notification {
  id: string;
  title: string;
  message: string;
  type:
    | "JOB_CREATED"
    | "JOB_ASSIGNED"
    | "JOB_COMPLETED"
    | "COMPLIANCE_DUE"
    | "SYSTEM_ALERT"
    | "GENERAL"
    | "PROPERTY_ASSIGNED"
    | "QUOTATION_REQUESTED"
    | "QUOTATION_ACCEPTED";
  status: "Unread" | "Read" | "Archived";
  priority?: "High" | "Medium" | "Low";
  createdAt: string;
  readAt?: string | null;
  data?: {
    jobId?: string;
    job_id?: string;
    propertyId?: string;
    propertyAddress?: string;
    jobType?: string;
    dueDate?: string;
    complianceType?: string;
    agencyId?: string;
    agencyName?: string;
    agencyContactName?: string;
    quotationId?: string;
    action?: string;
    generatedJobId?: string;
    generatedInvoiceId?: string;
  };
}

export interface NotificationResponse {
  success: boolean;
  data: Notification[];
  total: number;
  page: number;
  limit: number;
}

export interface UnreadCountResponse {
  success: boolean;
  data: {
    unreadCount: number;
  };
}

export const notificationService = {
  // Get all notifications with optional filters
  getNotifications: async (params?: {
    status?: "Unread" | "Read" | "Archived";
    limit?: number;
    skip?: number;
    sortBy?: string;
    sortOrder?: -1 | 1;
  }): Promise<NotificationResponse> => {
    try {
      const queryParams = new URLSearchParams();
      if (params) {
        Object.entries(params).forEach(([key, value]) => {
          if (value !== undefined && value !== null && value !== "") {
            queryParams.append(key, value.toString());
          }
        });
      }

      const url = `/v1/notifications${
        queryParams.toString() ? `?${queryParams.toString()}` : ""
      }`;

      const response = await api.get(url);

      // Handle the actual API response structure
      const apiData = response.data.data;
      return {
        success: response.data.status === "success",
        data: apiData.notifications || [],
        total: apiData.pagination?.total || 0,
        page:
          Math.floor(
            (apiData.pagination?.skip || 0) / (apiData.pagination?.limit || 1)
          ) + 1,
        limit: apiData.pagination?.limit || 20,
      };
    } catch (error) {
      // Return a safe default response
      return {
        success: false,
        data: [],
        total: 0,
        page: 1,
        limit: 50,
      };
    }
  },

  // Get unread notifications count
  getUnreadCount: async (): Promise<UnreadCountResponse> => {
    try {
      const response = await api.get("/v1/notifications/unread-count");
      return response.data;
    } catch (error) {
      // Return a safe default response
      return {
        success: false,
        data: {
          unreadCount: 0,
        },
      };
    }
  },

  // Mark notification as read
  markAsRead: async (notificationId: string): Promise<{ success: boolean }> => {
    const response = await api.patch(
      `/v1/notifications/${notificationId}/read`
    );
    return response.data;
  },

  // Mark all notifications as read
  markAllAsRead: async (): Promise<{ success: boolean }> => {
    const response = await api.patch("/v1/notifications/mark-all-read");
    return response.data;
  },

  // Archive notification
  archiveNotification: async (
    notificationId: string
  ): Promise<{ success: boolean }> => {
    const response = await api.patch(
      `/v1/notifications/${notificationId}/archive`
    );
    return response.data;
  },
};
