import { useAppSelector } from "../../store";
import { getFullRoute } from "../../config/roleBasedRoutes";
import "./Properties.scss";

const Properties = () => {
  const { userType } = useAppSelector((state) => state.user);
  const currentPath = userType ? getFullRoute(userType, 'properties') : '/';

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Properties</h1>
        <p>Manage your property portfolio</p>
        <p className="current-path">Current URL: <code>{currentPath}</code></p>
      </div>
      <div className="content-card">
        <h3>Property Management</h3>
        <p>Property management features are coming soon.</p>
        <ul>
          <li>View all properties</li>
          <li>Add new properties</li>
          <li>Edit property details</li>
          <li>Property status tracking</li>
          <li>Property maintenance schedules</li>
        </ul>
      </div>
    </div>
  );
};

export default Properties; 