import { Link, useLocation } from "react-router-dom";
import { useAppSelector } from "../../store";
import { allowedRoutes } from "../../config/roleBasedRoutes";
import type { UserType } from "../../store/userSlice";
import { UserProfile } from "../UserProfile";
import { useSidebar } from "../../contexts/SidebarContext";
import {
  MdDashboard,
  MdBusiness,
  MdWork,
  MdHome,
  MdAssignment,
  MdPerson,
  MdPeople,
  MdGroup,
  MdContacts,
  MdPayment,
  MdVerifiedUser,
  MdMap,
  MdLogin,
  MdWorkOutline,
  MdCheckCircle,
  MdError,
  MdSchedule,
  MdAttachMoney,
  MdCode,
  MdCreditCard,
  MdEmail,
} from "react-icons/md";
import "./Sidebar.scss";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const labelMap: Record<string, string> = {
  dashboard: "Dashboard",
  devDashboard: "DevDashboard",
  agencies: "Agencies",
  agencyJobs: "Jobs",
  jobs: "Jobs",
  properties: "Properties",
  propertyAssignment: "Property Assignment",
  technician: "Technicians",
  propertyManagerManagement: "Property Managers",
  staff: "My Staff",
  contacts: "Contacts",
  // reports: "Reports",
  payment: "Payment",
  compliance: "Compliance",
  region: "Region Management",
  login: "Login",
  availableJobs: "Available Jobs",
  myJobs: "My Jobs",
  activeJobs: "Active Jobs",
  overdueJobs: "Overdue Jobs",
  completedJobs: "Completed Jobs",
  "scheduled-jobs": "Scheduled Jobs",
  "overdue-jobs": "Overdue Jobs",
  "completed-jobs": "Completed Jobs",
  myPayments: "My Payments",
  technicianPayments: "Technician Payments",
  teamMembers: "Team Members",
  subscription: "Subscription",
  messages: "Messages",
};

const iconMap: Record<string, React.ReactNode> = {
  dashboard: <MdDashboard />,
  devDashboard: <MdCode />,
  agencies: <MdBusiness />,
  agencyJobs: <MdWork />,
  jobs: <MdWork />,
  properties: <MdHome />,
  propertyAssignment: <MdAssignment />,
  technician: <MdPerson />,
  propertyManagerManagement: <MdPeople />,
  staff: <MdGroup />,
  contacts: <MdContacts />,
  payment: <MdPayment />,
  compliance: <MdVerifiedUser />,
  region: <MdMap />,
  login: <MdLogin />,
  availableJobs: <MdWorkOutline />,
  myJobs: <MdWork />,
  activeJobs: <MdWorkOutline />,
  overdueJobs: <MdError />,
  completedJobs: <MdCheckCircle />,
  "scheduled-jobs": <MdSchedule />,
  "overdue-jobs": <MdError />,
  "completed-jobs": <MdCheckCircle />,
  myPayments: <MdAttachMoney />,
  technicianPayments: <MdPayment />,
  teamMembers: <MdGroup />,
  subscription: <MdCreditCard />,
  messages: <MdEmail />,
};

export const Sidebar = ({ isOpen, onClose }: SidebarProps) => {
  const { userType } = useAppSelector((state) => state.user);
  const location = useLocation();
  const { isCollapsed } = useSidebar();

  if (!userType) {
    return null;
  }

  const userRoutes = allowedRoutes[userType as UserType] || [];

  return (
    <aside className={`sidebar ${isOpen ? "open" : ""} ${isCollapsed ? "collapsed" : ""}`}>
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
              <span className="nav-icon">{iconMap[route]}</span>
              <span className="nav-label">{labelMap[route] || route}</span>
            </Link>
          );
        })}
      </nav>
      <UserProfile />
      <div className="sidebar-footer">
        <p className="developer-credit">
          Developed By{" "}
          <a
            href="https://rokoautomations.com"
            target="_blank"
            rel="noopener noreferrer"
            className="roko-link"
          >
            Roko Automations
          </a>
        </p>
      </div>
    </aside>
  );
};
