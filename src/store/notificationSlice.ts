import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { notificationService } from "../services/notificationService";
import type { Notification } from "../services/notificationService";

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
    return response;
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
