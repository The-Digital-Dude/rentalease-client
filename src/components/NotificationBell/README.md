# Notification System

This notification system provides real-time notifications for the RentalEase CRM application using Redux for state management and API polling for updates.

## Features

- **Real-time Updates**: Automatically fetches unread notification count every 30 seconds
- **Redux Integration**: Centralized state management for notifications
- **API Integration**: Connects to backend notification endpoints
- **Interactive UI**: Click to view notifications, mark as read, and mark all as read
- **Loading States**: Shows loading indicators during API calls
- **Responsive Design**: Works on mobile and desktop

## Components

### NotificationBell

The main notification component that displays the bell icon with unread count badge and dropdown.

**Props:**

- `onNotificationClick?: (notification: Notification) => void` - Callback when a notification is clicked

**Features:**

- Shows unread count badge
- Fetches notifications when dropdown is opened
- Marks notifications as read when clicked
- Supports "Mark all as read" functionality
- Loading states for better UX

## Redux Store

### State Structure

```typescript
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
```

### Actions

- `fetchUnreadCount()` - Fetches unread notification count
- `fetchNotifications(params?)` - Fetches notifications with optional filters
- `markNotificationAsRead(id)` - Marks a specific notification as read
- `markAllNotificationsAsRead()` - Marks all notifications as read

## API Service

### Endpoints Used

- `GET /api/v1/notifications` - Get notifications with filters
- `GET /api/v1/notifications/unread-count` - Get unread count
- `PATCH /api/v1/notifications/:id/read` - Mark notification as read
- `PATCH /api/v1/notifications/mark-all-read` - Mark all as read

### Query Parameters

- `status` - Filter by status: Unread, Read, or Archived
- `limit` - Number of notifications to return (default: 50)
- `skip` - Number of notifications to skip for pagination
- `sortBy` - Field to sort by (default: createdAt)
- `sortOrder` - Sort order: -1 for descending, 1 for ascending

## Notification Types

The system supports these notification types:

- `JOB_CREATED` - When new jobs are created
- `JOB_ASSIGNED` - When jobs are assigned to technicians
- `JOB_COMPLETED` - When jobs are completed
- `COMPLIANCE_DUE` - Compliance-related notifications
- `SYSTEM_ALERT` - System alerts
- `GENERAL` - General notifications

## Usage

```tsx
import NotificationBell from "../components/NotificationBell";

const TopNavbar = () => {
  const handleNotificationClick = (notification) => {
    console.log("Notification clicked:", notification);
    // Handle navigation or other actions
  };

  return (
    <div className="navbar-actions">
      <NotificationBell onNotificationClick={handleNotificationClick} />
    </div>
  );
};
```

## Polling Hook

The `useNotificationPolling` hook provides automatic real-time updates:

```tsx
import { useNotificationPolling } from "../hooks/useNotificationPolling";

const MyComponent = () => {
  // Poll every 30 seconds (default)
  useNotificationPolling(30000);

  // Or use default 30-second interval
  useNotificationPolling();
};
```

## Authentication

All notification API calls require Bearer token authentication, which is automatically handled by the API service using the token stored in localStorage.

## Error Handling

The system includes comprehensive error handling:

- Network errors are caught and displayed
- Authentication errors trigger logout
- Loading states prevent multiple simultaneous requests
- Optimistic updates for better UX
