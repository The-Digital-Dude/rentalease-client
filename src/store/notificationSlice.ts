import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { notificationService } from "../services/notificationService";
import type { Notification } from "../services/notificationService";
import { propertyService, agencyService } from "../services";

const formatPropertyAddress = (property: any): string | undefined => {
  if (!property) {
    return undefined;
  }

  if (typeof property === "string") {
    return property;
  }

  if (property.fullAddress) {
    return property.fullAddress;
  }

  if (typeof property.address === "string") {
    return property.address;
  }

  if (property.address && typeof property.address === "object") {
    if (property.address.fullAddress) {
      return property.address.fullAddress;
    }

    const { street, suburb, state, postcode } = property.address;
    if (street && suburb && state && postcode) {
      return `${street}, ${suburb}, ${state} ${postcode}`;
    }
  }

  return undefined;
};

const enrichQuotationNotifications = async (
  notifications: Notification[]
): Promise<Notification[]> => {
  if (!Array.isArray(notifications) || notifications.length === 0) {
    return notifications;
  }

  const propertyCache = new Map<string, string | undefined>();
  const agencyCache = new Map<
    string,
    { companyName?: string; contactPerson?: string } | undefined
  >();

  const getPropertyAddress = async (
    propertyId?: string
  ): Promise<string | undefined> => {
    if (!propertyId) {
      return undefined;
    }

    if (propertyCache.has(propertyId)) {
      return propertyCache.get(propertyId);
    }

    try {
      const response = await propertyService.getProperty(propertyId);
      const property = response.data?.property;
      const address = formatPropertyAddress(property);
      propertyCache.set(propertyId, address);
      return address;
    } catch (error) {
      propertyCache.set(propertyId, undefined);
      return undefined;
    }
  };

  const getAgencyDetails = async (
    agencyId?: string
  ): Promise<{ companyName?: string; contactPerson?: string } | undefined> => {
    if (!agencyId) {
      return undefined;
    }

    if (agencyCache.has(agencyId)) {
      return agencyCache.get(agencyId);
    }

    try {
      const response = await agencyService.getSingleAgency(agencyId);
      if (response.success && response.data?.agency) {
        const details = {
          companyName: response.data.agency.companyName,
          contactPerson: response.data.agency.contactPerson,
        };
        agencyCache.set(agencyId, details);
        return details;
      }
    } catch (error) {
      // Ignore error and continue with fallback data
    }

    agencyCache.set(agencyId, undefined);
    return undefined;
  };

  return Promise.all(
    notifications.map(async (notification) => {
      if (
        (notification.type === "QUOTATION_REQUESTED" ||
          notification.type === "QUOTATION_ACCEPTED") &&
        notification.data
      ) {
        const [propertyAddress, agencyDetails] = await Promise.all([
          getPropertyAddress(notification.data.propertyId),
          getAgencyDetails(notification.data.agencyId),
        ]);

        const jobType = notification.data.jobType || "the requested service";
        const contactName = agencyDetails?.contactPerson?.trim();
        const companyName = agencyDetails?.companyName?.trim();
        const actorName =
          notification.type === "QUOTATION_REQUESTED"
            ? contactName || companyName
            : companyName || contactName;
        const locationText = propertyAddress ? ` at ${propertyAddress}` : "";
        const actionText =
          notification.type === "QUOTATION_ACCEPTED"
            ? "has accepted the quotation for"
            : "has requested a quotation for";

        const updatedMessage = `${actorName || "An agency"} ${actionText} ${jobType}${locationText}`;

        return {
          ...notification,
          message: updatedMessage,
          data: {
            ...notification.data,
            propertyAddress: propertyAddress || notification.data.propertyAddress,
            agencyName: companyName || notification.data.agencyName,
            agencyContactName:
              contactName || notification.data.agencyContactName,
          },
        };
      }

      return notification;
    })
  );
};

// Async thunks
export const fetchUnreadCount = createAsyncThunk(
  "notifications/fetchUnreadCount",
  async () => {
    const response = await notificationService.getUnreadCount();
    return response.data.unreadCount;
  }
);

