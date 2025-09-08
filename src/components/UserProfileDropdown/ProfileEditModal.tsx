import React, { useState, useEffect } from "react";
import { useAppSelector, useAppDispatch } from "../../store";
import { updateUserProfile } from "../../store/userSlice";
import AvatarUpload from "./AvatarUpload";
import getFrontendLink from "../../constants/frontendlinks";
import { toast } from "react-toastify";
import { RiCloseLine, RiSaveLine, RiUserLine, RiPhoneLine } from "react-icons/ri";
import "./ProfileEditModal.scss";

interface ProfileEditModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const ProfileEditModal: React.FC<ProfileEditModalProps> = ({ isOpen, onClose }) => {
  const dispatch = useAppDispatch();
  const { name, email, phone, avatar } = useAppSelector((state) => state.user);
  
  const [formData, setFormData] = useState({
    name: name || "",
    phone: phone || "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState(avatar || "");

  useEffect(() => {
    setFormData({
      name: name || "",
      phone: phone || "",
    });
    setAvatarUrl(avatar || "");
  }, [name, phone, avatar]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

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

      const data = await response.json();

      if (response.ok) {
        dispatch(updateUserProfile({
          name: data.data.user.name,
          phone: data.data.user.phone,
        }));
        toast.success("Profile updated successfully!");
        onClose();
      } else {
        toast.error(data.message || "Failed to update profile");
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error("An error occurred while updating profile");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAvatarUpdate = (newAvatarUrl: string) => {
    setAvatarUrl(newAvatarUrl);
    dispatch(updateUserProfile({ avatar: newAvatarUrl }));
  };

  if (!isOpen) return null;

  return (
    <div className="profile-edit-modal-overlay" onClick={onClose}>
      <div className="profile-edit-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Edit Profile</h2>
          <button className="close-button" onClick={onClose} aria-label="Close">
            <RiCloseLine />
          </button>
        </div>

        <div className="modal-body">
          <div className="avatar-section">
            <AvatarUpload
              currentAvatar={avatarUrl}
              onAvatarUpdate={handleAvatarUpdate}
            />
          </div>

          <form onSubmit={handleSubmit}>
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
              <label htmlFor="email">
                Email Address
              </label>
              <input
                type="email"
                id="email"
                value={email || ""}
                disabled
                className="disabled-input"
              />
              <span className="helper-text">Email cannot be changed</span>
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

            <div className="modal-actions">
              <button
                type="button"
                className="btn-secondary"
                onClick={onClose}
                disabled={isLoading}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn-primary"
                disabled={isLoading}
              >
                <RiSaveLine />
                {isLoading ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ProfileEditModal;