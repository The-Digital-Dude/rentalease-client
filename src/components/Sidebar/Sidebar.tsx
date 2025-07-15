import { NavLink } from "react-router-dom";
import {
  RiDashboardLine,
  RiBuilding4Line,
  RiBriefcaseLine,
  RiTeamLine,
  RiFileListLine,
  RiMapPin2Line,
  RiBarChartBoxLine,
  RiContactsLine,
  RiShieldCheckLine,
  RiMoneyDollarCircleLine,
  RiHome2Line,
} from "react-icons/ri";
import { useAppSelector } from "../../store";
import { baseRoutes, getFullRoute } from "../../config/roleBasedRoutes";
import "./Sidebar.scss";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const Sidebar = ({ isOpen, onClose }: SidebarProps) => {
  const { userType } = useAppSelector((state) => state.user);

  const handleBackdropClick = () => {
    if (window.innerWidth < 768) {
      onClose();
    }
  };

  // Define icon mapping for each base route
  const iconMap: Record<string, typeof RiDashboardLine> = {
    dashboard: RiDashboardLine,
    agencies: RiBuilding4Line,
    jobs: RiBriefcaseLine,
    properties: RiHome2Line,
    staff: RiTeamLine,
    regions: RiMapPin2Line,
    reports: RiBarChartBoxLine,
    contacts: RiContactsLine,
    invoices: RiFileListLine,
    compliance: RiShieldCheckLine,
    "payment-property": RiMoneyDollarCircleLine,
  };

  // Define label mapping for each base route
  const labelMap: Record<string, string> = {
    dashboard: "Dashboard",
    agencies: "Property Managers",
    jobs: "Jobs",
    properties: "Properties",
    staff: "Staff",
    regions: "Region Management",
    reports: "Reports & Analytics",
    contacts: "Contacts & Communication",
    invoices: "Invoices",
    compliance: "Property Compliance",
    "payment-property": "Payment & Property",
  };

  // Generate navigation items based on user's role
  const navItems =
    userType && userType in baseRoutes
      ? baseRoutes[userType as keyof typeof baseRoutes].map(
          (baseRoute: string) => ({
            path: getFullRoute(userType, baseRoute),
            icon: iconMap[baseRoute],
            label: labelMap[baseRoute],
          })
        )
      : [];

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
          {navItems.map(
            (item: {
              path: string;
              icon: React.ComponentType<{ className?: string }>;
              label: string;
            }) => {
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
            }
          )}
        </nav>
      </aside>
    </>
  );
};

export default Sidebar;
