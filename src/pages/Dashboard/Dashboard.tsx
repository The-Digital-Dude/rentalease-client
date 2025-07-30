import { RoleDisplay, RoleTestButtons } from "../../components";
import { useAppSelector, useAppDispatch } from "../../store";
import { logout } from "../../store/userSlice";
import { useNavigate } from "react-router-dom";
import { RiLogoutBoxLine } from "react-icons/ri";
import type { UserType } from "../../store/userSlice";
import { defaultRoutes } from "../../config/roleBasedRoutes";
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

  return (
    <div className="page-container">
      <div className="page-header">
        <div className="header-content">
          <div className="header-info">
            <h1>Dashboard</h1>
            <p>Overview of your property management activities</p>
            <p className="current-path">
              Current URL: <code>{currentPath}</code>
            </p>
          </div>
          <button
            className="dashboard-logout-button"
            onClick={handleLogout}
            title="Logout"
          >
            <RiLogoutBoxLine />
            <span>Logout</span>
          </button>
        </div>
      </div>
      <div className="content-card">
        <h3>Welcome to RentaLease</h3>
        <p>Your property management dashboard is coming soon.</p>
      </div>

      <RoleDisplay />
      <RoleTestButtons />
    </div>
  );
};

export default Dashboard;
