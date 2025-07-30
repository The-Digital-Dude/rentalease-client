import { RiMenuLine } from "react-icons/ri";
import NotificationBell from "../NotificationBell";
import "./TopNavbar.scss";

interface TopNavbarProps {
  onMobileMenuClick?: () => void;
}

const TopNavbar = ({ onMobileMenuClick }: TopNavbarProps) => {
  const handleNotificationClick = (notification: any) => {
    console.log("Notification clicked:", notification);
    // Handle notification click - could navigate to relevant page or mark as read
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
          <NotificationBell onNotificationClick={handleNotificationClick} />
        </div>
      </div>
    </header>
  );
};

export default TopNavbar;
