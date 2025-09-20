import React, { useState, useRef, useEffect } from "react";
import { useAppSelector, useAppDispatch } from "../../store";
import { logout } from "../../store/userSlice";
import { useNavigate } from "react-router-dom";
import ProfileEditModal from "./ProfileEditModal";
import {
  RiUserLine,
  RiEditLine,
  RiLogoutBoxLine,
  RiSettings3Line,
  RiShieldUserLine,
  RiMailLine,
  RiArrowDownSLine,
} from "react-icons/ri";
import "./UserProfileDropdown.scss";

const UserProfileDropdown: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const { name, email, userType, avatar } = useAppSelector(
    (state) => state.user
  );

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const getUserTypeLabel = (type: string) => {
    const typeMap: Record<string, string> = {
      super_user: "Super User",
      agency: "Agency",
      staff: "Staff",
      tenant: "Tenant",
      technician: "Technician",
      property_manager: "Property Manager",
      team_member: "Team Member",
    };
    return typeMap[type] || type;
  };

  const getInitials = (fullName: string) => {
    return fullName
      .split(" ")
      .map((n) => n.charAt(0))
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const handleLogout = () => {
    dispatch(logout());
    navigate("/login");
  };

  const handleEditProfile = () => {
    setShowEditModal(true);
    setIsOpen(false);
  };

  return (
    <>
      <div className="user-profile-dropdown" ref={dropdownRef}>
        <button
          className="profile-trigger"
          onClick={() => setIsOpen(!isOpen)}
          aria-label="User menu"
          aria-expanded={isOpen}
        >
          <div className="profile-avatar">
            {avatar ? (
              <img src={avatar} alt={name || "User"} />
            ) : (
              <span className="avatar-initials">
                {name ? getInitials(name) : "U"}
              </span>
            )}
          </div>
          <div className="profile-info">
            <span className="profile-name">{name || "User"}</span>
            <RiArrowDownSLine
              className={`dropdown-arrow ${isOpen ? "open" : ""}`}
            />
          </div>
        </button>

        {isOpen && (
          <div className="dropdown-menu">
            <div className="dropdown-header">
              <div className="header-avatar">
                {avatar ? (
                  <img src={avatar} alt={name || "User"} />
                ) : (
                  <span className="avatar-initials-large">
                    {name ? getInitials(name) : "U"}
                  </span>
                )}
              </div>
              <div className="header-info">
                <h3>{name || "User"}</h3>
                <p className="user-role">
                  <RiShieldUserLine />
                  {getUserTypeLabel(userType || "")}
                </p>
                <p className="user-email">
                  <RiMailLine />
                  {email || "user@example.com"}
                </p>
              </div>
            </div>

            <div className="dropdown-divider" />

            <div className="dropdown-content">
              <button className="dropdown-item" onClick={handleEditProfile}>
                <RiEditLine />
                <span>Edit Profile</span>
              </button>

              <button
                className="dropdown-item"
                onClick={() => navigate("/settings")}
              >
                <RiSettings3Line />
                <span>Settings</span>
              </button>

              <button
                className="dropdown-item"
                onClick={() => navigate("/profile")}
              >
                <RiUserLine />
                <span>View Profile</span>
              </button>
            </div>

            <div className="dropdown-divider" />

            <div className="dropdown-footer">
              <button className="dropdown-item logout" onClick={handleLogout}>
                <RiLogoutBoxLine />
                <span>Logout</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {showEditModal && (
        <ProfileEditModal
          isOpen={showEditModal}
          onClose={() => setShowEditModal(false)}
        />
      )}
    </>
  );
};

export default UserProfileDropdown;
