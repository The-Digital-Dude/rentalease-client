import { RiMenuLine } from "react-icons/ri";
import { useAppSelector } from "../../store";
import type { UserType } from "../../store";
import { Link } from "react-router-dom";
import NotificationBell from "../NotificationBell";
import { SidebarToggle } from "../SidebarToggle";
import { UserProfileDropdown } from "../UserProfileDropdown";
import "./TopNavbar.scss";
import { defaultRoutes } from "../../config/roleBasedRoutes";

interface TopNavbarProps {
  onMobileMenuClick?: () => void;
}

const TopNavbar = ({ onMobileMenuClick }: TopNavbarProps) => {
  const { userType } = useAppSelector((state) => state.user);
  const homePath = userType ? defaultRoutes[userType as UserType] : "/";

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
          <SidebarToggle />
          <div className="navbar-logo">
            <Link to={homePath}>
              <img
                src="/rentalease-logo.png"
                alt="RentalEase Logo"
                className="logo-image"
              />
            </Link>
          </div>
        </div>
        <div className="navbar-actions">
          <NotificationBell onNotificationClick={handleNotificationClick} />
          <UserProfileDropdown />
        </div>
      </div>
    </header>
  );
};

export default TopNavbar;