export const fetchNotifications = createAsyncThunk(
  "notifications/fetchNotifications",
  async (params?: {
    status?: "Unread" | "Read" | "Archived";
    limit?: number;
    skip?: number;
    sortBy?: string;
    sortOrder?: -1 | 1;
  }) => {
    const response = await notificationService.getNotifications(params);
    const enrichedNotifications = await enrichQuotationNotifications(
      response.data
    );

    return {
      ...response,
      data: enrichedNotifications,
    };
  }
);

export const markNotificationAsRead = createAsyncThunk(
  "notifications/markAsRead",
  async (notificationId: string) => {
    await notificationService.markAsRead(notificationId);
    return notificationId;
  }
);

export const markAllNotificationsAsRead = createAsyncThunk(
  "notifications/markAllAsRead",
  async () => {
    await notificationService.markAllAsRead();
  }
);

// State interface
interface NotificationState {
  notifications: Notification[];
  unreadCount: number;
  loading: boolean;
  loadingUnreadCount: boolean;
  error: string | null;
  total: number;
  page: number;
  limit: number;
}

// Initial state
const initialState: NotificationState = {
  notifications: [],
  unreadCount: 0,
  loading: false,
  loadingUnreadCount: false,
  error: null,
  total: 0,
  page: 1,
  limit: 50,
};

// Slice
const notificationSlice = createSlice({
  name: "notifications",
  initialState,
  reducers: {
    clearNotifications: (state) => {
      state.notifications = [];
      state.error = null;
    },
    clearError: (state) => {
      state.error = null;
    },
    // Optimistically update unread count when marking as read
    decrementUnreadCount: (state) => {
      if (state.unreadCount > 0) {
        state.unreadCount -= 1;
      }
    },
    // Optimistically update unread count when marking all as read
    clearUnreadCount: (state) => {
      state.unreadCount = 0;
    },
  },
  extraReducers: (builder) => {
    // Fetch unread count
    builder
      .addCase(fetchUnreadCount.pending, (state) => {
        state.loadingUnreadCount = true;
        state.error = null;
      })
      .addCase(fetchUnreadCount.fulfilled, (state, action) => {
        state.loadingUnreadCount = false;
        // Handle both direct number response and nested response structure
        const payload = action.payload as any;
        state.unreadCount =
          typeof payload === "number"
            ? payload
            : payload?.data?.unreadCount || 0;
      })
      .addCase(fetchUnreadCount.rejected, (state, action) => {
        state.loadingUnreadCount = false;
        state.error = action.error.message || "Failed to fetch unread count";
      });

    // Fetch notifications
    builder
      .addCase(fetchNotifications.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchNotifications.fulfilled, (state, action) => {
        state.loading = false;
        // Ensure we always have an array, even if the API response is unexpected
        state.notifications = Array.isArray(action.payload.data)
          ? action.payload.data
          : [];
        state.total = action.payload.total || 0;
        state.page = action.payload.page || 1;
        state.limit = action.payload.limit || 50;
      })
      .addCase(fetchNotifications.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Failed to fetch notifications";
      });

    // Mark notification as read
    builder.addCase(markNotificationAsRead.fulfilled, (state, action) => {
      const notification = state.notifications.find(
        (n) => n.id === action.payload
      );
      if (notification) {
        notification.status = "Read";
        notification.readAt = new Date().toISOString();
      }
    });

    // Mark all notifications as read
    builder.addCase(markAllNotificationsAsRead.fulfilled, (state) => {
      state.notifications.forEach((notification) => {
        if (notification.status === "Unread") {
          notification.status = "Read";
          notification.readAt = new Date().toISOString();
        }
      });
      state.unreadCount = 0;
    });
  },
});

export const {
  clearNotifications,
  clearError,
  decrementUnreadCount,
  clearUnreadCount,
} = notificationSlice.actions;

export default notificationSlice.reducer;
