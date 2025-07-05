import { NavLink } from "react-router-dom";
import {
  RiDashboardLine,
  RiBuilding4Line,
  RiBriefcaseLine,
  RiTeamLine,
  RiFileListLine,
  RiMapPin2Line,
} from "react-icons/ri";
import "./Sidebar.scss";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const Sidebar = ({ isOpen, onClose }: SidebarProps) => {
  const handleBackdropClick = () => {
    if (window.innerWidth < 768) {
      onClose();
    }
  };

  const navItems = [
    { path: "/", icon: RiDashboardLine, label: "Dashboard" },
    { path: "/agencies", icon: RiBuilding4Line, label: "Agencies" },
    { path: "/jobs", icon: RiBriefcaseLine, label: "Jobs" },
    { path: "/staff", icon: RiTeamLine, label: "Staff" },
    { path: "/regions", icon: RiMapPin2Line, label: "Region Management" },
    { path: "/invoices", icon: RiFileListLine, label: "Invoices" },
  ];

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          className="sidebar-backdrop"
          onClick={handleBackdropClick}
          style={{
            display: window.innerWidth < 768 ? "block" : "none",
          }}
        />
      )}

      <aside className={`sidebar ${isOpen ? "open" : ""}`}>
        <nav className="sidebar-nav">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `nav-item ${isActive ? "active" : ""}`
                }
                onClick={() => {
                  if (window.innerWidth < 768) {
                    onClose();
                  }
                }}
              >
                <Icon className="nav-icon" />
                <span className="nav-label">{item.label}</span>
              </NavLink>
            );
          })}
        </nav>
      </aside>
    </>
  );
};

export default Sidebar;
