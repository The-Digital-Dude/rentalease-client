import { RoleDisplay, RoleTestButtons } from "../../components";
import { useAppSelector } from "../../store";
import type { UserType } from "../../store/userSlice";
import { defaultRoutes } from "../../config/roleBasedRoutes";
import "./Dashboard.scss";

const Dashboard = () => {
  const { userType } = useAppSelector((state) => state.user);
  const currentPath = userType ? defaultRoutes[userType as UserType] : "/";

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Dashboard</h1>
        <p>Overview of your property management activities</p>
        <p className="current-path">
          Current URL: <code>{currentPath}</code>
        </p>
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
