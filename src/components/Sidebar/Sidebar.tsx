import { Link, useLocation } from "react-router-dom";
import { useAppSelector } from "../../store";
import { allowedRoutes } from "../../config/roleBasedRoutes";
import type { UserType } from "../../store/userSlice";
import "./Sidebar.scss";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const labelMap: Record<string, string> = {
  dashboard: "Dashboard",
  devDashboard: "DevDashboard",
  agencies: "Agencies",
  jobs: "Jobs",
  properties: "Properties",
  technician: "Technicians",
  staff: "My Staff",
  contacts: "Contacts",
  reports: "Reports",
  payment: "Payment",
  compliance: "Compliance",
  region: "Region Management",
  login: "Login",
  availableJobs: "Available Jobs",
  myJobs: "My Jobs",
  activeJobs: "Active Jobs",
  overdueJobs: "Overdue Jobs",
};

export const Sidebar = ({ isOpen, onClose }: SidebarProps) => {
  const { userType } = useAppSelector((state) => state.user);
  const location = useLocation();

  if (!userType) {
    return null;
  }

  const userRoutes = allowedRoutes[userType as UserType] || [];

  return (
    <aside className={`sidebar ${isOpen ? "open" : ""}`}>
      <nav className="sidebar-nav">
        {userRoutes.map((route) => {
          const routePath = `/${route}`;
          const isActive = location.pathname === routePath;

          return (
            <Link
              key={route}
              to={routePath}
              className={`nav-link ${isActive ? "active" : ""}`}
              onClick={onClose}
            >
              {labelMap[route] || route}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
};
