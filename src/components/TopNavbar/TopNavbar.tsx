import { RiMenuLine } from "react-icons/ri";
import NotificationBell from "../NotificationBell";
import "./TopNavbar.scss";

interface TopNavbarProps {
  onMobileMenuClick?: () => void;
}

const TopNavbar = ({ onMobileMenuClick }: TopNavbarProps) => {
  // Sample notifications for demonstration
  const sampleNotifications = [
    {
      id: "1",
      title: "New Property Added",
      message:
        "A new property has been added to your portfolio at 123 Main St.",
      type: "success" as const,
      timestamp: new Date(Date.now() - 5 * 60 * 1000), // 5 minutes ago
      read: false,
    },
    {
      id: "2",
      title: "Maintenance Request",
      message:
        "Urgent maintenance request submitted for Unit 4B at Oakwood Apartments.",
      type: "warning" as const,
      timestamp: new Date(Date.now() - 30 * 60 * 1000), // 30 minutes ago
      read: false,
    },
    {
      id: "3",
      title: "Payment Received",
      message: "Rent payment received from John Smith for March 2024.",
      type: "success" as const,
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
      read: true,
    },
    {
      id: "4",
      title: "System Update",
      message:
        "Scheduled maintenance will occur tonight at 2 AM. Service may be temporarily unavailable.",
      type: "info" as const,
      timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000), // 4 hours ago
      read: true,
    },
  ];

  const handleNotificationClick = (notification: any) => {
    console.log("Notification clicked:", notification);
    // Handle notification click - could navigate to relevant page or mark as read
  };

  const handleMarkAllRead = () => {
    console.log("Mark all notifications as read");
    // Handle marking all notifications as read
  };

  return (
    <header className="top-navbar">
      <div className="navbar-content">
        <div className="navbar-left">
          <button
            className="mobile-menu-button"
            onClick={onMobileMenuClick}
            aria-label="Toggle menu"
          >
            <RiMenuLine />
          </button>
          <div className="navbar-logo">
            <span className="logo-icon">RL</span>
            <span className="logo-text">Rentalease</span>
          </div>
        </div>
        <div className="navbar-actions">
          <NotificationBell
            notifications={sampleNotifications}
            onNotificationClick={handleNotificationClick}
            onMarkAllRead={handleMarkAllRead}
          />
        </div>
      </div>
    </header>
  );
};

export default TopNavbar;
