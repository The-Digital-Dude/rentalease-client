import { RiMenuLine, RiLogoutBoxLine } from "react-icons/ri";
import { useAppDispatch } from "../../store";
import { logout } from "../../store/userSlice";
import { useNavigate } from "react-router-dom";
import NotificationBell from "../NotificationBell";
import "./TopNavbar.scss";

interface TopNavbarProps {
  onMobileMenuClick?: () => void;
}

const TopNavbar = ({ onMobileMenuClick }: TopNavbarProps) => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const handleNotificationClick = (notification: any) => {
    console.log("Notification clicked:", notification);
    // Handle notification click - could navigate to relevant page or mark as read
  };

  const handleLogout = () => {
    dispatch(logout());
    navigate("/login");
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
            <img
              src="/rentalease-logo.png"
              alt="RentalEase Logo"
              className="logo-image"
            />
          </div>
        </div>
        <div className="navbar-actions">
          <NotificationBell onNotificationClick={handleNotificationClick} />
          <button
            className="logout-button"
            onClick={handleLogout}
            title="Logout"
            aria-label="Logout"
          >
            <RiLogoutBoxLine />
            <span className="logout-text">Logout</span>
          </button>
        </div>
      </div>
    </header>
  );
};

export default TopNavbar;
