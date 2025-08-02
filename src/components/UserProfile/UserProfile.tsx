import React from "react";
import { useAppSelector } from "../../store";
import "./UserProfile.scss";

interface UserProfileProps {
  onClick?: () => void;
}

export const UserProfile: React.FC<UserProfileProps> = ({ onClick }) => {
  const { name, email, userType } = useAppSelector((state) => state.user);

  const getUserTypeLabel = (type: string) => {
    const typeMap: Record<string, string> = {
      super_user: "Super User",
      agency: "Agency",
      staff: "Staff",
      tenant: "Tenant",
      technician: "Technician",
      property_manager: "Property Manager",
    };
    return typeMap[type] || type;
  };

  const getInitials = (fullName: string) => {
    return fullName
      .split(" ")
      .map((name) => name.charAt(0))
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="user-profile" onClick={onClick}>
      <div className="user-avatar">{name ? getInitials(name) : "U"}</div>
      <div className="user-info">
        <div className="user-name">{name || "User"}</div>
        <div className="user-role">{getUserTypeLabel(userType || "")}</div>
        <div className="user-email">{email || "user@example.com"}</div>
      </div>
    </div>
  );
};
