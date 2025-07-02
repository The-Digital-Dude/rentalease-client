import { RiMenuLine } from "react-icons/ri";
import "./TopNavbar.scss";

interface TopNavbarProps {
  onMobileMenuClick?: () => void;
}

const TopNavbar = ({ onMobileMenuClick }: TopNavbarProps) => {
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
          {/* Future: Add user menu, notifications, etc. */}
        </div>
      </div>
    </header>
  );
};

export default TopNavbar;
