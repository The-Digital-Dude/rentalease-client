import { useAppSelector } from "../../store";
import { allowedRoutes } from "../../config/roleBasedRoutes";
import type { UserType } from "../../store/userSlice";
import "./RoleDisplay.scss";

export const RoleDisplay = () => {
  const { userType } = useAppSelector((state) => state.user);
  const accessibleRoutes = userType ? allowedRoutes[userType as UserType] : [];

  return (
    <div className="role-display">
      <h3>Current Role: {userType || "Not logged in"}</h3>
      <div className="accessible-routes">
        <h4>Accessible Routes:</h4>
        <ul>
          {accessibleRoutes.map((route) => (
            <li key={route}>/{route}</li>
          ))}
        </ul>
      </div>
    </div>
  );
};
