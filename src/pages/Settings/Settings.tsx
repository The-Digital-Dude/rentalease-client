import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAppSelector, useAppDispatch } from "../../store";
import { updateUserProfile } from "../../store/userSlice";
import { toast } from "react-toastify";
import getFrontendLink from "../../constants/frontendlinks";
import {
  RiUserLine,
  RiPhoneLine,
  RiMailLine,
  RiCalendarLine,
  RiShieldUserLine,
  RiSaveLine,
  RiCameraLine,
  RiDeleteBinLine,
  RiUploadLine,
} from "react-icons/ri";
import "./Settings.scss";

interface ProfileData {
  id: string;
  name: string;
  email: string;
  userType: string;
  avatar: string | null;
  phone: string | null;
  createdAt: string;
}

const Settings: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { name, email, phone, avatar, userType } = useAppSelector((state) => state.user);
  
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
  });
  
  const [previewAvatar, setPreviewAvatar] = useState<string | null>(null);
  const avatarInputRef = React.useRef<HTMLInputElement>(null);

  // Fetch profile data on component mount
  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const token = localStorage.getItem("authToken");
      
      // Check if user is authenticated
      if (!token) {
        toast.error("Please log in to access settings");
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
        setFormData({
          name: profileData.name || "",
          phone: profileData.phone || "",
        });
        setPreviewAvatar(profileData.avatar);
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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const token = localStorage.getItem("authToken");
      const response = await fetch(`${getFrontendLink()}/v1/profile`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        const data = await response.json();
        const updatedUser = data.data.user;
        
        // Update Redux store with all fields
        dispatch(updateUserProfile({
          name: updatedUser.name,
          phone: updatedUser.phone,
          avatar: updatedUser.avatar,
        }));
        
        // Update local state with complete user data
        setProfile((prev) => prev ? {
          ...prev,
          ...updatedUser,
        } : updatedUser);
        
        // Update form data to reflect changes
        setFormData({
          name: updatedUser.name || "",
          phone: updatedUser.phone || "",
        });
        
        toast.success("Profile updated successfully!");
      } else {
        const errorData = await response.json();
        toast.error(errorData.message || "Failed to update profile");
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error("An error occurred while updating profile");
    } finally {
      setSaving(false);
    }
  };

  const handleAvatarSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      toast.error("Please select a valid image file (JPG, PNG, or WebP)");
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("File size must be less than 5MB");
      return;
    }

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviewAvatar(reader.result as string);
    };
    reader.readAsDataURL(file);

    // Upload avatar
    uploadAvatar(file);
  };

  const uploadAvatar = async (file: File) => {
    setUploadingAvatar(true);
    const formData = new FormData();
    formData.append("avatar", file);

    try {
      const token = localStorage.getItem("authToken");
      const response = await fetch(`${getFrontendLink()}/v1/profile/avatar`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        const newAvatarUrl = data.data.avatar;
        
        // Update Redux store with complete user data
        dispatch(updateUserProfile({ avatar: newAvatarUrl }));
        
        // Update local profile state
        setProfile((prev) => prev ? {
          ...prev,
          avatar: newAvatarUrl,
        } : null);
        
        setPreviewAvatar(newAvatarUrl);
        toast.success("Avatar updated successfully!");
      } else {
        const errorData = await response.json();
        toast.error(errorData.message || "Failed to upload avatar");
        setPreviewAvatar(profile?.avatar || null);
      }
    } catch (error) {
      console.error("Error uploading avatar:", error);
      toast.error("An error occurred while uploading avatar");
      setPreviewAvatar(profile?.avatar || null);
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleRemoveAvatar = async () => {
    if (!profile?.avatar) return;

    setUploadingAvatar(true);
    try {
      const token = localStorage.getItem("authToken");
      const response = await fetch(`${getFrontendLink()}/v1/profile/avatar`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        // Update Redux store with empty avatar
        dispatch(updateUserProfile({ avatar: null }));
        
        // Update local profile state
        setProfile((prev) => prev ? {
          ...prev,
          avatar: null,
        } : null);
        
        setPreviewAvatar(null);
        toast.success("Avatar removed successfully!");
      } else {
        const errorData = await response.json();
        toast.error(errorData.message || "Failed to remove avatar");
      }
    } catch (error) {
      console.error("Error removing avatar:", error);
      toast.error("An error occurred while removing avatar");
    } finally {
      setUploadingAvatar(false);
    }
  };

  const triggerAvatarUpload = () => {
    avatarInputRef.current?.click();
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
      <div className="settings-loading">
        <div className="loading-spinner"></div>
        <p>Loading profile...</p>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="settings-error">
        <p>Failed to load profile data.</p>
        <button onClick={fetchProfile} className="btn-primary">
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="settings-page">
      <div className="settings-header">
        <h1>Settings</h1>
        <p>Manage your profile information and account settings</p>
      </div>

      <div className="settings-content">
        {/* Avatar Section */}
        <div className="settings-section">
          <h2>Profile Picture</h2>
          <div className="avatar-upload-section">
            <div className="avatar-preview">
              {previewAvatar ? (
                <img src={previewAvatar} alt="Avatar" />
              ) : (
                <div className="avatar-placeholder">
                  <span>{profile.name ? getInitials(profile.name) : "U"}</span>
                </div>
              )}
              {uploadingAvatar && (
                <div className="upload-overlay">
                  <div className="spinner" />
                </div>
              )}
            </div>

            <div className="avatar-actions">
              <button
                type="button"
                className="btn-upload"
                onClick={triggerAvatarUpload}
                disabled={uploadingAvatar}
              >
                {previewAvatar ? (
                  <>
                    <RiCameraLine />
                    Change Photo
                  </>
                ) : (
                  <>
                    <RiUploadLine />
                    Upload Photo
                  </>
                )}
              </button>

              {previewAvatar && (
                <button
                  type="button"
                  className="btn-remove"
                  onClick={handleRemoveAvatar}
                  disabled={uploadingAvatar}
                >
                  <RiDeleteBinLine />
                  Remove
                </button>
              )}
            </div>

            <input
              ref={avatarInputRef}
              type="file"
              accept="image/jpeg,image/jpg,image/png,image/webp"
              onChange={handleAvatarSelect}
              style={{ display: "none" }}
            />

            <p className="avatar-help-text">
              Allowed formats: JPG, PNG, WebP. Max size: 5MB
            </p>
          </div>
        </div>

        {/* Profile Information */}
        <div className="settings-section">
          <h2>Profile Information</h2>
          <form onSubmit={handleSubmit}>
            <div className="form-grid">
              <div className="form-group">
                <label htmlFor="name">
                  <RiUserLine />
                  Full Name
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Enter your full name"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="phone">
                  <RiPhoneLine />
                  Phone Number
                </label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  placeholder="Enter your phone number"
                />
              </div>

              <div className="form-group">
                <label htmlFor="email">
                  <RiMailLine />
                  Email Address
                </label>
                <input
                  type="email"
                  id="email"
                  value={profile.email}
                  disabled
                  className="disabled-input"
                />
                <span className="helper-text">Email cannot be changed</span>
              </div>

              <div className="form-group">
                <label>
                  <RiShieldUserLine />
                  User Type
                </label>
                <input
                  type="text"
                  value={getUserTypeLabel(profile.userType)}
                  disabled
                  className="disabled-input"
                />
                <span className="helper-text">User type is assigned by administrators</span>
              </div>

              <div className="form-group">
                <label>
                  <RiCalendarLine />
                  Member Since
                </label>
                <input
                  type="text"
                  value={formatDate(profile.createdAt)}
                  disabled
                  className="disabled-input"
                />
              </div>
            </div>

            <div className="form-actions">
              <button
                type="submit"
                className="btn-primary"
                disabled={saving}
              >
                <RiSaveLine />
                {saving ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Settings;