import React, { useState, useRef, useEffect } from "react";
import { RiNotification3Line, RiCloseLine } from "react-icons/ri";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import {
  fetchNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  decrementUnreadCount,
  clearUnreadCount,
} from "../../store/notificationSlice";
import { useNotificationPolling } from "../../hooks/useNotificationPolling";
import type { Notification } from "../../services/notificationService";
import "./NotificationBell.scss";

interface NotificationBellProps {
  onNotificationClick?: (notification: Notification) => void;
}

const NotificationBell: React.FC<NotificationBellProps> = ({
  onNotificationClick,
}) => {
  const dispatch = useAppDispatch();
  const { notifications, unreadCount, loading, loadingUnreadCount } =
    useAppSelector((state) => state.notifications);

  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Use polling hook for real-time updates
  useNotificationPolling(30000); // Poll every 30 seconds

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleBellClick = () => {
    if (!isOpen) {
      // Fetch notifications when opening the dropdown
      dispatch(fetchNotifications({ limit: 20 }));
    }
    setIsOpen(!isOpen);
  };

  const handleNotificationClick = (notification: Notification) => {
    // Mark notification as read when clicked
    if (notification.status === "Unread") {
      dispatch(markNotificationAsRead(notification.id));
      dispatch(decrementUnreadCount());
    }
    onNotificationClick?.(notification);
    setIsOpen(false);
  };

  const handleMarkAllRead = () => {
    dispatch(markAllNotificationsAsRead());
    dispatch(clearUnreadCount());
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "JOB_CREATED":
        return "🔨";
      case "JOB_ASSIGNED":
        return "👷";
      case "JOB_COMPLETED":
        return "✅";
      case "COMPLIANCE_DUE":
        return "⚠️";
      case "SYSTEM_ALERT":
        return "🚨";
      case "GENERAL":
        return "ℹ️";
      default:
        return "ℹ️";
    }
  };

  const formatTimeAgo = (timestamp: Date) => {
    const now = new Date();
    const diffInMinutes = Math.floor(
      (now.getTime() - timestamp.getTime()) / (1000 * 60)
    );

    if (diffInMinutes < 1) return "Just now";
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
  };

  return (
    <div className="notification-bell" ref={dropdownRef}>
      <button
        className="notification-bell-button"
        onClick={handleBellClick}
        aria-label="Notifications"
      >
        <RiNotification3Line />
        {unreadCount > 0 && (
          <span className="notification-badge">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="notification-dropdown">
          <div className="notification-header">
            <h3>Notifications</h3>
            {unreadCount > 0 && (
              <button
                className="mark-all-read-button"
                onClick={handleMarkAllRead}
              >
                Mark all read
              </button>
            )}
          </div>

          <div className="notification-list">
            {loading ? (
              <div className="loading-notifications">
                <div className="loading-spinner"></div>
                <p>Loading notifications...</p>
              </div>
            ) : !Array.isArray(notifications) || notifications.length === 0 ? (
              <div className="empty-notifications">
                <div className="empty-icon">🔔</div>
                <p>No notifications yet</p>
                <span>You're all caught up!</span>
              </div>
            ) : (
              notifications.map((notification: Notification) => (
                <div
                  key={notification.id}
                  className={`notification-item ${
                    notification.status === "Unread" ? "unread" : ""
                  }`}
                  onClick={() => handleNotificationClick(notification)}
                >
                  <div className="notification-icon">
                    {getNotificationIcon(notification.type)}
                  </div>
                  <div className="notification-content">
                    <div className="notification-title">
                      {notification.title}
                      {notification.priority === "High" && (
                        <span className="priority-badge high">
                          High Priority
                        </span>
                      )}
                    </div>
                    <div className="notification-message">
                      {notification.message}
                    </div>
                    <div className="notification-time">
                      {formatTimeAgo(new Date(notification.createdAt))}
                    </div>
                  </div>
                  {notification.status === "Unread" && (
                    <div className="unread-indicator" />
                  )}
                </div>
              ))
            )}
          </div>

          {Array.isArray(notifications) && notifications.length > 0 && (
            <div className="notification-footer">
              <button className="view-all-button">
                View all notifications
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default NotificationBell;
