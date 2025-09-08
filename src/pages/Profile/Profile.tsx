import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAppSelector } from "../../store";
import { toast } from "react-toastify";
import getFrontendLink from "../../constants/frontendlinks";
import {
  RiUserLine,
  RiPhoneLine,
  RiMailLine,
  RiCalendarLine,
  RiShieldUserLine,
  RiEditLine,
  RiSettings3Line,
  RiArrowLeftLine,
} from "react-icons/ri";
import "./Profile.scss";

interface ProfileData {
  id: string;
  name: string;
  email: string;
  userType: string;
  avatar: string | null;
  phone: string | null;
  createdAt: string;
}

const Profile: React.FC = () => {
  const navigate = useNavigate();
  const { name, email, phone, avatar, userType, id } = useAppSelector((state) => state.user);
  
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);

  // Sync profile data with Redux state when it changes
  useEffect(() => {
    if (name && email && userType && id) {
      const reduxProfile: ProfileData = {
        id,
        name,
        email,
        userType,
        avatar,
        phone,
        createdAt: profile?.createdAt || new Date().toISOString(),
      };
      setProfile(reduxProfile);
      setLoading(false);
    } else {
      fetchProfile();
    }
  }, [name, email, phone, avatar, userType, id]);

  // Fetch profile data on component mount
  useEffect(() => {
    if (!name || !email || !userType || !id) {
      fetchProfile();
    }
  }, []);

  const fetchProfile = async () => {
    try {
      const token = localStorage.getItem("authToken");
      
      // Check if user is authenticated
      if (!token) {
        toast.error("Please log in to view your profile");
        navigate("/login");
        return;
      }

      const response = await fetch(`${getFrontendLink()}/v1/profile`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        const profileData = data.data.user;
        setProfile(profileData);
      } else if (response.status === 401) {
        // Token expired or invalid
        toast.error("Your session has expired. Please log in again.");
        localStorage.removeItem("authToken");
        localStorage.removeItem("userData");
        navigate("/login");
      } else {
        const errorData = await response.json();
        toast.error(errorData.message || "Failed to fetch profile");
      }
    } catch (error) {
      console.error("Error fetching profile:", error);
      toast.error("An error occurred while fetching profile");
    } finally {
      setLoading(false);
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n.charAt(0))
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const getUserTypeLabel = (type: string) => {
    const typeMap: Record<string, string> = {
      SuperUser: "Super User",
      Agency: "Agency",
      PropertyManager: "Property Manager", 
      Technician: "Technician",
      superUser: "Super User",
    };
    return typeMap[type] || type;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  if (loading) {
    return (
      <div className="profile-loading">
        <div className="loading-spinner"></div>
        <p>Loading profile...</p>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="profile-error">
        <p>Failed to load profile data.</p>
        <button onClick={fetchProfile} className="btn-primary">
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="profile-page">
      {/* Header */}
      <div className="profile-header">
        <button 
          className="back-button"
          onClick={() => navigate(-1)}
          aria-label="Go back"
        >
          <RiArrowLeftLine />
          Back
        </button>
        
        <div className="header-actions">
          <button 
            className="btn-secondary"
            onClick={() => navigate("/settings")}
          >
            <RiSettings3Line />
            Settings
          </button>
        </div>
      </div>

      {/* Profile Content */}
      <div className="profile-content">
        {/* Profile Header Card */}
        <div className="profile-header-card">
          <div className="profile-header-content">
            <div className="profile-avatar-section">
              <div className="profile-avatar">
                {profile.avatar ? (
                  <img src={profile.avatar} alt={profile.name} />
                ) : (
                  <div className="avatar-placeholder">
                    <span>{profile.name ? getInitials(profile.name) : "U"}</span>
                  </div>
                )}
              </div>
              
              <div className="profile-info">
                <div className="profile-name-section">
                  <h1 className="profile-name">{profile.name || "User"}</h1>
                  <div className="profile-badge">
                    <RiShieldUserLine />
                    <span>{getUserTypeLabel(profile.userType)}</span>
                  </div>
                </div>
                
                <div className="profile-meta">
                  <div className="profile-email">
                    <RiMailLine />
                    <span>{profile.email}</span>
                  </div>
                  {profile.phone && (
                    <div className="profile-phone">
                      <RiPhoneLine />
                      <span>{profile.phone}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            <div className="profile-stats">
              <div className="stat-card">
                <div className="stat-value">
                  <span className="status-active">Active</span>
                </div>
                <div className="stat-label">Account Status</div>
              </div>
              <div className="stat-card">
                <div className="stat-value">{formatDate(profile.createdAt)}</div>
                <div className="stat-label">Member Since</div>
              </div>
            </div>
          </div>
        </div>

        {/* Account Details Section */}
        <div className="profile-details-grid">
          {/* Personal Information Card */}
          <div className="detail-card">
            <div className="card-header">
              <h3>Personal Information</h3>
            </div>
            <div className="card-content">
              <div className="detail-item">
                <label>Full Name</label>
                <div className="detail-value">
                  <RiUserLine />
                  <span>{profile.name || "Not provided"}</span>
                </div>
              </div>
              <div className="detail-item">
                <label>Email Address</label>
                <div className="detail-value">
                  <RiMailLine />
                  <span>{profile.email}</span>
                </div>
              </div>
              <div className="detail-item">
                <label>Phone Number</label>
                <div className="detail-value">
                  <RiPhoneLine />
                  <span>{profile.phone || "Not provided"}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Account Information Card */}
          <div className="detail-card">
            <div className="card-header">
              <h3>Account Information</h3>
            </div>
            <div className="card-content">
              <div className="detail-item">
                <label>User Type</label>
                <div className="detail-value">
                  <RiShieldUserLine />
                  <span>{getUserTypeLabel(profile.userType)}</span>
                </div>
              </div>
              <div className="detail-item">
                <label>Account Created</label>
                <div className="detail-value">
                  <RiCalendarLine />
                  <span>{formatDate(profile.createdAt)}</span>
                </div>
              </div>
              <div className="detail-item">
                <label>User ID</label>
                <div className="detail-value user-id">
                  <RiUserLine />
                  <span>{profile.id}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions Card */}
        <div className="actions-card">
          <div className="card-header">
            <h3>Quick Actions</h3>
            <p>Manage your profile and account settings</p>
          </div>
          <div className="actions-content">
            <button 
              className="primary-action-btn"
              onClick={() => navigate("/settings")}
            >
              <RiEditLine />
              <div className="action-text">
                <span>Edit Profile</span>
                <p>Update your personal information</p>
              </div>
            </button>

            <button 
              className="secondary-action-btn"
              onClick={() => navigate("/settings")}
            >
              <RiSettings3Line />
              <div className="action-text">
                <span>Account Settings</span>
                <p>Manage account preferences</p>
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;