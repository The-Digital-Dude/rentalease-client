import { RoleDisplay, RoleTestButtons } from "../../components";
import { useAppSelector, useAppDispatch } from "../../store";
import { logout } from "../../store/userSlice";
import { useNavigate } from "react-router-dom";
import { RiLogoutBoxLine } from "react-icons/ri";
import type { UserType } from "../../store/userSlice";
import { defaultRoutes } from "../../config/roleBasedRoutes";
import TechnicianDashboard from "../TechnicianDashboard/TechnicianDashboard";
import StaffDashboard from "../StaffDashboard/StaffDashboard";
import SuperUserDashboard from "../SuperUserDashboard/SuperUserDashboard";
import AgencyDashboard from "../AgencyDashboard/AgencyDashboard";
import PropertyManagerDashboard from "../PropertyManagerDashboard/PropertyManagerDashboard";
import "./Dashboard.scss";

const Dashboard = () => {
  const { userType } = useAppSelector((state) => state.user);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const currentPath = userType ? defaultRoutes[userType as UserType] : "/";

  const handleLogout = () => {
    dispatch(logout());
    navigate("/login");
  };

  // Render different dashboards based on user type
  const renderDashboardContent = () => {
    switch (userType) {
      case "technician":
        return <TechnicianDashboard />;
      case "tenant":
        // Tenants use email-only interactions, redirect to login
        navigate("/login");
        return null;
      case "staff":
        return <StaffDashboard />;
      case "super_user":
        return <SuperUserDashboard />;
      case "team_member":
        return <StaffDashboard />;
      case "agency":
        return <AgencyDashboard />;
      case "property_manager":
        return <PropertyManagerDashboard />;
      default:
        // Default dashboard for unknown user types
        return (
          <>
            <div className="content-card">
              <h3>Welcome to RentaLease</h3>
              <p>Your property management dashboard is coming soon.</p>
            </div>
            <RoleDisplay />
            <RoleTestButtons />
          </>
        );
    }
  };

  return <div className="page-container">{renderDashboardContent()}</div>;
};

export default Dashboard;
