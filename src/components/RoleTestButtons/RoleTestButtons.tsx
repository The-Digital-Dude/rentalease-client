import React from "react";
import { useNavigate } from "react-router-dom";
import { useAppDispatch } from "../../store";
import { login } from "../../store/userSlice";
import type { UserType } from "../../store/userSlice";
import { defaultRoutes } from "../../config/roleBasedRoutes";
import "./RoleTestButtons.scss";

interface TestUser {
  userType: UserType;
  name: string;
  email: string;
  id: string;
}

const testUsers: TestUser[] = [
  {
    userType: "super_user",
    name: "Super Admin",
    email: "admin@rentalease.com",
    id: "su-1",
  },
  {
    userType: "agency",
    name: "Agency",
    email: "manager@rentalease.com",
    id: "pm-1",
  },
  {
    userType: "staff",
    name: "Staff Member",
    email: "staff@rentalease.com",
    id: "st-1",
  },
];

export const RoleTestButtons = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const handleRoleSwitch = (user: TestUser) => {
    dispatch(
      login({
        userType: user.userType,
        name: user.name,
        email: user.email,
        id: user.id,
      })
    );

    const dashboardPath = defaultRoutes[user.userType];
    navigate(dashboardPath, { replace: true });
  };

  return (
    <div className="role-test-buttons">
      <h3>Test Different Roles</h3>
      <div className="button-group">
        {testUsers.map((user) => (
          <button
            key={user.userType}
            onClick={() => handleRoleSwitch(user)}
            className={`role-button ${user.userType}`}
          >
            {user.name}
          </button>
        ))}
      </div>
    </div>
  );
};
